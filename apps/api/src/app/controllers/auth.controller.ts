import { Response } from 'express';

import { UserDatabase } from '../databases/userDatabase';
import { GoogleProfile } from '../interfaces/googleProfile';
import { environment } from '../configurations/environment';
import { LoginInformation } from '@draw2form/shared';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from '../authentication/google-auth.guard';
import { JwtAuthStrategy } from '../authentication/jwt-auth.strategy';

@Controller('auth')
export class AuthController {
    constructor() {}

    @Get('google')
    @UseGuards(GoogleOauthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async auth() {}

    @Get('google/callback')
    @UseGuards(GoogleOauthGuard)
    async googleAuthCallback(@Req() req, @Res() res: Response) {
        const googleProfile = req.user as GoogleProfile;
        const user = await UserDatabase.syncUserByGoogleProfile(googleProfile);
        const token = JwtAuthStrategy.generateAccessToken(user);
        const params = new URLSearchParams();

        const loginInfo: LoginInformation = {
            user,
            token,
        };
        for (let [key, value] of Object.entries(loginInfo)) {
            params.set(key, JSON.stringify(value));
        }
        for (let [key, value] of Object.entries(loginInfo)) {
            params.set(key, JSON.stringify(value));
        }

        const url = environment.isProduction
            ? `/apps/launch/android?${params.toString()}`
            : `http://localhost:8443/apps/launch/android?${params.toString()}`;
        res.redirect(url);
    }
}
