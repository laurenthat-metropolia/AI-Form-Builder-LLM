import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewTextFieldResponseRequest } from './NewTextFieldResponse.request';
import { NewToggleSwitchFieldResponseRequest } from './NewToggleSwitchFieldResponse.request';
import { NewCheckboxFieldResponseRequest } from './NewCheckboxFieldResponse.request';
import { Type } from 'class-transformer';

export class NewFormSubmissionRequest {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                },
                value: {
                    type: 'string',
                },
            },
        },
    })
    @IsArray()
    @ValidateNested()
    @Type(() => NewTextFieldResponseRequest)
    textFieldResponses: NewTextFieldResponseRequest[];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                },
                value: {
                    type: 'boolean',
                },
            },
        },
    })
    @ApiProperty()
    @IsArray()
    @ValidateNested()
    @Type(() => NewCheckboxFieldResponseRequest)
    checkboxResponses: NewCheckboxFieldResponseRequest[];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                },
                value: {
                    type: 'boolean',
                },
            },
        },
    })
    @ApiProperty()
    @IsArray()
    @ValidateNested()
    @Type(() => NewToggleSwitchFieldResponseRequest)
    toggleSwitchResponses: NewToggleSwitchFieldResponseRequest[];
}
