import express, { Request, Response } from 'express';

import {
    config as configGoogleOAuth2,
    configRoutes as configGoogleOAuth2Routes,
} from './strategies/passport-google-oauth2.service.js';

import { config as configJWT, requiresAccessToken } from './strategies/passport-jwt.service.js';
import { configSession } from './configurations/configSession.js';
import { configParsers } from './configurations/configParsers.js';
import { environment } from './configurations/environment.js';
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
import { prisma } from './databases/userDatabase.js';
import { ErrorRequestHandler } from 'express-serve-static-core';
import morgan from 'morgan';
// Express App
const app = express();

app.use(
    morgan(':method :status :url :response-time', {
        skip: function (req, res) {
            return res.statusCode < 400;
        },
    }),
);

// Session is required by passport.js
configSession(app);

// Parsing capabilities for body of request.
configParsers(app);

// https://www.passportjs.org/packages/passport-google-oauth2/
configGoogleOAuth2();

// https://www.passportjs.org/packages/passport-jwt/
configJWT();

// adding required routes for authentication for this strategy
configGoogleOAuth2Routes(app);

/**
 * Required by Android
 * https://www.branch.io/resources/blog/how-to-open-an-android-app-from-the-browser/
 * https://developer.android.com/training/app-links/verify-android-applinks
 */

app.get('/.well-known/assetlinks.json', (req: Request, res: Response) => {
    res.json([
        {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
                namespace: 'android_app',
                //need to change the package name
                package_name: 'com.draw2form.ai',
                sha256_cert_fingerprints: environment.APP_ANDROID_SHA256_CERT_FINGERPRINT.split(','),
            },
        },
    ]);
});

app.get('/profile', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    const response = await prisma.user.findFirst({
        where: {
            id: (req.user as User).id,
        },
        include: {
            forms: true,
        },
    });
    res.status(200).send(response);
    return;
});

app.put('/profile', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
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

app.post('/form', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const user: User = req.user as User;
        const body = req.body as {
            form: Form;
            checkboxes: FormCheckbox[];
            formTextFields: FormTextfield[];
            formToggleSwitches: FormToggleSwitch[];
            formImages: FormImage[];
            formButtons: FormButton[];
            formLabels: FormLabel[];
        };

        const formResponse = await prisma.form.create({
            data: {
                ownerId: user.id,
                name: body.form.name.trim(),
                available: body.form.available,
                checkboxes: {
                    createMany: {
                        data: body.checkboxes.map((checkbox) => {
                            return {
                                order: checkbox.order,
                            };
                        }),
                    },
                },
                textfields: { createMany: { data: body.formTextFields } },
                toggleSwitches: { createMany: { data: body.formToggleSwitches } },
                buttons: { createMany: { data: body.formButtons } },
                images: { createMany: { data: body.formImages } },
                labels: { createMany: { data: body.formLabels } },
            },
        });

        res.status(200).json(formResponse);
    } catch (error) {
        console.error('Error creating Form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/form/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
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
app.delete('/form/:id', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
    const user: User = req.user as User;
    const id: string = req.params.id as string;
    const response = await prisma.form.delete({
        where: {
            id: id,
            ownerId: user.id,
        },
    });
    res.status(200).send(response);
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
