import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewCheckboxFieldResponseRequest {
    @IsString()
    @ApiProperty()
    id!: string;

    @IsBoolean()
    @ApiProperty()
    value!: boolean;
}
