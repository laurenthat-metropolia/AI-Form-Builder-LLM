import { UserDatabase } from '../databases/userDatabase';
import {
    ChatGPT3P5JsonGeneratedEventPayload,
    FormComponentsCreatedEventPayload,
    ImageEvents,
    ObjectDetectionResponseReceivedEventPayload,
    TextDetectionResponseReceivedEventPayload,
    UnifiedPrediction,
    UnifiedPredictionCoordinatesRoundedEventPayload,
    UnifiedPredictionsLeveledInYAxisEventPayload,
} from '@draw2form/shared';
import { UploadedFile } from '@prisma/client';

const createObjectDetectionResponseReceivedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ObjectDetectionResponseReceivedEventPayload | null,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ObjectDetectionResponseReceived, data);
};
const createTextDetectionResponseReceivedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: TextDetectionResponseReceivedEventPayload | null,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.TextDetectionResponseReceived, data);
};
const createPredictionsUnifiedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: UnifiedPrediction[] | null,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.PredictionsUnified, data);
};
const createChatGPT4ImageDescribedEvent = async (uploadedFile: Pick<UploadedFile, 'id'>, data: { message: string }) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ChatGPT4ImageDescribed, { message: data });
};

const createChatGPT3P5JsonGeneratedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ChatGPT3P5JsonGeneratedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ChatGPT3P5JsonGenerated, data);
};

const createUnifiedPredictionCoordinatesRoundedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: UnifiedPredictionCoordinatesRoundedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.UnifiedPredictionCoordinatesRounded, data);
};
const createUnifiedPredictionsLeveledInYAxisEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: UnifiedPredictionsLeveledInYAxisEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.UnifiedPredictionsLeveledInYAxis, data);
};
const createFormComponentsCreatedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: FormComponentsCreatedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.FormComponentsCreated, data);
};

export const eventService = {
    createObjectDetectionResponseReceivedEvent: createObjectDetectionResponseReceivedEvent,
    createTextDetectionResponseReceivedEvent: createTextDetectionResponseReceivedEvent,
    createPredictionsUnifiedEvent: createPredictionsUnifiedEvent,
    createChatGPT3P5JsonGeneratedEvent: createChatGPT3P5JsonGeneratedEvent,
    createUnifiedPredictionCoordinatesRoundedEvent: createUnifiedPredictionCoordinatesRoundedEvent,
    createUnifiedPredictionsLeveledInYAxisEvent: createUnifiedPredictionsLeveledInYAxisEvent,
    createFormComponentsCreatedEvent: createFormComponentsCreatedEvent,
    createChatGPT4ImageDescribedEvent: createChatGPT4ImageDescribedEvent,
};
