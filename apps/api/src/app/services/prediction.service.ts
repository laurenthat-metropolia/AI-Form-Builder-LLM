import { UploadedFile } from '@prisma/client';
import { recognizeObjects } from '../configurations/configObjectDetection';
import { recognizeText } from '../configurations/configAzureVision';
import {
    BOTTOM_RIGHT_X_COORDINATE_INDEX,
    BOTTOM_RIGHT_Y_COORDINATE_INDEX,
    IdentifiableUnifiedObjectPrediction,
    IdentifiableUnifiedTextPrediction,
    ObjectDetectionResponse,
    SupportedFormComponent,
    TextDetectionResponse,
    TOP_LEFT_X_COORDINATE_INDEX,
    TOP_LEFT_Y_COORDINATE_INDEX,
    UiComponentPrediction,
    UnifiedObjectPrediction,
    UnifiedPrediction,
    UnifiedTextPrediction,
} from '@draw2form/shared';
import { eventService } from './event.service';
import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Injectable()
export class PredictionService {
    constructor(private openAIService: OpenaiService) {}

    processUploadedFile = async (
        uploadedFile: UploadedFile,
    ): Promise<{
        name: string;
        components: SupportedFormComponent[];
    }> => {
        /**
         *
         *  Get Responses from APis and Unify them.
         */
        const objectDetectionResponses = await recognizeObjects(uploadedFile.url);
        await eventService.createObjectDetectionResponseReceivedEvent(uploadedFile, objectDetectionResponses);

        const textDetectionResponse = await recognizeText(uploadedFile.url);
        await eventService.createTextDetectionResponseReceivedEvent(uploadedFile, textDetectionResponse);
        /**
         *
         *  Unify.
         */
        const unifiedPredictions: UnifiedPrediction[] = [
            ...this.unifyObjectDetection(objectDetectionResponses),
            ...this.unifyTextDetection(textDetectionResponse),
        ].map(
            (x, index): UnifiedPrediction => ({
                ...x,
                id: index,
            }),
        );

        await eventService.createDetectionsUnifiedEvent(uploadedFile, unifiedPredictions);

        /**
         *
         *  Merge And Round Coordinates
         */
        const unifiedPredictionsWithRoundedCoordinates = this.roundCoordinates(unifiedPredictions);
        await eventService.createUnifiedPredictionCoordinatesRoundedEvent(
            uploadedFile,
            unifiedPredictionsWithRoundedCoordinates,
        );
        /**
         *
         *  Level in Y Axis
         */
        const unifiedPredictionsLeveledInYAxis = this.levelPredictionsInYAxis(unifiedPredictionsWithRoundedCoordinates);
        await eventService.createUnifiedPredictionsLeveledInYAxisEvent(uploadedFile, unifiedPredictionsLeveledInYAxis);
        /**
         *
         *  Create CHATGPT Commands AND Send API Call and Save Event
         *
         */
        const uiPredictions = await this.openAIService.sendCommandsToChatGPTApi<{
            mappedIds: [number, null | number | 'checkbox'][];
        }>(this.openAIService.generateChatGPTInputForLabelMapping(unifiedPredictionsLeveledInYAxis));
        console.log({ uiPredictions });
        const uiComponents = ((): UiComponentPrediction[] => {
            const mappings = uiPredictions.mappedIds
                .map((idMapping): UiComponentPrediction[] => {
                    const [labelId, componentId] = idMapping as [number, null | number | 'checkbox'];
                    const label = unifiedPredictionsLeveledInYAxis.find(
                        (x): x is IdentifiableUnifiedTextPrediction => x.id === labelId,
                    );

                    if (componentId === null) {
                        // No Mapping. Let's count the text as a standalone text
                        return [
                            {
                                type: 'UI_CL_PREDICTION',
                                kind: 'label',
                                coordinates: label.coordinates,
                                label: label.label,
                                id: labelId,
                                textCoordinates: null,
                            },
                        ];
                    }

                    if (typeof componentId === 'number') {
                        const component = unifiedPredictionsLeveledInYAxis.find(
                            (x): x is IdentifiableUnifiedObjectPrediction => x.id === componentId,
                        );
                        return [
                            {
                                type: 'UI_CL_PREDICTION',
                                kind: component.kind,
                                coordinates: component.coordinates,
                                label: label.label,
                                id: labelId,
                                textCoordinates: label.coordinates,
                            },
                        ];
                    } else {
                        return [];
                    }
                })
                .flat();
            const mappedObjectIds = uiPredictions.mappedIds
                .map((x) => x[1])
                .filter((x): x is number => x !== null && typeof x === 'number');
            const mappedTextIds = uiPredictions.mappedIds
                .map((x) => x[0])
                .filter((x): x is number => x !== null && typeof x === 'number');

            const restOfObjects = unifiedPredictionsLeveledInYAxis
                .filter((x): x is IdentifiableUnifiedObjectPrediction => x.type === 'OBJECT_PREDICTION')
                .filter((x) => !mappedObjectIds.includes(x.id))
                .map((component): UiComponentPrediction => {
                    return {
                        type: 'UI_CL_PREDICTION',
                        kind: component.kind,
                        coordinates: component.coordinates,
                        label: 'No Label',
                        id: component.id,
                        textCoordinates: null,
                    };
                });
            const restOfLabels = unifiedPredictionsLeveledInYAxis
                .filter((x): x is IdentifiableUnifiedTextPrediction => x.type === 'TEXT_PREDICTION')
                .filter((x) => !mappedTextIds.includes(x.id))
                .map((component): UiComponentPrediction => {
                    return {
                        type: 'UI_CL_PREDICTION',
                        kind: 'label',
                        coordinates: component.coordinates,
                        label: component.label,
                        id: component.id,
                        textCoordinates: null,
                    };
                });

            return [...mappings, ...restOfObjects, ...restOfLabels].sort((x, y) => x.coordinates[1] - y.coordinates[1]);
        })();
        await eventService.createUIComponentPredictedEvent(uploadedFile, uiComponents);

        // const chatGPTInput = this.openAIService.generateChatGPTInputForFinalJSON(unifiedPredictionsLeveledInYAxis);
        // await eventService.createChatGPTRequestSentEvent(uploadedFile, chatGPTInput);
        // const chatGPTOutput = await this.openAIService.sendCommandsToChatGPTApi(chatGPTInput);
        // await eventService.createChatGPTResponseReceivedEvent(uploadedFile, chatGPTOutput);

        /**
         *
         *  Process Response
         */
        // const processedChatGPTOutput = this.openAIService.processChatGPTOutputForFinalJSON(chatGPTOutput);
        // await eventService.createChatGPTResponseProcessedEvent(uploadedFile, processedChatGPTOutput);

        /**
         *
         *  Convert to Form Components
         */
        const formComponents = this.openAIService.convertChatGPTOutputToFormComponents(uiComponents);
        await eventService.createFormComponentsCreatedEvent(uploadedFile, formComponents);

        return {
            name: 'Form',
            components: formComponents,
        };
    };

    unifyObjectDetection(objects: ObjectDetectionResponse): UnifiedObjectPrediction[] {
        return objects.map((item): UnifiedObjectPrediction => {
            return {
                type: 'OBJECT_PREDICTION',
                kind: item.class,
                coordinates: item.coordinates,
            };
        });
    }

    unifyTextDetection(objects: TextDetectionResponse): UnifiedTextPrediction[] {
        return objects.map((item) => {
            return {
                type: 'TEXT_PREDICTION',
                label: item.text,
                coordinates: item.coordinates,
            };
        });
    }

    /**
     * Preprocess the value of these parameters and try to create a normalized structure for the CHATGPT that supports both vertical and horizontal.
     * @param predictions
     */
    levelPredictionsInYAxis(predictions: UnifiedPrediction[]): UnifiedPrediction[] {
        // Sort by y-axis
        const output: Map<number, UnifiedPrediction> = new Map();

        const sortedByYAxis = predictions.sort(
            (c1, c2) => c1.coordinates[TOP_LEFT_Y_COORDINATE_INDEX] - c2.coordinates[TOP_LEFT_Y_COORDINATE_INDEX],
        );

        for (const referencePrediction of sortedByYAxis) {
            const referencePredictionIndex = sortedByYAxis.indexOf(referencePrediction);
            const referenceTopLeftYCoordinate = referencePrediction.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];
            const referenceBottomRightYCoordinate = referencePrediction.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX];

            const referenceHasBeenMoved = Array.from(output.keys()).includes(referencePredictionIndex);
            if (referenceHasBeenMoved) {
                continue;
            }

            for (const testPrediction of sortedByYAxis) {
                const testPredictionIndex = sortedByYAxis.indexOf(testPrediction);

                // Don't Check with reference.
                if (referencePredictionIndex === testPredictionIndex) {
                    continue;
                }

                const testPredictionTopLeftYCoordinate = testPrediction.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];
                const testPredictionBottomRightYCoordinate =
                    testPrediction.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX];

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

    /**
     * Preprocess the value of these parameters and try to create a normalized structure for the CHATGPT that supports both vertical and horizontal.
     * @param predictions
     */
    levelPredictionsInXAxis(predictions: UnifiedPrediction[]): UnifiedPrediction[] {
        // Sort by x-axis
        const output: Map<number, UnifiedPrediction> = new Map();

        const sortedByXAxis = predictions.sort(
            (c1, c2) => c1.coordinates[TOP_LEFT_X_COORDINATE_INDEX] - c2.coordinates[TOP_LEFT_X_COORDINATE_INDEX],
        );

        for (const referencePrediction of sortedByXAxis) {
            const referencePredictionIndex = sortedByXAxis.indexOf(referencePrediction);
            const referenceTopLeftXCoordinate = referencePrediction.coordinates[TOP_LEFT_X_COORDINATE_INDEX];
            const referenceBottomRightXCoordinate = referencePrediction.coordinates[BOTTOM_RIGHT_X_COORDINATE_INDEX];

            const referenceHasBeenMoved = Array.from(output.keys()).includes(referencePredictionIndex);
            if (referenceHasBeenMoved) {
                continue;
            }

            for (const testPrediction of sortedByXAxis) {
                const testPredictionIndex = sortedByXAxis.indexOf(testPrediction);

                // Don't Check with reference.
                if (referencePredictionIndex === testPredictionIndex) {
                    continue;
                }

                const testPredictionTopLeftXCoordinate = testPrediction.coordinates[TOP_LEFT_X_COORDINATE_INDEX];
                const testPredictionBottomRightXCoordinate =
                    testPrediction.coordinates[BOTTOM_RIGHT_X_COORDINATE_INDEX];

                if (
                    testPredictionTopLeftXCoordinate > referenceTopLeftXCoordinate &&
                    testPredictionTopLeftXCoordinate < referenceBottomRightXCoordinate
                ) {
                    //     Text subject is in the middle of the reference.
                    const deltaX = testPredictionTopLeftXCoordinate - referenceTopLeftXCoordinate;
                    //     Copy Test Subject
                    const textPredictionMoved: UnifiedPrediction = { ...testPrediction };
                    //     Move Test Subject
                    textPredictionMoved.coordinates[TOP_LEFT_X_COORDINATE_INDEX] =
                        testPredictionTopLeftXCoordinate - deltaX;
                    //     Move Test Subject
                    textPredictionMoved.coordinates[BOTTOM_RIGHT_X_COORDINATE_INDEX] =
                        testPredictionBottomRightXCoordinate - deltaX;
                    //     Save Test Subject
                    output.set(testPredictionIndex, textPredictionMoved);
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

    groupByYAxis(unifiedPredictions: UnifiedPrediction[]): Record<number, UnifiedPrediction[]> {
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

    roundCoordinates(unifiedPredictions: UnifiedPrediction[]): UnifiedPrediction[] {
        const COORDINATE_ROUNDING_NUMBER = 10;

        return unifiedPredictions.map((prediction) => {
            prediction.coordinates = prediction.coordinates.map(
                (coordinate) => Math.round(coordinate / COORDINATE_ROUNDING_NUMBER) * COORDINATE_ROUNDING_NUMBER,
            ) as [number, number, number, number];
            return prediction;
        });
    }
}
