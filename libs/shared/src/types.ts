import {
    FormButton,
    FormCheckbox,
    FormCheckboxResponse,
    FormImage,
    FormLabel,
    FormTextField,
    FormTextFieldResponse,
    FormToggleSwitch,
    FormToggleSwitchResponse,
    Prisma,
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

export class UIComponent {
    textField: FormTextField | null = null;
    textFieldResponse: FormTextFieldResponse | null = null;
    checkbox: FormCheckbox | null = null;
    checkboxResponse: FormCheckboxResponse | null = null;
    button: FormButton | null = null;
    image: FormImage | null = null;
    label: FormLabel | null = null;
    toggleSwitch: FormToggleSwitch | null = null;
    toggleSwitchResponse: FormToggleSwitchResponse | null = null;

    get order(): number {
        return (
            this.textField?.order ??
            this.checkbox?.order ??
            this.button?.order ??
            this.image?.order ??
            this.label?.order ??
            this.toggleSwitch?.order ??
            0
        );
    }

    static fromTextField(textField: FormTextField): UIComponent {
        const cl = new UIComponent();
        cl.textField = textField;
        cl.textFieldResponse = {
            textFieldId: textField.id,
            id: '',
            value: '',
            submissionId: '',
        };
        return cl;
    }
    static fromCheckbox(checkbox: FormCheckbox): UIComponent {
        const cl = new UIComponent();
        cl.checkbox = checkbox;
        cl.checkboxResponse = {
            id: '',
            value: false,
            checkboxId: checkbox.id,
            submissionId: '',
        };
        return cl;
    }
    static fromToggleSwitch(toggleSwitch: FormToggleSwitch): UIComponent {
        const cl = new UIComponent();
        cl.toggleSwitch = toggleSwitch;
        cl.toggleSwitchResponse = {
            id: '',
            value: false,
            submissionId: '',
            toggleSwitchId: toggleSwitch.id,
        };
        return cl;
    }
    static fromButton(button: FormButton): UIComponent {
        const cl = new UIComponent();
        cl.button = button;
        return cl;
    }
    static fromImage(image: FormImage): UIComponent {
        const cl = new UIComponent();
        cl.image = image;
        return cl;
    }
    static fromLabel(label: FormLabel): UIComponent {
        const cl = new UIComponent();
        cl.label = label;
        return cl;
    }

    static fromForm(form: FormFullType): UIComponent[] {
        const textFields = form.textFields?.map((x) => this.fromTextField(x));
        const checkboxes = form.checkboxes?.map((x) => this.fromCheckbox(x));
        const buttons = form.buttons?.map((x) => this.fromButton(x));
        const images = form.images?.map((x) => this.fromImage(x));
        const labels = form.labels?.map((x) => this.fromLabel(x));
        const toggleSwitches = form.toggleSwitches?.map((x) => this.fromToggleSwitch(x));
        return [...textFields, ...checkboxes, ...buttons, ...images, ...labels, ...toggleSwitches];
    }
}

export type FormFullType = Prisma.FormGetPayload<{ select: { [K in keyof Required<Prisma.FormSelect>]: true } }>;
