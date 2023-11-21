import { FormSubmission } from './form_submission';
import { FormToggleSwitch } from './form_toggle_switch';
import { ApiProperty } from '@nestjs/swagger';

export class FormToggleSwitchResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: () => FormSubmission })
    submission: FormSubmission;

    @ApiProperty({ type: String })
    submissionId: string;

    @ApiProperty({ type: () => FormToggleSwitch })
    toggleSwitch: FormToggleSwitch;

    @ApiProperty({ type: String })
    toggleSwitchId: string;

    @ApiProperty({ type: String })
    value: string;
}
