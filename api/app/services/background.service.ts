import { UploadedFile } from '@prisma/client';
import { UserDatabase } from '../databases/userDatabase.js';
import { recognizeObjects } from '../configurations/configObjectDetection.js';
import { ImageEvents } from '../enums.js';
import { recognizeText } from '../configurations/configAzureVision.js';
import { generateFormStructure } from '../configurations/configOpenAi.js';

export const processUploadedFile = async (uploadedFile: UploadedFile) => {
    const COORDINATE_ROUNDING_NUMBER = 10;

    let objectDetectionResponses = await recognizeObjects(uploadedFile.url);
    if (objectDetectionResponses) {
        objectDetectionResponses = objectDetectionResponses.map((objectDetectionResponse) => {
            objectDetectionResponse.coordinates = objectDetectionResponse.coordinates.map(
                (coordinate) => Math.round(coordinate / COORDINATE_ROUNDING_NUMBER) * COORDINATE_ROUNDING_NUMBER,
            );
            return objectDetectionResponse;
        });
    }
    await UserDatabase.upsertImageEvent(
        uploadedFile.id,
        ImageEvents.OBJECT_DETECTION_COMPLETED,
        objectDetectionResponses ? JSON.stringify(objectDetectionResponses) : null,
    );

    let textDetectionResponse = await recognizeText(uploadedFile.url);
    if (textDetectionResponse) {
        textDetectionResponse = textDetectionResponse.map((textDetection) => {
            const xCoordinates = textDetection.boundingBox.filter((c, index) => index % 2 === 0);
            const yCoordinates = textDetection.boundingBox.filter((c, index) => index % 2 !== 0);
            const x0 = Math.min(...xCoordinates);
            const y0 = Math.min(...yCoordinates);
            const x1 = Math.max(...xCoordinates);
            const y1 = Math.max(...yCoordinates);
            textDetection.boundingBox = [x0, y0, x1, y1].map(
                (c) => Math.round(c / COORDINATE_ROUNDING_NUMBER) * COORDINATE_ROUNDING_NUMBER,
            );
            return textDetection;
        });
    }
    await UserDatabase.upsertImageEvent(
        uploadedFile.id,
        ImageEvents.TEXT_DETECTION_COMPLETED,
        textDetectionResponse ? JSON.stringify(textDetectionResponse) : null,
    );
    if (objectDetectionResponses && textDetectionResponse) {
        const structureGenerationResponse = await generateFormStructure(
            objectDetectionResponses,
            textDetectionResponse,
        );

        await UserDatabase.upsertImageEvent(
            uploadedFile.id,
            ImageEvents.STRUCTURE_GENERATION_COMPLETED,
            structureGenerationResponse ? JSON.stringify(structureGenerationResponse) : null,
        );
    }
};
