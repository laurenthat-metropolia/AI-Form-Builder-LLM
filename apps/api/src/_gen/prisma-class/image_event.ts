import { UploadedFile } from './uploaded_file';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImageEvent {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: Date })
    createdAt: Date;

    @ApiProperty({ type: Date })
    updatedAt: Date;

    @ApiProperty({ type: String })
    event: string;

    @ApiPropertyOptional({ type: Object })
    payload?: object;

    @ApiProperty({ type: () => UploadedFile })
    file: UploadedFile;

    @ApiProperty({ type: String })
    fileId: string;
}
