import { User } from './user';
import { Form } from './form';
import { FormTextFieldResponse } from './form_text_field_response';
import { FormCheckboxResponse } from './form_checkbox_response';
import { FormToggleSwitchResponse } from './form_toggle_switch_response';
import { ApiProperty } from '@nestjs/swagger';

export class FormSubmission {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    status: string;

    @ApiProperty({ type: () => User })
    owner: User;

    @ApiProperty({ type: String })
    ownerId: string;

    @ApiProperty({ type: () => Form })
    form: Form;

    @ApiProperty({ type: String })
    formId: string;

    @ApiProperty({ isArray: true, type: () => FormTextFieldResponse })
    textFieldResponses: FormTextFieldResponse[];

    @ApiProperty({ isArray: true, type: () => FormCheckboxResponse })
    checkboxResponses: FormCheckboxResponse[];

    @ApiProperty({ isArray: true, type: () => FormToggleSwitchResponse })
    toggleSwitchResponses: FormToggleSwitchResponse[];
}
