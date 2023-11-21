import { Form } from './form';
import { FormTextFieldResponse } from './form_text_field_response';
import { ApiProperty } from '@nestjs/swagger';

export class FormTextField {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: () => Form })
    form: Form;

    @ApiProperty({ type: String })
    formId: string;

    @ApiProperty({ type: String })
    label: string;

    @ApiProperty({ type: Number })
    order: number;

    @ApiProperty({ isArray: true, type: () => FormTextFieldResponse })
    responses: FormTextFieldResponse[];
}
