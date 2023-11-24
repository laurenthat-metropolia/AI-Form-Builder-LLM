import { ImageEvent as OImageEvent } from '.prisma/client';
import { TextDetectionResponse } from './azure';
import { ObjectDetectionResponse } from './llm';
import { SupportedFormComponent, UnifiedPrediction } from './types';

export const ImageEvents = {
    ObjectDetectionResponseReceived: 'ObjectDetectionResponseReceived',
    TextDetectionResponseReceived: 'TextDetectionResponseReceived',
    PredictionsUnified: 'PredictionsUnified',
    UnifiedPredictionCoordinatesRounded: 'UnifiedPredictionCoordinatesRounded',
    UnifiedPredictionsLeveledInYAxis: 'UnifiedPredictionsLeveledInYAxis',
    ChatGPT4ImageDescribed: 'ChatGPT4ImageDescribed',
    ChatGPT3P5JsonGenerated: 'ChatGPT3P5JsonGenerated',
    FormComponentsCreated: 'FormComponentsCreated',
} as const;

export type ObjectDetectionResponseReceivedEventPayload = ObjectDetectionResponse;
export type TextDetectionResponseReceivedEventPayload = TextDetectionResponse;
export type PredictionsUnifiedEventPayload = UnifiedPrediction[];
export type UnifiedPredictionCoordinatesRoundedEventPayload = UnifiedPrediction[];
export type UnifiedPredictionsLeveledInYAxisEventPayload = UnifiedPrediction[];
export type ChatGPT4ImageDescribedPayload = { message: string };
export type ChatGPT3P5JsonGeneratedEventPayload = Record<string, any>;
export type FormComponentsCreatedEventPayload = SupportedFormComponent[];

export type IdentifiableImageEvent = Omit<OImageEvent, 'payload' | 'event'> &
    (
        | {
              event: typeof ImageEvents.ObjectDetectionResponseReceived;
              payload: ObjectDetectionResponseReceivedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.TextDetectionResponseReceived;
              payload: TextDetectionResponseReceivedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.PredictionsUnified;
              payload: PredictionsUnifiedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.ChatGPT4ImageDescribed;
              payload: ChatGPT4ImageDescribedPayload | null;
          }
        | {
              event: typeof ImageEvents.ChatGPT3P5JsonGenerated;
              payload: ChatGPT3P5JsonGeneratedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.UnifiedPredictionCoordinatesRounded;
              payload: UnifiedPredictionCoordinatesRoundedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.UnifiedPredictionsLeveledInYAxis;
              payload: UnifiedPredictionsLeveledInYAxisEventPayload | null;
          }
        | {
              event: typeof ImageEvents.FormComponentsCreated;
              payload: FormComponentsCreatedEventPayload | null;
          }
    );

export const hideImageEventsValue: Record<string, boolean> = Object.keys(ImageEvents).reduce(
    (p, c) => ({ ...p, [c]: true }),
    {},
);
export const showImageEventsValue: Record<string, boolean> = Object.keys(ImageEvents).reduce(
    (p, c) => ({ ...p, [c]: false }),
    {},
);

export const ImageEventsColors: Record<keyof typeof ImageEvents, string> = {
    ObjectDetectionResponseReceived: '#ff646b',
    TextDetectionResponseReceived: '#46ff2a',
    PredictionsUnified: '#ffbc52',
    ChatGPT4ImageDescribed: '#27afff',
    ChatGPT3P5JsonGenerated: '#e791a9',
    UnifiedPredictionCoordinatesRounded: '#ffcd33',
    UnifiedPredictionsLeveledInYAxis: '#19fff5',
    FormComponentsCreated: '#000000',
} as const;
