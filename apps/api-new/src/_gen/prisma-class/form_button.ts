import { Form } from './form';
import { ApiProperty } from '@nestjs/swagger';

export class FormButton {
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

    @ApiProperty({ type: String })
    type: string;
}
