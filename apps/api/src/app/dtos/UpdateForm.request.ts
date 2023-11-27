import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFormRequest {
    @IsString()
    @IsOptional()
    @ApiProperty()
    name?: string;
}
