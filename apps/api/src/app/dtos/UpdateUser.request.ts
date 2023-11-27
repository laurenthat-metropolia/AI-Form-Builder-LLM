import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRequest {
    @IsString()
    @ApiProperty()
    name!: string;
}
