import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConsumerTopics } from '../event-consumers/consumer-topics';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { prisma } from '../databases/userDatabase';
import { NewFormFieldRequest } from '../dtos/NewFormField.request';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { UpdateFormFieldRequest } from '../dtos/UpdateFormField.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { transformUploadedFile } from '../services/upload.service';

@ApiTags('Form Fields')
@Controller('forms/:formId/fields')
export class FormFieldController {
    constructor(@InjectQueue(ConsumerTopics.FormCreated) private imageEventsQueue: Queue) {}

    @Post('text-field')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create FormTextField',
        description: 'Create FormTextField',
    })
    async createFormTextfield(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        console.log({ params });

        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                textFields: true,
            },
        });
        console.log({ form });
        return prisma.formTextField.create({
            data: {
                ...body,
                formId: form.id,
                order: form.textFields.length,
                label: body.label,
            },
        });
    }

    @Put('text-field/:id')
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
        summary: 'Update FormTextField',
        description: 'Update FormTextField',
    })
    async updateFormTextField(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: UpdateFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formTextField.findFirstOrThrow({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        return prisma.formTextField.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
                order: body.order ?? field.order,
            },
        });
    }

    @Delete('text-field/:id')
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
        summary: 'Delete FormTextField',
        description: 'Delete FormTextField',
    })
    async deleteFormTextfield(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formTextField.findFirstOrThrow({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        return prisma.formTextField.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }

    @Post('label')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create FormLabel',
        description: 'Create FormLabel',
    })
    async createFormLabel(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                labels: true,
            },
        });

        return prisma.formLabel.create({
            data: {
                ...body,
                formId: form.id,
                order: form.labels.length,
                label: body.label,
            },
        });
    }

    @Put('label/:id')
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
        description: 'FormLabel Id',
    })
    @ApiOperation({
        summary: 'Update FormLabel',
        description: 'Update FormLabel',
    })
    async updateFormLabel(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: UpdateFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formLabel.findFirstOrThrow({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        return prisma.formLabel.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
                order: body.order ?? field.order,
            },
        });
    }

    @Delete('label/:id')
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
        description: 'FormLabel Id',
    })
    @ApiOperation({
        summary: 'Delete FormLabel',
        description: 'Delete FormLabel',
    })
    async deleteFormLabel(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formLabel.findFirstOrThrow({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        return prisma.formLabel.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }

    @Post('checkbox')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create FormCheckbox',
        description: 'Create FormCheckbox',
    })
    async createCheckbox(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                checkboxes: true,
            },
        });

        return prisma.formCheckbox.create({
            data: {
                ...body,
                formId: form.id,
                order: form.checkboxes.length,
                label: body.label,
            },
        });
    }

    @Put('checkbox/:id')
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
        summary: 'Update FormCheckbox',
        description: 'Update FormCheckbox',
    })
    async updateCheckbox(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: UpdateFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;

        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formCheckbox.findFirstOrThrow({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        return prisma.formCheckbox.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
                order: body.order ?? field.order,
            },
        });
    }

    @Delete('checkbox/:id')
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
        summary: 'Delete FormCheckbox',
        description: 'Delete FormCheckbox',
    })
    async deleteCheckbox(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formCheckbox.findFirstOrThrow({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        return prisma.formCheckbox.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }

    @Post('toggle-switch')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create FormToggleSwitch',
        description: 'Create FormToggleSwitch',
    })
    async createToggleSwitch(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                toggleSwitches: true,
            },
        });

        return prisma.formToggleSwitch.create({
            data: {
                ...body,
                formId: form.id,
                order: form.toggleSwitches.length,
                label: body.label,
            },
        });
    }

    @Put('toggle-switch/:id')
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
        summary: 'Update FormToggleSwitch',
        description: 'Update FormToggleSwitch',
    })
    async updateToggleSwitch(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: UpdateFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formToggleSwitch.findFirstOrThrow({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        return prisma.formToggleSwitch.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
                order: body.order ?? field.order,
            },
        });
    }

    @Delete('toggle-switch/:id')
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
        summary: 'Delete FormToggleSwitch',
        description: 'Delete FormToggleSwitch',
    })
    async deleteToggleSwitch(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formToggleSwitch.findFirstOrThrow({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        return prisma.formToggleSwitch.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }

    @Post('button')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create FormButton',
        description: 'Create FormButton',
    })
    async createFormButton(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                buttons: true,
            },
        });

        return prisma.formButton.create({
            data: {
                formId: form.id,
                order: body.order ?? form.buttons.length,
                label: body.label,
                type: 'submit',
            },
        });
    }

    @Put('button/:id')
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
        description: 'FormButton Id',
    })
    @ApiOperation({
        summary: 'Update FormButton',
        description: 'Update FormButton',
    })
    async updateFormButton(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: UpdateFormFieldRequest,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formButton.findFirstOrThrow({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        return prisma.formButton.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
                order: body.order ?? field.order,
            },
        });
    }

    @Delete('button/:id')
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
        description: 'FormButton Id',
    })
    @ApiOperation({
        summary: 'Delete FormButton',
        description: 'Delete FormButton',
    })
    async deleteFormButton(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formButton.findFirstOrThrow({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        return prisma.formButton.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }

    @Post('image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create FormImage',
        description: 'Create FormImage',
    })
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async createImage(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormFieldRequest,
        @UploadedFile() file: Express.Multer.File | null,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const image = file ? transformUploadedFile(file) : null;

        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                images: true,
            },
        });

        return prisma.formImage.create({
            data: {
                formId: form.id,
                order: form.images.length,
                url: image?.url ?? null,
            },
        });
    }

    @Put('image/:id')
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
        description: 'FormImage Id',
    })
    @ApiOperation({
        summary: 'Update FormImage',
        description: 'Update FormImage',
    })
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async updateImage(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: UpdateFormFieldRequest,
        @UploadedFile() file: Express.Multer.File | null,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const image = file ? transformUploadedFile(file) : null;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formImage.findFirstOrThrow({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        return prisma.formImage.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                url: image?.url ?? field.url,
                order: body.order ?? field.order,
            },
        });
    }

    @Delete('image/:id')
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
        description: 'Image Id',
    })
    @ApiOperation({
        summary: 'Delete FormImage',
        description: 'Delete FormImage',
    })
    async deleteImage(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const form = await prisma.form.findFirstOrThrow({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        const field = await prisma.formImage.findFirstOrThrow({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        return prisma.formImage.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }
}
