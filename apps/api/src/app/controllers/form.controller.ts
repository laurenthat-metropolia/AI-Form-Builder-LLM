import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { forms } from '../services/form.service';
import { FormStatus, ImageEvents } from '@draw2form/shared';
import { FileInterceptor } from '@nestjs/platform-express';
import { prisma } from '../databases/userDatabase';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { transformUploadedFile } from '../services/upload.service';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { ConsumerTopics } from '../event-consumers/consumer-topics';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger';
import { UpdateFormRequest } from '../dtos/UpdateForm.request';
import { NewFormSubmissionRequest } from '../dtos/NewFormSubmission.request';
import { PrismaModel } from '../../_gen/prisma-class';
import { JwtAndAnonymousAuthGuard } from '../authentication/jwt-and-anonymous-auth.guard';
import FormSubmission = PrismaModel.FormSubmission;

@ApiTags('Forms')
@Controller('forms')
export class FormController {
    constructor(@InjectQueue(ConsumerTopics.FormCreated) private imageEventsQueue: Queue) {}
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Get user Form list',
        description: 'Get user Form list',
    })
    async getItems(@Req() request: Request) {
        const user = request.user as User;
        return forms.findPopulatedManyByOwnerId(user.id);
    }
    @Get(':id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiOperation({
        summary: 'Get Form details by id',
        description: 'Get Form details by id',
    })
    async getItem(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
        return item;
    }
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiOperation({
        summary: 'Delete Form by id',
        description: 'Delete Form by id',
    })
    async deleteForm(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
        });
        if (!form) {
            throw new NotFoundException();
        }
        if (form.ownerId !== user.id) {
            throw new ForbiddenException();
        }

        return prisma.form.delete({
            where: {
                id: formId,
                ownerId: user.id,
            },
        });
    }

    @Post(':id/submit')
    @UseGuards(JwtAndAnonymousAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiOperation({
        summary: 'Submit Form by id',
        description: 'Submit Form by id',
    })
    @ApiResponse({
        status: 200,
        schema: {
            $ref: getSchemaPath(FormSubmission),
        },
    })
    @ApiBody({ type: [NewFormSubmissionRequest] })
    async submitForm(
        @Req() request: Request,
        @Param() params: Record<string, string>,
        @Body() body: NewFormSubmissionRequest,
    ) {
        const user = request.user as User | undefined;
        const formId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
        });
        if (!form) {
            console.log('[submitForm] NotFoundException');
            throw new NotFoundException();
        }
        const submission = await (async () => {
            if (user === undefined) {
                return prisma.formSubmission.create({
                    data: {
                        formId,
                    },
                });
            }
            const userSubmission = await prisma.formSubmission.findFirst({
                where: {
                    formId,
                    ownerId: user.id,
                },
            });
            if (userSubmission) {
                console.log('[submitForm] ForbiddenException Already submitted');
                throw new ForbiddenException('Already submitted.');
            }
            return prisma.formSubmission.create({
                data: {
                    formId,
                    ownerId: user.id,
                },
            });
        })();

        for (const fieldResponse of body.checkboxResponses) {
            const checkboxes = await prisma.formCheckbox.findMany({
                where: {
                    formId: formId,
                },
            });
            if (!checkboxes.map((x) => x.id).includes(fieldResponse.id)) {
                console.log('[submitForm] BadRequestException Unknown Field Id');
                throw new BadRequestException('Unknown Field Id.');
            }
            await prisma.formCheckboxResponse.create({
                data: {
                    submissionId: submission.id,
                    value: fieldResponse.value,
                    checkboxId: fieldResponse.id,
                },
            });
        }

        for (const fieldResponse of body.textFieldResponses) {
            const textFields = await prisma.formTextField.findMany({
                where: {
                    formId: formId,
                },
            });
            if (!textFields.map((x) => x.id).includes(fieldResponse.id)) {
                console.log('[submitForm] BadRequestException Unknown Field Id');
                throw new BadRequestException('Unknown Field Id.');
            }
            await prisma.formTextFieldResponse.create({
                data: {
                    submissionId: submission.id,
                    value: fieldResponse.value,
                    textFieldId: fieldResponse.id,
                },
            });
        }

        for (const fieldResponse of body.toggleSwitchResponses) {
            const toggles = await prisma.formToggleSwitch.findMany({
                where: {
                    formId: formId,
                },
            });
            if (!toggles.map((x) => x.id).includes(fieldResponse.id)) {
                console.log('[submitForm] BadRequestException Unknown Field Id');
                throw new BadRequestException('Unknown Field Id.');
            }
            await prisma.formToggleSwitchResponse.create({
                data: {
                    submissionId: submission.id,
                    value: fieldResponse.value,
                    toggleSwitchId: fieldResponse.id,
                },
            });
        }

        return submission;
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiOperation({
        summary: 'Patch Form by id',
        description: 'Patch Form by id',
    })
    async patchForm(@Req() request: Request, @Param() params: Record<string, string>, @Body() body: UpdateFormRequest) {
        const user = request.user as User;
        const formId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
        });
        if (!form) {
            throw new NotFoundException();
        }
        if (form.ownerId !== user.id) {
            throw new ForbiddenException();
        }

        return prisma.form.update({
            where: {
                id: formId,
            },
            data: {
                name: body.name ?? form.name,
            },
        });
    }

    @Get(':id/status')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiOperation({
        summary: 'Get Image event statuses',
        description: 'Get Image event statuses',
    })
    async getItemStatus(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
        const resObject = Object.values(ImageEvents)
            .map((event) => {
                const eventBody = item.upload?.events.find((ev) => ev.event === event);
                return { [event]: eventBody === undefined ? 'loading' : eventBody === null ? 'error' : 'success' };
            })
            .reduce((prev, curr) => ({ ...prev, ...curr }), {});
        return resObject;
    }

    @Get(':id/event/:event')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiParam({
        name: 'event',
        type: 'string',
        description: 'event',
        enum: Object.values(ImageEvents),
    })
    @ApiOperation({
        summary: 'Get Image event by form id and event name',
        description: 'Get Image event by form id and event name',
    })
    async getItemEvent(@Param() params: Record<string, string>) {
        const formId = params.id;
        const eventName = params.event;

        const item = await forms.findOnePopulatedById(formId);

        if (!item) {
            throw new NotFoundException();
        }

        const eventItem = item.upload?.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            throw new NotFoundException();
        }
        return eventItem;
    }
    @Get(':id/event/:event/payload')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiParam({
        name: 'event',
        type: 'string',
        description: 'event',
        enum: Object.values(ImageEvents),
    })
    @ApiOperation({
        summary: 'Get Image event payload by form id and event name',
        description: 'Get Image event payload by form id and event name',
    })
    async getItemEventPayload(@Param() params: Record<string, string>) {
        const formId = params.id;
        const eventName = params.event;
        const item = await forms.findOnePopulatedById(formId);

        if (!item) {
            throw new NotFoundException();
        }

        const eventItem = item.upload?.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            throw new NotFoundException();
        }
        return eventItem.payload;
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
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
    @ApiOperation({
        summary: 'Create Form by uploading image',
        description: 'Create Form by uploading image',
    })
    async createItem(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
        const user = request.user as User;
        const image = transformUploadedFile(file);
        const createdForm = await prisma.form.create({
            data: {
                status: FormStatus.DRAFT,
                name: 'Form',
                ownerId: user.id,
            },
        });
        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                url: image.url,
                key: image.key,
                formId: createdForm.id,
            },
        });

        const populatedForm = await prisma.form.findFirstOrThrow({
            where: {
                id: createdForm.id,
            },
            include: {
                checkboxes: true,
                textFields: true,
                toggleSwitches: true,
                buttons: true,
                labels: true,
                images: true,
                upload: true,
            },
        });
        await this.imageEventsQueue.add({ uploadedFile, form: createdForm });
        return populatedForm;
    }

    @Post(':id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiConsumes('application/json')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    @ApiOperation({
        summary: 'Scan Form by formId',
        description: 'Scan Form by providing formId',
    })
    async scanForm(@Req() request: Request, @Param() params: Record<string, string>) {
        const user = request.user as User;
        const formId = params.id;

        const form = await prisma.form.findFirst({
            where: {
                id: formId,
            },
        });
        if (!form) {
            throw new NotFoundException();
        }
        if (form.ownerId !== user.id) {
            throw new ForbiddenException();
        }

        return prisma.form.update({
            where: {
                id: formId,
            },
            data: {
                status: 'PUBLISHED',
            },
        });
    }
}

//     router.put('/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
//         try {
//             const user: User = req.user as User;
//             const formId = req.params.id;
//             const body = req.body as {
//                 form: Form;
//                 checkboxes: FormCheckbox[];
//                 formTextFields: FormTextField[];
//                 formToggleSwitches: FormToggleSwitch[];
//                 formImages: FormImage[];
//                 formButtons: FormButton[];
//                 formLabels: FormLabel[];
//             };
//
//             const existingForm = await prisma.form.findFirst({
//                 where: {
//                     id: formId,
//                     ownerId: user.id,
//                 },
//                 include: {
//                     checkboxes: true,
//                     textFields: true,
//                     buttons: true,
//                     images: true,
//                     labels: true,
//                     toggleSwitches: true,
//                 },
//             });
//             if (existingForm === null) {
//                 res.status(400).send({
//                     message: 'Not Found.',
//                 });
//                 return;
//             }
//
//             const formResponse = await prisma.form.update({
//                 where: { id: formId },
//                 data: {
//                     name: body.form.name ? body.form.name.trim() : existingForm.name,
//                     status: body.form.status ? body.form.status : 'DRAFT',
//                     checkboxes: {
//                         updateMany: {
//                             where: {
//                                 id: { in: body.checkboxes.map((checkbox) => checkbox.id) },
//                             },
//                             data: body.checkboxes.map((checkbox) => {
//                                 const existingCheckbox = existingForm.checkboxes.find((cb) => cb.order);
//                                 return {
//                                     id: checkbox.id,
//                                     order: checkbox.order !== undefined ? checkbox.order : existingCheckbox,
//                                 };
//                             }),
//                         },
//                     },
//                     textFields: {
//                         updateMany: {
//                             where: {
//                                 id: {
//                                     in: body.formTextFields.map((textField) => textField.id),
//                                 },
//                             },
//                             data: body.formTextFields.map((textField) => {
//                                 const existingTextField = existingForm.textFields.find((tf) => {
//                                     tf.formId;
//                                 });
//                             }),
//                         },
//                     },
//                     toggleSwitches: {
//                         updateMany: {
//                             where: {
//                                 id: {
//                                     in: body.formToggleSwitches.map((toggleSwitch) => toggleSwitch.id),
//                                 },
//                             },
//                             data: body.formToggleSwitches,
//                         },
//                     },
//                     buttons: {
//                         updateMany: {
//                             where: {
//                                 id: { in: body.formButtons.map((button) => button.id) },
//                             },
//                             data: body.formButtons,
//                         },
//                     },
//                     images: {
//                         updateMany: {
//                             where: { id: { in: body.formImages.map((image) => image.id) } },
//                             data: body.formImages,
//                         },
//                     },
//                     labels: {
//                         updateMany: {
//                             where: { id: { in: body.formLabels.map((label) => label.id) } },
//                             data: body.formLabels,
//                         },
//                     },
//                 },
//             });
//
//             res.status(200).json(formResponse);
//         } catch (error) {
//             console.error('Error updating Form:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     });
//     router.delete('/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
//         const user: User = req.user as User;
//         const id: string = req.params.id as string;
//         const response = await prisma.form.delete({
//             where: {
//                 id: id,
//                 ownerId: user.id,
//             },
//         });
//         res.status(200).send(response);
//         console.log('Deletion successful');
//         return;
//     });
//
//     return router;
// };
