import express, { Application, Request, RequestHandler, Response } from 'express';
import { prisma } from '../databases/userDatabase.js';
import { requiresAccessToken } from '../strategies/passport-jwt.service.js';
import { User } from '@prisma/client';

export const profileController = () => {
    const router = express.Router();

    router.get('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
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

    router.put('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
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

    return router;
};
