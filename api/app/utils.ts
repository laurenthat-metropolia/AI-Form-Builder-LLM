import { UploadedFile } from '@prisma/client';
import { fetchPopulatedUploadedFile } from './databases/userDatabase.js';

export const safeParse = (input: any): any => {
    try {
        return JSON.parse(input);
    } catch (e) {
        return null;
    }
};

export const parseUploadedFile = (uploadedFile: Awaited<ReturnType<typeof fetchPopulatedUploadedFile>>) => {
    if (!uploadedFile) {
        return null;
    }
    const events =
        uploadedFile.events?.map((event) => {
            const parsed = safeParse(event.payload);
            const secondParse = typeof parsed === 'string' ? safeParse(parsed) : parsed;
            return {
                ...event,
                parsedPayload: secondParse ?? parsed ?? event.payload,
            };
        }) ?? [];
    uploadedFile.events = events;

    return uploadedFile;
};
