import { UploadedFile } from '@prisma/client';
import { UserDatabase } from '../databases/userDatabase.js';
import { recognizeObjects } from '../configurations/configObjectDetection.js';
import { ImageEvents } from '../enums.js';
import { recognizeText } from '../configurations/configAzureVision.js';
import { generateFormStructure } from '../configurations/configOpenAi.js';

export const processUploadedFile = async (uploadedFile: UploadedFile) => {
    const objectDetectionResponse = await recognizeObjects(uploadedFile.url);
    await UserDatabase.upsertImageEvent(
        uploadedFile.id,
        ImageEvents.OBJECT_DETECTION_COMPLETED,
        objectDetectionResponse ? JSON.stringify(objectDetectionResponse) : null,
    );

    const textDetectionResponse = await recognizeText(uploadedFile.url);
    await UserDatabase.upsertImageEvent(
        uploadedFile.id,
        ImageEvents.TEXT_DETECTION_COMPLETED,
        textDetectionResponse ? JSON.stringify(textDetectionResponse) : null,
    );
    if (objectDetectionResponse && textDetectionResponse) {
        const structureGenerationResponse = await generateFormStructure(objectDetectionResponse, textDetectionResponse);
        await UserDatabase.upsertImageEvent(
            uploadedFile.id,
            ImageEvents.STRUCTURE_GENERATION_COMPLETED,
            structureGenerationResponse ? JSON.stringify(structureGenerationResponse) : null,
        );
    }
};
