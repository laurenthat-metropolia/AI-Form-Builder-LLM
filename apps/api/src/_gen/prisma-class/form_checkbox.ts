import { Form } from './form';
import { FormCheckboxResponse } from './form_checkbox_response';
import { ApiProperty } from '@nestjs/swagger';

export class FormCheckbox {
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

    @ApiProperty({ isArray: true, type: () => FormCheckboxResponse })
    responses: FormCheckboxResponse[];
}
