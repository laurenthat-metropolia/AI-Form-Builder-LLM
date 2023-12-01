import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewCheckboxFieldResponseRequest {
    @IsBoolean()
    @ApiProperty()
    value!: boolean;
}
