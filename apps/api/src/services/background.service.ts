import { UploadedFile } from '@prisma/client';
import { UserDatabase } from '../databases/userDatabase';
import {
  ObjectDetectionResponse,
  ObjectDetectionResponseItem,
  recognizeObjects,
} from '../configurations/configObjectDetection';
import { ImageEvents } from '../enums';
import {
  recognizeText,
  TextDetectionResponse,
  TextDetectionResponseItem,
} from '../configurations/configAzureVision';
import { generateFormStructure } from '../configurations/configOpenAi';
export const TOP_LEFT_Y_COORDINATE_INDEX = 1;
export const BOTTOM_RIGHT_Y_COORDINATE_INDEX = 3;
export const processUploadedFile = async (uploadedFile: UploadedFile) => {
  const COORDINATE_ROUNDING_NUMBER = 10;

  let objectDetectionResponses = await recognizeObjects(uploadedFile.url);
  if (objectDetectionResponses) {
    objectDetectionResponses = objectDetectionResponses.map(
      (objectDetectionResponse) => {
        objectDetectionResponse.coordinates =
          objectDetectionResponse.coordinates.map(
            (coordinate) =>
              Math.round(coordinate / COORDINATE_ROUNDING_NUMBER) *
              COORDINATE_ROUNDING_NUMBER
          ) as [number, number, number, number];
        return objectDetectionResponse;
      }
    );
  }
  await UserDatabase.upsertImageEvent(
    uploadedFile.id,
    ImageEvents.OBJECT_DETECTION_COMPLETED,
    objectDetectionResponses ? JSON.stringify(objectDetectionResponses) : null
  );

  let textDetectionResponse = await recognizeText(uploadedFile.url);
  if (textDetectionResponse) {
    textDetectionResponse = textDetectionResponse.map((textDetection) => {
      // Round the coordinates
      textDetection.coordinates = textDetection.coordinates.map(
        (c) =>
          Math.round(c / COORDINATE_ROUNDING_NUMBER) *
          COORDINATE_ROUNDING_NUMBER
      ) as [number, number, number, number];
      return textDetection;
    });
  }
  await UserDatabase.upsertImageEvent(
    uploadedFile.id,
    ImageEvents.TEXT_DETECTION_COMPLETED,
    textDetectionResponse ? JSON.stringify(textDetectionResponse) : null
  );

  if (objectDetectionResponses && textDetectionResponse) {
    const unifiedDetections = unifyDetections(
      objectDetectionResponses,
      textDetectionResponse
    );
    const unifiedPredictions = preprocessChatGPTInput(unifiedDetections);

    await UserDatabase.upsertImageEvent(
      uploadedFile.id,
      ImageEvents.PREDICTIONS_UNIFIED,
      JSON.stringify(unifiedPredictions)
    );

    const groupedByYAxis = unifiedPredictions.reduce(
      (previousValue, currentValue) => {
        const topLeftYCoordinate =
          currentValue.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];

        if (previousValue[topLeftYCoordinate] !== undefined) {
          previousValue[topLeftYCoordinate] = [
            ...previousValue[topLeftYCoordinate],
            currentValue,
          ];
        } else {
          previousValue[topLeftYCoordinate] = [currentValue];
        }

        previousValue[topLeftYCoordinate] = previousValue[
          topLeftYCoordinate
        ].sort((a, b) => a.coordinates[0] - b.coordinates[0]);

        return previousValue;
      },
      {} as Record<number, UnifiedPrediction[]>
    );
    const chatGPTInput = Object.values(groupedByYAxis);
    const structureGenerationResponse = await generateFormStructure(
      chatGPTInput
    );

    await UserDatabase.upsertImageEvent(
      uploadedFile.id,
      ImageEvents.STRUCTURE_GENERATION_COMPLETED,
      structureGenerationResponse
        ? JSON.stringify(structureGenerationResponse)
        : null
    );
  }
};

export interface UnifiedObjectPrediction {
  type: 'OBJECT_PREDICTION';
  data: Omit<ObjectDetectionResponseItem, 'coordinates'>;
  coordinates: [number, number, number, number];
}
export interface UnifiedTextPrediction {
  type: 'TEXT_PREDICTION';
  data: Omit<TextDetectionResponseItem, 'coordinates'>;
  coordinates: [number, number, number, number];
}

export type UnifiedPrediction = UnifiedObjectPrediction | UnifiedTextPrediction;

export function unifyDetections(
  objects: ObjectDetectionResponse,
  texts: TextDetectionResponse
): UnifiedPrediction[] {
  const unifiedObjectDetection: UnifiedObjectPrediction[] = objects.map(
    (item) => {
      return {
        type: 'OBJECT_PREDICTION',
        data: {
          class: item.class,
          class_id: item.class_id,
          confidence: item.confidence,
        },
        coordinates: item.coordinates,
      };
    }
  );
  const unifiedTextDetection: UnifiedTextPrediction[] = texts.map((item) => {
    return {
      type: 'TEXT_PREDICTION',
      data: {
        text: item.text,
      },
      coordinates: item.coordinates,
    };
  });

  return [...unifiedObjectDetection, ...unifiedTextDetection];
}

/**
 * Preprocess the value of these parameters and try to create a normalized structure for the CHATGPT that supports both vertical and horizontal.
 * @param predictions
 */
export function preprocessChatGPTInput(predictions: UnifiedPrediction[]) {
  console.log('preprocessChatGPTInput: ', predictions.length);

  // Sort by y axis

  const output: Map<number, UnifiedPrediction> = new Map();

  const sortedByYAxis = predictions.sort(
    (c1, c2) =>
      c1.coordinates[TOP_LEFT_Y_COORDINATE_INDEX] -
      c2.coordinates[TOP_LEFT_Y_COORDINATE_INDEX]
  );

  for (let referencePrediction of sortedByYAxis) {
    console.log(`Reference is ${referencePrediction.coordinates}`);
    const referencePredictionIndex = sortedByYAxis.indexOf(referencePrediction);
    const referenceTopLeftYCoordinate =
      referencePrediction.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];
    const referenceBottomRightYCoordinate =
      referencePrediction.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX];

    const referenceHasBeenMoved = Array.from(output.keys()).includes(
      referencePredictionIndex
    );
    if (referenceHasBeenMoved) {
      continue;
    }

    for (let testPrediction of sortedByYAxis) {
      console.log(`test prediction is ${testPrediction.coordinates}`);

      const testPredictionIndex = sortedByYAxis.indexOf(testPrediction);

      // Don't Check with reference.
      if (referencePredictionIndex === testPredictionIndex) {
        continue;
      }

      const testPredictionTopLeftYCoordinate =
        testPrediction.coordinates[TOP_LEFT_Y_COORDINATE_INDEX];
      const testPredictionBottomRightYCoordinate =
        testPrediction.coordinates[BOTTOM_RIGHT_Y_COORDINATE_INDEX];

      if (
        testPredictionTopLeftYCoordinate > referenceTopLeftYCoordinate &&
        testPredictionTopLeftYCoordinate < referenceBottomRightYCoordinate
      ) {
        //     Text subject is in the middle of the reference.
        const deltaY =
          testPredictionTopLeftYCoordinate - referenceTopLeftYCoordinate;
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
        console.log(
          `Prediction type ${textPredictionMoved.type} Moved in Y Axis: ${deltaY}`
        );
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
