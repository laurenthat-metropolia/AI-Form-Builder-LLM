import { UserDatabase } from '../databases/userDatabase';
import {
    ChatGPTRequestSentEventPayload,
    ChatGPTResponseProcessedEventPayload,
    ChatGPTResponseReceivedEventPayload,
    FormComponentsCreatedEventPayload,
    ImageEvents,
    ObjectDetectionResponseReceivedEventPayload,
    ObjectDetectionUnifiedEventPayload,
    TextDetectionResponseReceivedEventPayload,
    TextDetectionUnifiedEventPayload,
    UnifiedPredictionCoordinatesRoundedEventPayload,
    UnifiedPredictionsLeveledInYAxisEventPayload,
} from '@draw2form/shared';
import { UploadedFile } from '@prisma/client';

const createObjectDetectionResponseReceivedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ObjectDetectionResponseReceivedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ObjectDetectionResponseReceived, data);
};
const createTextDetectionResponseReceivedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: TextDetectionResponseReceivedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.TextDetectionResponseReceived, data);
};
const createTextDetectionUnifiedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: TextDetectionUnifiedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.TextDetectionUnified, data);
};
const createObjectDetectionUnifiedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ObjectDetectionUnifiedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ObjectDetectionUnified, data);
};

const createChatGPTRequestSentEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ChatGPTRequestSentEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ChatGPTRequestSent, data);
};
const createChatGPTResponseReceivedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ChatGPTResponseReceivedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ChatGPTResponseReceived, data);
};
const createChatGPTResponseProcessedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ChatGPTResponseProcessedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ChatGPTResponseProcessed, data);
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
    createTextDetectionUnifiedEvent: createTextDetectionUnifiedEvent,
    createObjectDetectionUnifiedEvent: createObjectDetectionUnifiedEvent,
    createChatGPTRequestSentEvent: createChatGPTRequestSentEvent,
    createChatGPTResponseReceivedEvent: createChatGPTResponseReceivedEvent,
    createChatGPTResponseProcessedEvent: createChatGPTResponseProcessedEvent,
    createUnifiedPredictionCoordinatesRoundedEvent: createUnifiedPredictionCoordinatesRoundedEvent,
    createUnifiedPredictionsLeveledInYAxisEvent: createUnifiedPredictionsLeveledInYAxisEvent,
    createFormComponentsCreatedEvent: createFormComponentsCreatedEvent,
};
