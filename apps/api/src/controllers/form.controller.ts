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

export const formController = () => {
    const router = express.Router();

    router.post('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        try {
            const user = req.user as User;
            const body = req.body;
            const formResponse = await prisma.form.create({
                data: {
                    ownerId: user.id,
                    name: body.form.name?.trim(),
                    available: body.form.available ?? false,
                },
                include: {
                    checkboxes: true,
                    textFields: true,
                    toggleSwitches: true,
                    buttons: true,
                    labels: true,
                    images: true,
                },
            });

            res.status(200).json(formResponse);
        } catch (error) {
            console.error('Error creating Form:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

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
                    available: body.form.available ? body.form.available : false,
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
