import { BadRequestException, Body, Controller, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { prisma } from '../databases/userDatabase';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { forms } from '../services/form.service';
import { NewTextFieldResponseRequest } from '../dtos/NewTextFieldResponse.request';
import { FormStatus } from '@draw2form/shared';
import { NewCheckboxFieldResponseRequest } from '../dtos/NewCheckboxFieldResponse.request';
import { NewToggleSwitchFieldResponseRequest } from '../dtos/NewToggleSwitchFieldResponse.request';
import { PrismaModel } from '../../_gen/prisma-class';

@ApiTags('Form Fields Responses')
@Controller('forms/:formId/fields')
export class FormFieldResponsesController {
    @Post('text-field/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'FormTextField Id',
    })
    @ApiOperation({
        summary: 'Create Or Update FormTextFieldResponse',
        description: 'Create Or Update FormTextFieldResponse',
    })
    @ApiResponse({
        status: 200,
        schema: {
            $ref: getSchemaPath(PrismaModel.FormTextFieldResponse),
        },
    })
    async createFormTextfieldResponse(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewTextFieldResponseRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
            include: {
                textFields: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        if (form.status !== FormStatus.PUBLISHED) {
            throw new BadRequestException('Form is not published yet.');
        }

        const field = await prisma.formTextField.findFirst({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }

        const submission = await forms.createFormSubmission(user.id, formId);
        const existingResponse = await prisma.formTextFieldResponse.findFirst({
            where: {
                submissionId: submission.id,
                textFieldId: field.id,
            },
        });

        if (existingResponse) {
            return prisma.formTextFieldResponse.update({
                where: {
                    id: existingResponse.id,
                },
                data: {
                    submissionId: submission.id,
                    value: body.value,
                    textFieldId: field.id,
                },
            });
        }

        return prisma.formTextFieldResponse.create({
            data: {
                submissionId: submission.id,
                value: body.value,
                textFieldId: field.id,
            },
        });
    }
    @Post('checkbox/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'FormCheckbox Id',
    })
    @ApiOperation({
        summary: 'Create Or Update FormCheckboxResponse',
        description: 'Create Or Update FormCheckboxResponse',
    })
    @ApiResponse({
        status: 200,
        schema: {
            $ref: getSchemaPath(PrismaModel.FormCheckboxResponse),
        },
    })
    async createFormCheckboxResponse(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewCheckboxFieldResponseRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
            include: {
                textFields: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        if (form.status !== FormStatus.PUBLISHED) {
            throw new BadRequestException('Form is not published yet.');
        }

        const field = await prisma.formCheckbox.findFirst({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }

        const submission = await forms.createFormSubmission(user.id, formId);
        const existingResponse = await prisma.formCheckboxResponse.findFirst({
            where: {
                submissionId: submission.id,
                checkboxId: field.id,
            },
        });

        if (existingResponse) {
            return prisma.formCheckboxResponse.update({
                where: {
                    id: existingResponse.id,
                },
                data: {
                    submissionId: submission.id,
                    value: body.value,
                    checkboxId: field.id,
                },
            });
        }

        return prisma.formCheckboxResponse.create({
            data: {
                submissionId: submission.id,
                value: body.value,
                checkboxId: field.id,
            },
        });
    }
    @Post('toggle-switch/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'FormToggleSwitch Id',
    })
    @ApiOperation({
        summary: 'Create Or Update FormToggleSwitchResponse',
        description: 'Create Or Update FormToggleSwitchResponse',
    })
    @ApiResponse({
        status: 200,
        schema: {
            $ref: getSchemaPath(PrismaModel.FormToggleSwitchResponse),
        },
    })
    async createFormToggleSwitchResponse(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewToggleSwitchFieldResponseRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
            include: {
                textFields: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        if (form.status !== FormStatus.PUBLISHED) {
            throw new BadRequestException('Form is not published yet.');
        }

        const field = await prisma.formToggleSwitch.findFirst({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }

        const submission = await forms.createFormSubmission(user.id, formId);
        const existingResponse = await prisma.formToggleSwitchResponse.findFirst({
            where: {
                submissionId: submission.id,
                toggleSwitchId: field.id,
            },
        });

        if (existingResponse) {
            return prisma.formToggleSwitchResponse.update({
                where: {
                    id: existingResponse.id,
                },
                data: {
                    submissionId: submission.id,
                    value: body.value,
                    toggleSwitchId: field.id,
                },
            });
        }

        return prisma.formToggleSwitchResponse.create({
            data: {
                submissionId: submission.id,
                value: body.value,
                toggleSwitchId: field.id,
            },
        });
    }
}
