import { Form } from './form';
import { ImageEvent } from './image_event';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadedFile {
    @ApiProperty({ type: String })
    id: string;

    @ApiPropertyOptional({ type: () => Form })
    form?: Form;

    @ApiPropertyOptional({ type: String })
    formId?: string;

    @ApiProperty({ type: String })
    key: string;

    @ApiProperty({ type: String })
    url: string;

    @ApiProperty({ isArray: true, type: () => ImageEvent })
    events: ImageEvent[];
}
