import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewFormImageRequest {
    @IsNumber()
    @IsOptional()
    @ApiProperty()
    order?: number;
}
