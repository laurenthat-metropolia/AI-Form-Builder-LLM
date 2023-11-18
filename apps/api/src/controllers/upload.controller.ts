import express, { Request, Response } from 'express';
import { requiresAccessToken } from '../strategies/passport-jwt.service';
import { requireImageToBeUploaded, transformUploadedFile, uploadImageMiddleware } from '../configurations/configUpload';
import { User } from '@prisma/client';
import { fetchPopulatedUploadedFile, prisma } from '../databases/userDatabase';
import { ImageEvents } from '@draw2form/shared';
import { processUploadedFile } from '../services/prediction.service';

export const uploadController = () => {
    const router = express.Router();

    router.post(
        '/',
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

    router.get('/:id', requiresAccessToken, async (req: Request, res: Response) => {
        const uploadedFileId = req.params.id;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        res.status(200).send(uploadedFile);
    });

    router.get('/:id/status', requiresAccessToken, async (req: Request, res: Response) => {
        const user = req.user as User;

        const uploadedFileId = req.params.id;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile || uploadedFile.ownerId !== user.id) {
            res.status(401).send({
                message: 'Not Authorized.',
            });
            return;
        }

        const hasTextRes = uploadedFile.events.find((ev) => ev.event === ImageEvents.TextDetectionResponseReceived);
        const hasObjectRes = uploadedFile.events.find((ev) => ev.event === ImageEvents.ObjectDetectionResponseReceived);
        const hasFormRes = uploadedFile.events.find((ev) => ev.event === ImageEvents.FormComponentsCreated);

        res.status(200).send({
            textRecognition: hasTextRes === undefined ? 'loading' : hasTextRes === null ? 'error' : 'success',
            objectRecognition: hasObjectRes === undefined ? 'loading' : hasObjectRes === null ? 'error' : 'success',
            formGeneration: hasFormRes === undefined ? 'loading' : hasFormRes === null ? 'error' : 'success',
        });
    });

    return router;
};
