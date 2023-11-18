import { UploadedFile } from '@prisma/client';
import { recognizeObjects } from '../configurations/configObjectDetection';
import { recognizeText } from '../configurations/configAzureVision';
import {
    convertChatGPTOutputToFormComponents,
    generateChatGPTInput,
    processChatGPTOutput,
    sendCommandsToChatGPTApi,
} from '../configurations/configOpenAi';
import {
    BOTTOM_RIGHT_Y_COORDINATE_INDEX,
    ObjectDetectionResponse,
    TextDetectionResponse,
    TOP_LEFT_Y_COORDINATE_INDEX,
    UnifiedObjectPrediction,
    UnifiedPrediction,
    UnifiedTextPrediction,
} from '@draw2form/shared';
import { eventService } from './event.service';

export const processUploadedFile = async (uploadedFile: UploadedFile) => {
    /**
     *
     *  Get Responses from APis and Unify them.
     */
    let objectDetectionResponses = (await recognizeObjects(uploadedFile.url)) ?? [];
    await eventService.createObjectDetectionResponseReceivedEvent(uploadedFile, objectDetectionResponses);

    let textDetectionResponse = (await recognizeText(uploadedFile.url)) ?? [];
    await eventService.createTextDetectionResponseReceivedEvent(uploadedFile, textDetectionResponse);
    /**
     *
     *  Unify.
     */
    const unifiedObjectPredictions = unifyObjectDetection(objectDetectionResponses);
    await eventService.createObjectDetectionUnifiedEvent(uploadedFile, unifiedObjectPredictions);

    const unifiedTextPredictions = unifyTextDetection(textDetectionResponse);
    await eventService.createTextDetectionUnifiedEvent(uploadedFile, unifiedTextPredictions);
    /**
     *
     *  Merge And Round Coordinates
     */
    const predictionsWithRoundedCoordinates = roundCoordinates([
        ...unifiedObjectPredictions,
        ...unifiedTextPredictions,
    ]);
    await eventService.createUnifiedPredictionCoordinatesRoundedEvent(uploadedFile, predictionsWithRoundedCoordinates);
    /**
     *
     *  Level in Y Axis
     */
    const unifiedPredictionsLeveledInYAxis = levelPredictionsInYAxis(predictionsWithRoundedCoordinates);
    await eventService.createUnifiedPredictionsLeveledInYAxisEvent(uploadedFile, unifiedPredictionsLeveledInYAxis);
    /**
     *
     *  Group by Y Axis
     */
    const unifiedPredictionsGroupedByYAxis = groupByYAxis(unifiedPredictionsLeveledInYAxis);
    /**
     *
     *  Create CHATGPT Commands AND Send API Call and Save Event
     *
     */
    const chatGPTInput = generateChatGPTInput(Object.values(unifiedPredictionsGroupedByYAxis));
    await eventService.createChatGPTRequestSentEvent(uploadedFile, chatGPTInput);
    const chatGPTOutput = await sendCommandsToChatGPTApi(chatGPTInput);
    await eventService.createChatGPTResponseReceivedEvent(uploadedFile, chatGPTOutput);
    /**
     *
     *  Process Response
     */
    const processedChatGPTOutput = await processChatGPTOutput(chatGPTOutput);
    await eventService.createChatGPTResponseProcessedEvent(uploadedFile, processedChatGPTOutput);

    /**
     *
     *  Convert to Form Components
     */
    const formComponents = convertChatGPTOutputToFormComponents(processedChatGPTOutput);
    await eventService.createFormComponentsCreatedEvent(uploadedFile, formComponents);
};

export function unifyObjectDetection(objects: ObjectDetectionResponse): UnifiedObjectPrediction[] {
    return objects.map((item) => {
        return {
            type: 'OBJECT_PREDICTION',
            data: {
                class: item.class,
                class_id: item.class_id,
                confidence: item.confidence,
            },
            coordinates: item.coordinates,
        };
    });
}
export function unifyTextDetection(objects: TextDetectionResponse): UnifiedTextPrediction[] {
    return objects.map((item) => {
        return {
            type: 'TEXT_PREDICTION',
            data: {
                text: item.text,
            },
            coordinates: item.coordinates,
        };
    });
}

/**
 * Preprocess the value of these parameters and try to create a normalized structure for the CHATGPT that supports both vertical and horizontal.
 * @param predictions
 */
export function levelPredictionsInYAxis(predictions: UnifiedPrediction[]): UnifiedPrediction[] {
    // Sort by y-axis
    const output: Map<number, UnifiedPrediction> = new Map();

    const sortedByYAxis = predictions.sort(
        (c1, c2) => c1.coordinates[TOP_LEFT_Y_COORDINATE_INDEX] - c2.coordinates[TOP_LEFT_Y_COORDINATE_INDEX],
    );

    for (let referencePrediction of sortedByYAxis) {
        const referencePredictionIndex = sortedByYAxis.indexOf(referencePrediction);
        const referenceTopLeftYCoordinate = referencePrediction.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];
        const referenceBottomRightYCoordinate = referencePrediction.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX];

        const referenceHasBeenMoved = Array.from(output.keys()).includes(referencePredictionIndex);
        if (referenceHasBeenMoved) {
            continue;
        }

        for (let testPrediction of sortedByYAxis) {
            const testPredictionIndex = sortedByYAxis.indexOf(testPrediction);

            // Don't Check with reference.
            if (referencePredictionIndex === testPredictionIndex) {
                continue;
            }

            const testPredictionTopLeftYCoordinate = testPrediction.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];
            const testPredictionBottomRightYCoordinate = testPrediction.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX];

            if (
                testPredictionTopLeftYCoordinate > referenceTopLeftYCoordinate &&
                testPredictionTopLeftYCoordinate < referenceBottomRightYCoordinate
            ) {
                //     Text subject is in the middle of the reference.
                const deltaY = testPredictionTopLeftYCoordinate - referenceTopLeftYCoordinate;
                //     Copy Test Subject
                const textPredictionMoved: UnifiedPrediction = { ...testPrediction };
                //     Move Test Subject
                textPredictionMoved.coordinates[TOP_LEFT_Y_COORDINATE_INDEX] =
                    testPredictionTopLeftYCoordinate - deltaY;
                //     Move Test Subject
                textPredictionMoved.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX] =
                    testPredictionBottomRightYCoordinate - deltaY;
                //     Save Test Subject
                output.set(testPredictionIndex, textPredictionMoved);
                console.log(`Prediction type ${textPredictionMoved.type} Moved in Y Axis: ${deltaY}`);
            } else {
                continue;
            }
        }
    }

    return predictions.map((prediction, index) => {
        if (output.has(index)) {
            return output.get(index) as UnifiedPrediction;
        } else {
            return prediction;
        }
    });
}

export function groupByYAxis(unifiedPredictions: UnifiedPrediction[]): Record<number, UnifiedPrediction[]> {
    return unifiedPredictions.reduce((previousValue, currentValue) => {
        const topLeftYCoordinate = currentValue.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];

        if (previousValue[topLeftYCoordinate] !== undefined) {
            previousValue[topLeftYCoordinate] = [...previousValue[topLeftYCoordinate], currentValue];
        } else {
            previousValue[topLeftYCoordinate] = [currentValue];
        }

        previousValue[topLeftYCoordinate] = previousValue[topLeftYCoordinate].sort(
            (a, b) => a.coordinates[0] - b.coordinates[0],
        );

        return previousValue;
    }, {} as Record<number, UnifiedPrediction[]>);
}

export function roundCoordinates(unifiedPredictions: UnifiedPrediction[]): UnifiedPrediction[] {
    const COORDINATE_ROUNDING_NUMBER = 10;

    return unifiedPredictions.map((prediction) => {
        prediction.coordinates = prediction.coordinates.map(
            (coordinate) => Math.round(coordinate / COORDINATE_ROUNDING_NUMBER) * COORDINATE_ROUNDING_NUMBER,
        ) as [number, number, number, number];
        return prediction;
    });
}
