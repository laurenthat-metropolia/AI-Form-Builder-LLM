import { User as _User } from './user';
import { Form as _Form } from './form';
import { FormSubmission as _FormSubmission } from './form_submission';
import { FormTextField as _FormTextField } from './form_text_field';
import { FormTextFieldResponse as _FormTextFieldResponse } from './form_text_field_response';
import { FormCheckbox as _FormCheckbox } from './form_checkbox';
import { FormCheckboxResponse as _FormCheckboxResponse } from './form_checkbox_response';
import { FormToggleSwitch as _FormToggleSwitch } from './form_toggle_switch';
import { FormToggleSwitchResponse as _FormToggleSwitchResponse } from './form_toggle_switch_response';
import { FormImage as _FormImage } from './form_image';
import { FormButton as _FormButton } from './form_button';
import { FormLabel as _FormLabel } from './form_label';
import { ImageEvent as _ImageEvent } from './image_event';
import { UploadedFile as _UploadedFile } from './uploaded_file';

export namespace PrismaModel {
    export class User extends _User {}
    export class Form extends _Form {}
    export class FormSubmission extends _FormSubmission {}
    export class FormTextField extends _FormTextField {}
    export class FormTextFieldResponse extends _FormTextFieldResponse {}
    export class FormCheckbox extends _FormCheckbox {}
    export class FormCheckboxResponse extends _FormCheckboxResponse {}
    export class FormToggleSwitch extends _FormToggleSwitch {}
    export class FormToggleSwitchResponse extends _FormToggleSwitchResponse {}
    export class FormImage extends _FormImage {}
    export class FormButton extends _FormButton {}
    export class FormLabel extends _FormLabel {}
    export class ImageEvent extends _ImageEvent {}
    export class UploadedFile extends _UploadedFile {}

    export const extraModels = [
        User,
        Form,
        FormSubmission,
        FormTextField,
        FormTextFieldResponse,
        FormCheckbox,
        FormCheckboxResponse,
        FormToggleSwitch,
        FormToggleSwitchResponse,
        FormImage,
        FormButton,
        FormLabel,
        ImageEvent,
        UploadedFile,
    ];
}
