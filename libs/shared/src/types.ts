import {
    FormButton,
    FormCheckbox,
    FormImage,
    FormLabel,
    FormTextField,
    FormToggleSwitch,
    UploadedFile,
} from '@prisma/client';
import { IdentifiableImageEvent } from './events';
import { TextDetectionResponseItem } from './azure';
import { ObjectDetectionResponseItem } from './llm';

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

export type SupportedFormComponent =
    | ['FormTextField', FormTextField]
    | ['FormCheckbox', FormCheckbox]
    | ['FormButton', FormButton]
    | ['FormImage', FormImage]
    | ['FormLabel', FormLabel]
    | ['FormToggleSwitch', FormToggleSwitch];

export interface UploadedFileWithIdentifiableImageEvents extends Omit<UploadedFile, 'events'> {
    events?: IdentifiableImageEvent[];
}
