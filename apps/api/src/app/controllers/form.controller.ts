import {
    Controller,
    Get,
    NotFoundException,
    Param,
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
import { ApiParam } from '@nestjs/swagger';

@Controller('forms')
export class FormController {
    constructor(@InjectQueue(ConsumerTopics.FormCreated) private imageEventsQueue: Queue) {}
    @Get()
    @UseGuards(JwtAuthGuard)
    async getItems(@Req() request: Request) {
        const user = request.user as User;
        console.log(user);
        return forms.findPopulatedManyByOwnerId(user.id);
    }
    @Get(':id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    async getItem(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
        return item;
    }
    @Get(':id/status')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'formId',
    })
    async getItemStatus(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
        const hasTextRes = item.upload?.events.find((ev) => ev.event === ImageEvents.TextDetectionResponseReceived);
        const hasObjectRes = item.upload?.events.find((ev) => ev.event === ImageEvents.ObjectDetectionResponseReceived);
        const hasFormRes = item.upload?.events.find((ev) => ev.event === ImageEvents.FormComponentsCreated);
        return {
            textRecognition: hasTextRes === undefined ? 'loading' : hasTextRes === null ? 'error' : 'success',
            objectRecognition: hasObjectRes === undefined ? 'loading' : hasObjectRes === null ? 'error' : 'success',
            formGeneration: hasFormRes === undefined ? 'loading' : hasFormRes === null ? 'error' : 'success',
        };
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
    @UseInterceptors(FileInterceptor('image'))
    @ApiParam({
        name: 'image',
        type: 'file',
        description: 'Image',
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
