import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    NotFoundException,
    Param,
    Patch,
    Post,
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
import { NewFormImageRequest } from '../dtos/NewFormImage.request';
import { forms } from '../services/form.service';
import { Resources, ValueOf } from '@draw2form/shared';
import { Direction } from '../interfaces/direction';

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

        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                textFields: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        const order = await forms.countFormFields(form.id);
        return prisma.formTextField.create({
            data: {
                formId: form.id,
                order: order,
                label: body.label,
            },
        });
    }

    @Patch('text-field/:id')
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
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
        return prisma.formTextField.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formTextField.findFirst({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                labels: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        const order = await forms.countFormFields(form.id);
        return prisma.formLabel.create({
            data: {
                formId: form.id,
                order: order,
                label: body.label,
            },
        });
    }

    @Patch('label/:id')
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formLabel.findFirst({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
        return prisma.formLabel.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formLabel.findFirst({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                checkboxes: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        const order = await forms.countFormFields(form.id);
        return prisma.formCheckbox.create({
            data: {
                formId: form.id,
                order: order,
                label: body.label,
            },
        });
    }

    @Patch('checkbox/:id')
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

        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
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
        return prisma.formCheckbox.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formCheckbox.findFirst({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                toggleSwitches: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        const order = await forms.countFormFields(form.id);
        return prisma.formToggleSwitch.create({
            data: {
                formId: form.id,
                order: order,
                label: body.label,
            },
        });
    }

    @Patch('toggle-switch/:id')
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
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
        return prisma.formToggleSwitch.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formToggleSwitch.findFirst({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                buttons: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        const order = await forms.countFormFields(form.id);
        return prisma.formButton.create({
            data: {
                formId: form.id,
                order: order,
                label: body.label,
                type: 'submit',
            },
        });
    }

    @Patch('button/:id')
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formButton.findFirst({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
        return prisma.formButton.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                label: body.label ?? field.label,
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formButton.findFirst({
            where: {
                formId: formId,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
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
    async createImage(@Req() request: Request, @Param() params: Record<string, string>) {
        const file = (request.file ?? null) as Express.Multer.File | null;
        const user = request.user as User;
        const formId = params.formId;
        const image = file ? transformUploadedFile(file) : null;

        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
            include: {
                images: true,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        const order = await forms.countFormFields(form.id);
        return prisma.formImage.create({
            data: {
                formId: form.id,
                order: order,
                url: image?.url ?? null,
            },
        });
    }

    @Patch('image/:id')
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
        @Body() body: NewFormImageRequest,
        @UploadedFile() file: Express.Multer.File | null,
    ) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldId = params.id;
        const image = file ? transformUploadedFile(file) : null;
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formImage.findFirst({
            where: {
                formId: form.id,
                id: fieldId,
            },
        });

        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }
        return prisma.formImage.update({
            where: {
                formId: form.id,
                id: fieldId,
            },
            data: {
                ...field,
                url: image?.url ?? field.url,
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
        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }
        const field = await prisma.formImage.findFirst({
            where: {
                formId: formId,
                id: fieldId,
            },
        });
        if (!field) {
            throw new NotFoundException('Field Not Found.');
        }

        return prisma.formImage.delete({
            where: {
                formId: form.id,
                id: field.id,
            },
        });
    }

    @Patch(`:fieldType/:id/order/:direction`)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'fieldType',
        type: 'enum',
        enum: Object.values(Resources),
        description: 'Field Type',
    })
    @ApiParam({
        name: 'direction',
        type: 'enum',
        enum: Object.values(Direction),
        description: 'Direction to move in the form',
    })
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
    async changeOrder(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.formId;
        const fieldType = params.fieldType as ValueOf<typeof Resources>;
        const direction = params.direction as ValueOf<typeof Direction>;
        const fieldId = params.id;

        if (!Object.values(Direction).includes(direction)) {
            throw new BadRequestException('Unknown direction');
        }
        if (!Object.values(Resources).includes(fieldType)) {
            throw new BadRequestException('Unknown fieldType');
        }

        const form = await prisma.form.findFirst({
            where: {
                ownerId: user.id,
                id: formId,
            },
        });

        if (!form) {
            throw new NotFoundException('Form Not Found.');
        }

        await forms.validateAndFixFormFieldOrders(form.id);

        const formFields = await forms.getFormFields(form.id);
        const formFieldCount = formFields.length;
        const field = formFields.find((x) => x.id === fieldId);
        const fieldIndex = formFields.findIndex((x) => x.id === fieldId);

        if (!field || fieldIndex === -1) {
            throw new BadRequestException('Field Not Found.');
        }
        if (formFieldCount === 1) {
            throw new BadRequestException('Nowhere to go.');
        }
        if (field.order === 0 && direction === Direction.Up) {
            throw new BadRequestException('Nowhere to go.');
        }
        if (field.order === formFieldCount - 1 && direction === Direction.Down) {
            throw new BadRequestException('Nowhere to go.');
        }

        if (direction === Direction.Up) {
            const prev = formFields[fieldIndex - 1];
            await forms.updateResourceOrder(prev.resource, prev.id, field.order);
            await forms.updateResourceOrder(field.resource, field.id, prev.order);
        } else {
            const next = formFields[fieldIndex + 1];
            await forms.updateResourceOrder(next.resource, next.id, field.order);
            await forms.updateResourceOrder(field.resource, field.id, next.order);
        }

        return (await forms.getFormFields(form.id)).map((x) => ({
            id: x.id,
            order: x.order,
            resource: x.resource,
        }));
    }
}
