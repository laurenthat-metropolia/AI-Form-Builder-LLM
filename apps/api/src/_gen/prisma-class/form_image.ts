import { Form } from './form';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormImage {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: () => Form })
    form: Form;

    @ApiProperty({ type: String })
    formId: string;

    @ApiProperty({ type: Number })
    order: number;

    @ApiPropertyOptional({ type: String })
    url?: string;
}
