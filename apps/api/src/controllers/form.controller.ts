import express, { Request, Response } from 'express';
import { requiresAccessToken } from '../strategies/passport-jwt.service';
import {
    Form,
    FormButton,
    FormCheckbox,
    FormImage,
    FormLabel,
    FormTextField,
    FormToggleSwitch,
    User,
} from '@prisma/client';
import { prisma } from '../databases/userDatabase';
import { requireImageToBeUploaded, transformUploadedFile, uploadImageMiddleware } from '../configurations/configUpload';
import { FormStatus, ImageEvents } from '@draw2form/shared';
import { processUploadedFile } from '../services/prediction.service';
import { forms, populateUserFormBasedOnChatGPTResponse } from '../services/form.service';

export const formController = () => {
    const router = express.Router();

    router.get('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const user = req.user as User;
        res.send(await forms.findPopulatedManyByOwnerId(user.id));
    });

    router.get('/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const formId = req.params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            res.status(404).send({
                message: 'Form Not Found.',
            });
            return;
        }
        res.send(item);
    });

    router.get('/:id/status', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const user = req.user as User;
        const formId = req.params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            res.status(404).send({
                message: 'Form Not Found.',
            });
            return;
        }
        const hasTextRes = item.upload?.events.find((ev) => ev.event === ImageEvents.TextDetectionResponseReceived);
        const hasObjectRes = item.upload?.events.find((ev) => ev.event === ImageEvents.ObjectDetectionResponseReceived);
        const hasFormRes = item.upload?.events.find((ev) => ev.event === ImageEvents.FormComponentsCreated);
        res.status(200).send({
            textRecognition: hasTextRes === undefined ? 'loading' : hasTextRes === null ? 'error' : 'success',
            objectRecognition: hasObjectRes === undefined ? 'loading' : hasObjectRes === null ? 'error' : 'success',
            formGeneration: hasFormRes === undefined ? 'loading' : hasFormRes === null ? 'error' : 'success',
        });
    });

    // TODO: rename to events/:event
    router.get('/:id/event/:event', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const eventName = req.params.event;
        const formId = req.params.id;
        const item = await forms.findOnePopulatedById(formId);

        if (!item) {
            res.status(404).send({
                message: 'Form Not Found.',
            });
            return;
        }

        const eventItem = item.upload?.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            res.status(404).send({
                message: 'Event Not Found.',
            });
            return;
        }
        res.status(200).send(eventItem);
    });

    // TODO: rename to events/:event
    router.get('/:id/event/:event/payload', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const eventName = req.params.event;
        const formId = req.params.id;
        const item = await forms.findOnePopulatedById(formId);

        if (!item) {
            res.status(404).send({
                message: 'Form Not Found.',
            });
            return;
        }

        const eventItem = item.upload?.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            res.status(404).send({
                message: 'Event Not Found.',
            });
            return;
        }
        res.status(200).send(eventItem.payload);
    });

    router.post(
        '/',
        requiresAccessToken,
        uploadImageMiddleware,
        requireImageToBeUploaded,
        async (req: Request, res: Response): Promise<void> => {
            try {
                const user = req.user as User;
                const image = transformUploadedFile(req.file);
                const createdForm = await prisma.form.create({
                    data: {
                        status: FormStatus.DRAFT,
                        name: 'Form',
                        ownerId: user.id,
                    },
                });
                // Upload Image
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

                res.status(200).json(populatedForm);

                const processedUploadedFile = await processUploadedFile(uploadedFile)
                    .then((data) => {
                        console.log(`UploadedFile processing "${uploadedFile.id}" Completed.`);
                        return data;
                    })
                    .catch((err) => {
                        console.log(`UploadedFile processing "${uploadedFile.id}" Failed.`);
                        console.log(err);
                        return null;
                    });

                if (processedUploadedFile) {
                    await populateUserFormBasedOnChatGPTResponse(
                        processedUploadedFile.name,
                        processedUploadedFile.components,
                        createdForm,
                    )
                        .then((data) => {
                            console.log(`UploadedFile processing "${uploadedFile.id}" Form Completed.`);
                            return data;
                        })
                        .catch((err) => {
                            console.log(`UploadedFile processing "${uploadedFile.id}" Form Failed.`);
                            console.log(err);
                            return null;
                        });
                }
            } catch (error) {
                console.error('Error creating Form:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        },
    );

    router.get('/:formId', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        try {
            const formId = req.params.formId;
            const form = await prisma.form.findUnique({
                where: {
                    id: formId,
                },
                include: {
                    checkboxes: true,
                    textFields: true,
                    toggleSwitches: true,
                    images: true,
                    buttons: true,
                    labels: true,
                },
            });

            res.status(200).json(form);
        } catch (error) {
            console.error('Error retrieving form:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.put('/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        try {
            const user: User = req.user as User;
            const formId = req.params.id;
            const body = req.body as {
                form: Form;
                checkboxes: FormCheckbox[];
                formTextFields: FormTextField[];
                formToggleSwitches: FormToggleSwitch[];
                formImages: FormImage[];
                formButtons: FormButton[];
                formLabels: FormLabel[];
            };

            const existingForm = await prisma.form.findFirst({
                where: {
                    id: formId,
                    ownerId: user.id,
                },
                include: {
                    checkboxes: true,
                    textFields: true,
                    buttons: true,
                    images: true,
                    labels: true,
                    toggleSwitches: true,
                },
            });
            if (existingForm === null) {
                res.status(400).send({
                    message: 'Not Found.',
                });
                return;
            }

            const formResponse = await prisma.form.update({
                where: { id: formId },
                data: {
                    name: body.form.name ? body.form.name.trim() : existingForm.name,
                    status: body.form.status ? body.form.status : 'DRAFT',
                    checkboxes: {
                        updateMany: {
                            where: {
                                id: { in: body.checkboxes.map((checkbox) => checkbox.id) },
                            },
                            data: body.checkboxes.map((checkbox) => {
                                const existingCheckbox = existingForm.checkboxes.find((cb) => cb.order);
                                return {
                                    id: checkbox.id,
                                    order: checkbox.order !== undefined ? checkbox.order : existingCheckbox,
                                };
                            }),
                        },
                    },
                    textFields: {
                        updateMany: {
                            where: {
                                id: {
                                    in: body.formTextFields.map((textField) => textField.id),
                                },
                            },
                            data: body.formTextFields.map((textField) => {
                                const existingTextField = existingForm.textFields.find((tf) => {
                                    tf.formId;
                                });
                            }),
                        },
                    },
                    toggleSwitches: {
                        updateMany: {
                            where: {
                                id: {
                                    in: body.formToggleSwitches.map((toggleSwitch) => toggleSwitch.id),
                                },
                            },
                            data: body.formToggleSwitches,
                        },
                    },
                    buttons: {
                        updateMany: {
                            where: {
                                id: { in: body.formButtons.map((button) => button.id) },
                            },
                            data: body.formButtons,
                        },
                    },
                    images: {
                        updateMany: {
                            where: { id: { in: body.formImages.map((image) => image.id) } },
                            data: body.formImages,
                        },
                    },
                    labels: {
                        updateMany: {
                            where: { id: { in: body.formLabels.map((label) => label.id) } },
                            data: body.formLabels,
                        },
                    },
                },
            });

            res.status(200).json(formResponse);
        } catch (error) {
            console.error('Error updating Form:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.delete('/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const user: User = req.user as User;
        const id: string = req.params.id as string;
        const response = await prisma.form.delete({
            where: {
                id: id,
                ownerId: user.id,
            },
        });
        res.status(200).send(response);
        console.log('Deletion successful');
        return;
    });

    return router;
};
