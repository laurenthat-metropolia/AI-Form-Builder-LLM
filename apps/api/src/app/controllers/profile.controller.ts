import { Controller, Get, NotImplementedException, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';
import { prisma } from '../databases/userDatabase';

@Controller('profile')
export class ProfileController {
    @Get()
    @UseGuards(JwtAuthGuard)
    async profile(@Req() request: Request) {
        const user = request.user as User;
        const response = await prisma.user.findFirst({
            where: {
                id: user.id,
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
        return response;
    }

    @Put()
    async editProfile() {
        throw new NotImplementedException();
        //     router.put('/', requiresAccessToken, async (req: Request, res: Response): Promise<void> => {
        //         const user: User = req.user as User;
        //         const body: User = req.body as User;
        //         const response = await prisma.user.update({
        //             where: {
        //                 id: user.id,
        //             },
        //             data: {
        //                 ...user,
        //                 ...body,
        //                 id: user.id,
        //                 email: user.email,
        //             },
        //         });
        //
        //         res.status(200).send(response);
        //         return;
        //     });
    }
}
