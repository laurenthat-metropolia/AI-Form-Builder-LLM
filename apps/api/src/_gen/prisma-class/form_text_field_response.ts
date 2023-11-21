import { FormSubmission } from './form_submission';
import { FormTextField } from './form_text_field';
import { ApiProperty } from '@nestjs/swagger';

export class FormTextFieldResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: () => FormSubmission })
    submission: FormSubmission;

    @ApiProperty({ type: String })
    submissionId: string;

    @ApiProperty({ type: () => FormTextField })
    textField: FormTextField;

    @ApiProperty({ type: String })
    textFieldId: string;

    @ApiProperty({ type: String })
    value: string;
}
