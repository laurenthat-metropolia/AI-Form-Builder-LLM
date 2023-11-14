import express, { Request, Response } from 'express';
import cors from 'cors';

import {
    config as configGoogleOAuth2,
    configRoutes as configGoogleOAuth2Routes,
} from './strategies/passport-google-oauth2.service.js';

import { config as configJWT, requiresAccessToken } from './strategies/passport-jwt.service.js';
import { configSession } from './configurations/configSession.js';
import { configParsers } from './configurations/configParsers.js';
import {
    User,
    Form,
    FormButton,
    FormCheckbox,
    FormTextfield,
    FormImage,
    FormLabel,
    FormToggleSwitch,
} from '@prisma/client';
import { fetchPopulatedUploadedFile, prisma, UserDatabase } from './databases/userDatabase.js';
import { ErrorRequestHandler } from 'express-serve-static-core';
import { configSwagger } from './configurations/configSwagger.js';
import { configLogging } from './configurations/configLogging.js';
import { previewController } from './controllers/preview.controller.js';
import {
    requireImageToBeUploaded,
    transformUploadedFile,
    uploadImageMiddleware,
} from './configurations/configUpload.js';
import { processUploadedFile } from './background.service.js';
import { parseUploadedFile } from './utils.js';

// Database Helpers
const { upsertImageEvent } = UserDatabase;

// Express App
const app = express();

app.use(cors()); // include before other routes

// Loggers
configLogging(app);

// Session is required by passport.js
configSession(app);

// Parsing capabilities for body of request.
configParsers(app);

// Swagger UI
configSwagger(app);

// https://www.passportjs.org/packages/passport-google-oauth2/
configGoogleOAuth2();

// https://www.passportjs.org/packages/passport-jwt/
configJWT();

// Adding required routes for authentication for this strategy
configGoogleOAuth2Routes(app);

const router = express.Router();

app.use('/api', router);

app.use('/api/preview', previewController());

router.get('/profile', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    const response = await prisma.user.findFirst({
        where: {
            id: (req.user as User).id,
        },
        include: {
            forms: true,
            uploads: {
                include: {
                    events: true,
                },
            },
            formSubmission: true,
        },
    });
    res.status(200).send(response);
    return;
});

router.put('/profile', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    const user: User = req.user as User;
    const body: User = req.body as User;
    const response = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            ...user,
            ...body,
            id: user.id,
            email: user.email,
        },
    });

    res.status(200).send(response);
    return;
});
router.post(
    '/upload',
    requiresAccessToken,
    uploadImageMiddleware,
    requireImageToBeUploaded,
    async (req: Request, res: Response): Promise<void> => {
        const user: User = req.user as User;
        const image = transformUploadedFile(req.file);

        // Upload Image
        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                url: image.url,
                key: image.key,
                ownerId: user.id,
            },
        });
        // Send the response
        res.status(200).send(uploadedFile);

        processUploadedFile(uploadedFile);
    },
);

router.get('/upload/:id', requiresAccessToken, async (req: Request, res: Response) => {
    const user = req.user as User;

    const uploadedFileId = req.params.id;
    const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
    if (!uploadedFile || uploadedFile.ownerId !== user.id) {
        res.status(401).send({
            message: 'Not Authorized.',
        });
        return;
    }
    const parsedUploadedFile = parseUploadedFile(uploadedFile);
    res.status(200).send(parsedUploadedFile);
});

router.post('/form', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User;
        const body = req.body;
        console.log('Received Body:', body);
        const formResponse = await prisma.form.create({
            data: {
                ownerId: user.id,
                name: body.form.name?.trim(),
                available: body.form.available ?? false,
            },
            include: {
                checkboxes: true,
                textfields: true,
                toggleSwitches: true,
                buttons: true,
                labels: true,
                images: true,
            },
        });

        console.log('Created Form:', formResponse);

        res.status(200).json(formResponse);
    } catch (error) {
        console.error('Error creating Form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/form/:formId', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const formId = req.params.formId;
        const form = await prisma.form.findUnique({
            where: {
                id: formId,
            },
            include: {
                checkboxes: true,
                textfields: true,
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

router.put('/form/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const user: User = req.user as User;
        const formId = req.params.id;
        const body = req.body as {
            form: Form;
            checkboxes: FormCheckbox[];
            formTextFields: FormTextfield[];
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
                textfields: true,
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
                        where: { id: { in: body.checkboxes.map((checkbox) => checkbox.id) } },
                        data: body.checkboxes.map((checkbox) => {
                            const existingCheckbox = existingForm.checkboxes.find((cb) => cb.order);
                            return {
                                id: checkbox.id,
                                order: checkbox.order !== undefined ? checkbox.order : existingCheckbox,
                            };
                        }),
                    },
                },
                textfields: {
                    updateMany: {
                        where: { id: { in: body.formTextFields.map((textfield) => textfield.id) } },
                        data: body.formTextFields.map((textfield) => {
                            const existingTextfield = existingForm.textfields.find((tf) => {
                                tf.formId;
                            });
                        }),
                    },
                },
                toggleSwitches: {
                    updateMany: {
                        where: { id: { in: body.formToggleSwitches.map((toggleSwitch) => toggleSwitch.id) } },
                        data: body.formToggleSwitches,
                    },
                },
                buttons: {
                    updateMany: {
                        where: { id: { in: body.formButtons.map((button) => button.id) } },
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
router.delete('/form/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
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

// Define a global error handler middleware
app.use((async (err, req: Request, res: Response, next): Promise<void> => {
    // Handle the error here
    console.error(err);

    // Set an appropriate status code for the error
    res.status(500);

    // Send a JSON response with the error message
    res.json({
        error: 'Internal Server Error',
        message: err.message,
    });
}) satisfies ErrorRequestHandler<any>);

app.listen(8000, '0.0.0.0', (): void => {
    console.log('Started listening on port 8000');
});
process.on('SIGTERM', function () {
    console.log('\ncaught SIGTERM, stopping gracefully');
    process.exit(1);
});
process.on('SIGINT', function () {
    console.log('\ncaught SIGINT, stopping gracefully');
    process.exit();
});
