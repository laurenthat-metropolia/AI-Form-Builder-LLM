import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewTextFieldResponseRequest {
    @IsString()
    @ApiProperty()
    id!: string;

    @IsString()
    @ApiProperty()
    value!: string;
}
