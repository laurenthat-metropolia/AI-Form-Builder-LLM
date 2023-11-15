declare global {
    interface Window {
        Annotorious: any;
    }
}

export interface ApiUser {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    forms?: ApiForm[] | null;
    formSubmission?: ApiFormSubmission[] | null;
    uploads?: ApiUploadedFile[] | null;
}

export interface ApiForm {
    id: string;
    name: string;
    available: boolean;
    owner?: ApiUser;
    ownerId: string;
    textFields?: ApiFormTextField[] | null;
    checkboxes?: ApiFormCheckbox[] | null;
    toggleSwitches?: ApiFormToggleSwitch[] | null;
    images?: ApiFormImage[] | null;
    buttons?: ApiFormButton[] | null;
    labels?: ApiFormLabel[] | null;
    formSubmissinos?: ApiFormSubmission[] | null;
}

export interface ApiFormSubmission {
    id: string;
    name: string;
    public: boolean;
    owner: ApiUser;
    ownerId: string;
    form: ApiForm;
    formId: string;
    textFieldResponses?: ApiFormTextFieldResponse[] | null;
    checkboxResponse?: ApiFormCheckboxResponse[] | null;
    toggleSwitchResponse?: ApiFormToggleSwitchResponse[] | null;
}

export interface ApiFormTextField {
    id: string;
    form: ApiForm;
    formId: string;
    order: number;
    label: string;
    responses?: ApiFormTextFieldResponse[] | null;
}

export interface ApiFormTextFieldResponse {
    id: string;
    submission: ApiFormSubmission;
    submissionId: string;
    textField: ApiFormTextField;
    textFieldId: string;
    value: string;
}

export interface ApiFormCheckbox {
    id: string;
    label: string;
    form: ApiForm;
    formId: string;
    order: number;
    responses?: ApiFormCheckboxResponse[] | null;
}

export interface ApiFormCheckboxResponse {
    id: string;
    submission: ApiFormSubmission;
    submissionId: string;
    checkbox: ApiFormCheckbox;
    checkboxId: string;
    value: string;
}

export interface ApiFormToggleSwitch {
    id: string;
    label: string;
    form: ApiForm;
    formId: string;
    order: number;
    responses?: ApiFormToggleSwitchResponse[] | null;
}

export interface ApiFormToggleSwitchResponse {
    id: string;
    submission: ApiFormSubmission;
    submissionId: string;
    toggleSwitch: ApiFormToggleSwitch;
    toggleSwitchId: string;
    value: string;
}

export interface ApiFormImage {
    id: string;
    form: ApiForm;
    formId: string;
    order: number;
    imageId: string;
}

export interface ApiFormButton {
    id: string;
    label: string;
    form: ApiForm;
    formId: string;
    order: number;
    type: string;
}

export interface ApiFormLabel {
    id: string;
    form: ApiForm;
    formId: string;
    order: number;
    label: string;
}

export interface ApiUploadedFile {
    id: string;
    owner?: ApiUser | null;
    ownerId?: string | null;
    key: string;
    url: string;
    events?: ApiImageEvent[] | null;
}

export interface ApiUploadedFileWithParsedPayload {
    id: string;
    owner?: ApiUser | null;
    ownerId?: string | null;
    key: string;
    url: string;
    events?: (ApiImageObjectDetectionEvent | ApiImageTextDetectionEvent | ApiFormGenerationEvent)[] | null;
}

export interface ApiImageEvent {
    id: string;
    event: ApiImageEvents;
    payload?: string | null;
    file?: ApiUploadedFile;
    fileId: string;
}

export interface ApiImageObjectDetectionEvent {
    id: string;
    event: 'OBJECT_DETECTION_COMPLETED';
    payload?: string | null;
    file?: ApiUploadedFile;
    fileId: string;
    parsedPayload:
        | null
        | {
              x: number;
              y: number;
              width: number;
              height: number;
              confidence: number;
              class: string;
              class_id: number;
              coordinates: [number, number, number, number];
          }[];
}

export interface ApiImageTextDetectionEvent {
    id: string;
    event: 'TEXT_DETECTION_COMPLETED';
    payload?: string | null;
    file?: ApiUploadedFile;
    fileId: string;
    parsedPayload:
        | null
        | {
              text: string;
              boundingBox: [number, number, number, number];
          }[];
}
export interface ApiFormGenerationEvent {
    id: string;
    event: 'STRUCTURE_GENERATION_COMPLETED';
    payload?: string | null;
    file?: ApiUploadedFile;
    fileId: string;
    parsedPayload: (
        | ['FormTextField', ApiFormTextField, any]
        | ['FormCheckbox', ApiFormCheckbox, any]
        | ['FormButton', ApiFormButton, any]
        | ['FormImage', ApiFormImage, any]
        | ['FormLabel', ApiFormLabel, any]
        | ['FormToggleSwitch', ApiFormToggleSwitch, any]
    )[];
}
export enum ApiImageEvents {
    /**
     * Output of LLM
     */
    OBJECT_DETECTION_COMPLETED = 'OBJECT_DETECTION_COMPLETED',
    /**
     * Output Azure Vision
     */
    TEXT_DETECTION_COMPLETED = 'TEXT_DETECTION_COMPLETED',
    /**
     * Output ChatGPT
     */
    STRUCTURE_GENERATION_COMPLETED = 'STRUCTURE_GENERATION_COMPLETED',
}
