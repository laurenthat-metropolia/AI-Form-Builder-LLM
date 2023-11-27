import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';
import { prisma } from '../databases/userDatabase';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserRequest } from '../dtos/UpdateUser.request';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiConsumes('application/json')
    @ApiOperation({
        summary: 'Get Populated Profile',
        description: 'Get Populated Profile',
    })
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

    @Patch()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Update Profile',
        description: 'Update Profile',
    })
    async editProfile(@Req() request: Request, @Body() body: UpdateUserRequest) {
        const user = request.user as User;

        return prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                ...user,
                name: body.name ?? user.name,
            },
        });
    }
}
