import { UserDatabase } from '../databases/userDatabase';
import {
    ChatGPTRequestSentEventPayload,
    ChatGPTResponseProcessedEventPayload,
    ChatGPTResponseReceivedEventPayload,
    FormComponentsCreatedEventPayload,
    ImageEvents,
    ObjectDetectionResponseReceivedEventPayload,
    TextDetectionResponseReceivedEventPayload,
    UIComponentPredictedEventPayload,
    UnifiedPrediction,
    UnifiedPredictionCoordinatesRoundedEventPayload,
    UnifiedPredictionsLeveledInXAxisEventPayload,
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
const createDetectionsUnifiedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: UnifiedPrediction[] | null,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.DetectionsUnified, data);
};

const createChatGPTRequestSentEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: ChatGPTRequestSentEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.ChatGPTRequestSent, data);
};

const createUIComponentPredictedEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: UIComponentPredictedEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.UIComponentPredicted, data);
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
const createUnifiedPredictionsLeveledInXAxisEvent = async (
    uploadedFile: Pick<UploadedFile, 'id'>,
    data: UnifiedPredictionsLeveledInXAxisEventPayload,
) => {
    await UserDatabase.upsertImageEvent(uploadedFile.id, ImageEvents.UnifiedPredictionsLeveledInXAxis, data);
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
    createDetectionsUnifiedEvent: createDetectionsUnifiedEvent,
    createChatGPTRequestSentEvent: createChatGPTRequestSentEvent,
    createChatGPTResponseReceivedEvent: createChatGPTResponseReceivedEvent,
    createChatGPTResponseProcessedEvent: createChatGPTResponseProcessedEvent,
    createUnifiedPredictionCoordinatesRoundedEvent: createUnifiedPredictionCoordinatesRoundedEvent,
    createUnifiedPredictionsLeveledInYAxisEvent: createUnifiedPredictionsLeveledInYAxisEvent,
    createUnifiedPredictionsLeveledInXAxisEvent: createUnifiedPredictionsLeveledInXAxisEvent,
    createFormComponentsCreatedEvent: createFormComponentsCreatedEvent,
    createUIComponentPredictedEvent: createUIComponentPredictedEvent,
};
