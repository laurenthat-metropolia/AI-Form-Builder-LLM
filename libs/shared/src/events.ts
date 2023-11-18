import { ImageEvent as OImageEvent } from '.prisma/client';
import { TextDetectionResponse } from './azure';
import { ObjectDetectionResponse } from './llm';
import { SupportedFormComponent, UnifiedObjectPrediction, UnifiedPrediction, UnifiedTextPrediction } from './types';

export const ImageEvents = {
    ObjectDetectionResponseReceived: 'ObjectDetectionResponseReceived',
    TextDetectionResponseReceived: 'TextDetectionResponseReceived',
    TextDetectionUnified: 'TextDetectionUnified',
    ObjectDetectionUnified: 'ObjectDetectionUnified',
    ChatGPTRequestSent: 'ChatGPTRequestSent',
    ChatGPTResponseReceived: 'ChatGPTResponseReceived',
    ChatGPTResponseProcessed: 'ChatGPTResponseProcessed',
    UnifiedPredictionCoordinatesRounded: 'UnifiedPredictionCoordinatesRounded',
    UnifiedPredictionsLeveledInYAxis: 'UnifiedPredictionsLeveledInYAxis',
    FormComponentsCreated: 'FormComponentsCreated',
} as const;

export type ObjectDetectionResponseReceivedEventPayload = ObjectDetectionResponse;
export type TextDetectionResponseReceivedEventPayload = TextDetectionResponse;
export type TextDetectionUnifiedEventPayload = UnifiedTextPrediction[];
export type ObjectDetectionUnifiedEventPayload = UnifiedObjectPrediction[];
export type ChatGPTRequestSentEventPayload = Record<string, any>;
export type ChatGPTResponseReceivedEventPayload = Record<string, any>;
export type ChatGPTResponseProcessedEventPayload = any;
export type UnifiedPredictionCoordinatesRoundedEventPayload = UnifiedPrediction[];
export type UnifiedPredictionsLeveledInYAxisEventPayload = UnifiedPrediction[];
export type FormComponentsCreatedEventPayload = SupportedFormComponent[][];

type CommonImageEvent = Omit<OImageEvent, 'payload' | 'event'>;
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
              event: typeof ImageEvents.TextDetectionUnified;
              payload: TextDetectionUnifiedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.ObjectDetectionUnified;
              payload: ObjectDetectionUnifiedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.ChatGPTRequestSent;
              payload: ChatGPTRequestSentEventPayload | null;
          }
        | {
              event: typeof ImageEvents.ChatGPTResponseReceived;
              payload: ChatGPTResponseReceivedEventPayload | null;
          }
        | {
              event: typeof ImageEvents.ChatGPTResponseProcessed;
              payload: ChatGPTResponseProcessedEventPayload | null;
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
    TextDetectionUnified: '#ffbc52',
    ObjectDetectionUnified: '#ff70ce',
    ChatGPTRequestSent: '#27afff',
    ChatGPTResponseReceived: '#e791a9',
    ChatGPTResponseProcessed: '#f48686',
    UnifiedPredictionCoordinatesRounded: '#ffcd33',
    UnifiedPredictionsLeveledInYAxis: '#19fff5',
    FormComponentsCreated: '#000000',
} as const;
