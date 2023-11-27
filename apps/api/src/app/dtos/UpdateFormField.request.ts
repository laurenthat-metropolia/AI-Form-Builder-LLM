import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFormFieldRequest {
    @IsString()
    @ApiProperty()
    label!: string;

    @IsNumber()
    @ApiProperty()
    order!: number;
}
