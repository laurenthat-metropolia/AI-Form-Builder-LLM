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
    textfields?: ApiFormTextfield[] | null;
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
    textfieldResponses?: ApiFormTextfieldResponse[] | null;
    checkboxResponse?: ApiFormCheckboxResponse[] | null;
    toggleSwitchResponse?: ApiFormToggleSwitchResponse[] | null;
}

export interface ApiFormTextfield {
    id: string;
    form: ApiForm;
    formId: string;
    responses?: ApiFormTextfieldResponse[] | null;
}

export interface ApiFormTextfieldResponse {
    id: string;
    submission: ApiFormSubmission;
    submissionId: string;
    textfield: ApiFormTextfield;
    textfieldId: string;
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
    value: string;
}

export interface ApiImageEvent {
    id: string;
    event: ApiImageEvents;
    payload?: string | null;
    file: ApiUploadedFile;
    fileId: string;
}

export interface ApiUploadedFile {
    id: string;
    owner?: ApiUser | null;
    ownerId?: string | null;
    key: string;
    url: string;
    events?: ApiImageEvent[] | null;
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
