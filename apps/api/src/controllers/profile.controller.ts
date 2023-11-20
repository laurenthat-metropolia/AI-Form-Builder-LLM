import express, { Request, Response } from 'express';
import { prisma } from '../databases/userDatabase';
import { requiresAccessToken } from '../strategies/passport-jwt.service';
import { User } from '@prisma/client';

export const profileController = () => {
    const router = express.Router();

    router.get('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        const response = await prisma.user.findFirst({
            where: {
                id: (req.user as User).id,
            },
            include: {
                forms: {
                    include: {
                        checkboxes: true,
                        buttons: true,
                        images: true,
                        labels: true,
                        textFields: true,
                        toggleSwitches: true,
                        upload: {
                            include: {
                                events: true,
                            },
                        },
                    },
                },
                formSubmissions: true,
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
