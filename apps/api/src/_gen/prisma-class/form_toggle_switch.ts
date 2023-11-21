import { Form } from './form';
import { FormToggleSwitchResponse } from './form_toggle_switch_response';
import { ApiProperty } from '@nestjs/swagger';

export class FormToggleSwitch {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    label: string;

    @ApiProperty({ type: () => Form })
    form: Form;

    @ApiProperty({ type: String })
    formId: string;

    @ApiProperty({ type: Number })
    order: number;

    @ApiProperty({ isArray: true, type: () => FormToggleSwitchResponse })
    responses: FormToggleSwitchResponse[];
}
