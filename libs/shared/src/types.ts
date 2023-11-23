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

export interface Identifiable {
    id: number;
}
export interface UnifiedObjectPrediction {
    type: 'OBJECT_PREDICTION';
    kind: string;
    coordinates: [number, number, number, number];
}
export interface UnifiedTextPrediction {
    type: 'TEXT_PREDICTION';
    label: string;
    coordinates: [number, number, number, number];
}

export type IdentifiableUnifiedTextPrediction = UnifiedTextPrediction & Identifiable;
export type IdentifiableUnifiedObjectPrediction = UnifiedObjectPrediction & Identifiable;
export type UnifiedPrediction = IdentifiableUnifiedTextPrediction | IdentifiableUnifiedObjectPrediction;

export interface UiComponentPrediction {
    type: 'UI_CL_PREDICTION';
    id: number;
    kind: string;
    label: string;
    coordinates: [number, number, number, number];
    textCoordinates: [number, number, number, number] | null;
}

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
