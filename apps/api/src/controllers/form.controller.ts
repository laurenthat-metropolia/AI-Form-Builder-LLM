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
import { FormStatus } from '@draw2form/shared';
import { processUploadedFile } from '../services/prediction.service';
import { populateUserFormBasedOnChatGPTResponse } from '../services/form.service';

export const formController = () => {
    const router = express.Router();

    router.get('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const user = req.user as User;
        res.send(
            await prisma.form.findMany({
                where: {
                    ownerId: user.id,
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
            }),
        );
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
