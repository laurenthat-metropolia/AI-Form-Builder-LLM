import { Form } from './form';
import { FormSubmission } from './form_submission';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class User {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    email: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiPropertyOptional({ type: String })
    picture?: string;

    @ApiProperty({ isArray: true, type: () => Form })
    forms: Form[];

    @ApiProperty({ isArray: true, type: () => FormSubmission })
    formSubmissions: FormSubmission[];
}
