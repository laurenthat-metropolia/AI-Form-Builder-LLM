import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFormRequest {
    @IsString()
    @ApiProperty()
    name!: string;
}
