import { FormSubmission } from './form_submission';
import { FormCheckbox } from './form_checkbox';
import { ApiProperty } from '@nestjs/swagger';

export class FormCheckboxResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: () => FormSubmission })
    submission: FormSubmission;

    @ApiProperty({ type: String })
    submissionId: string;

    @ApiProperty({ type: () => FormCheckbox })
    checkbox: FormCheckbox;

    @ApiProperty({ type: String })
    checkboxId: string;

    @ApiProperty({ type: Boolean })
    value: boolean;
}
