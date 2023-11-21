import { Form } from './form';
import { ApiProperty } from '@nestjs/swagger';

export class FormLabel {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: () => Form })
    form: Form;

    @ApiProperty({ type: String })
    formId: string;

    @ApiProperty({ type: Number })
    order: number;

    @ApiProperty({ type: String })
    label: string;
}
