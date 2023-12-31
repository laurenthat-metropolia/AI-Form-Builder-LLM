import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewFormFieldRequest {
    @IsString()
    @ApiProperty()
    label!: string;
}
