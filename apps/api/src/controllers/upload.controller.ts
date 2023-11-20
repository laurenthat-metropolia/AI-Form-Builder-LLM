import express, { Request, Response } from 'express';
import { requiresAccessToken, requiresAccessTokenAndAllowAnonymous } from '../strategies/passport-jwt.service';
import { requireImageToBeUploaded, transformUploadedFile, uploadImageMiddleware } from '../configurations/configUpload';
import { User } from '@prisma/client';
import { fetchPopulatedUploadedFile, prisma } from '../databases/userDatabase';
import { ImageEvents } from '@draw2form/shared';
import { processUploadedFile } from '../services/prediction.service';

export const uploadController = () => {
    const router = express.Router();

    router.post(
        '/',
        requiresAccessTokenAndAllowAnonymous,
        uploadImageMiddleware,
        requireImageToBeUploaded,
        async (req: Request, res: Response): Promise<void> => {
            const user: User | undefined = req.user as User | undefined;
            const image = transformUploadedFile(req.file);

            // Upload Image
            const uploadedFile = await prisma.uploadedFile.create({
                data: {
                    url: image.url,
                    key: image.key,
                },
            });
            // Send the response
            res.status(200).send(uploadedFile);

            console.log(`UploadedFile processing "${uploadedFile.id}" Started.`);
            processUploadedFile(uploadedFile)
                .then(() => {
                    console.log(`UploadedFile processing "${uploadedFile.id}" Completed.`);
                })
                .catch((err) => {
                    console.log(`UploadedFile processing "${uploadedFile.id}" Failed.`);
                    console.log({ uploadedFile, err });
                });
        },
    );

    router.get('/:id', requiresAccessTokenAndAllowAnonymous, async (req: Request, res: Response) => {
        const uploadedFileId = req.params.id;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        res.status(200).send(uploadedFile);
    });

    router.get('/:id/status', requiresAccessTokenAndAllowAnonymous, async (req: Request, res: Response) => {
        const uploadedFileId = req.params.id;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile) {
            res.status(404).send({
                message: 'UploadedFile Not Found.',
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

    router.get('/:id/event/:event', requiresAccessTokenAndAllowAnonymous, async (req: Request, res: Response) => {
        const uploadedFileId = req.params.id;
        const eventName = req.params.event;

        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile) {
            res.status(404).send({
                message: 'UploadedFile Not Found.',
            });
            return;
        }
        const eventItem = uploadedFile.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            res.status(404).send({
                message: 'Event Not Found.',
            });
            return;
        }
        res.status(200).send(eventItem);
    });

    router.get('/:id/event/:event/payload', requiresAccessToken, async (req: Request, res: Response) => {
        const uploadedFileId = req.params.id;
        const eventName = req.params.event;

        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile) {
            res.status(404).send({
                message: 'UploadedFile Not Found.',
            });
            return;
        }
        const eventItem = uploadedFile.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            res.status(404).send({
                message: 'Event Not Found.',
            });
            return;
        }

        res.status(200).send(eventItem.payload);
    });

    return router;
};
