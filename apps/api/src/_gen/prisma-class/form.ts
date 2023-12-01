import { User } from './user';
import { FormTextField } from './form_text_field';
import { FormCheckbox } from './form_checkbox';
import { FormToggleSwitch } from './form_toggle_switch';
import { FormImage } from './form_image';
import { FormButton } from './form_button';
import { FormLabel } from './form_label';
import { UploadedFile } from './uploaded_file';
import { FormSubmission } from './form_submission';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Form {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    status: string;

    @ApiProperty({ type: () => User })
    owner: User;

    @ApiProperty({ type: String })
    ownerId: string;

    @ApiProperty({ type: Date })
    createdAt: Date;

    @ApiProperty({ type: Date })
    updatedAt: Date;

    @ApiProperty({ isArray: true, type: () => FormTextField })
    textFields: FormTextField[];

    @ApiProperty({ isArray: true, type: () => FormCheckbox })
    checkboxes: FormCheckbox[];

    @ApiProperty({ isArray: true, type: () => FormToggleSwitch })
    toggleSwitches: FormToggleSwitch[];

    @ApiProperty({ isArray: true, type: () => FormImage })
    images: FormImage[];

    @ApiProperty({ isArray: true, type: () => FormButton })
    buttons: FormButton[];

    @ApiProperty({ isArray: true, type: () => FormLabel })
    labels: FormLabel[];

    @ApiPropertyOptional({ type: () => UploadedFile })
    upload?: UploadedFile;

    @ApiProperty({ isArray: true, type: () => FormSubmission })
    formSubmissions: FormSubmission[];
}
