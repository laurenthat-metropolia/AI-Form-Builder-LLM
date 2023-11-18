import express, { Response } from 'express';
import { generateAccessToken } from '../strategies/passport-jwt.service';

import { UserDatabase } from '../databases/userDatabase';
import passport from 'passport';
import { GoogleProfile } from '../interfaces/googleProfile';
import { environment } from '../configurations/environment';
import { AndroidLoginIntentBody } from '@draw2form/shared';

export const authController = () => {
    const router = express.Router();

    router.get('/google', passport.authenticate('google'));

    router.get('/google/callback', passport.authenticate('google'), async (req: any, res: Response) => {
        const googleProfile = req.user as GoogleProfile;
        const user = await UserDatabase.syncUserByGoogleProfile(googleProfile);
        const token = generateAccessToken(user);
        const params = new URLSearchParams();

        const loginInfo: AndroidLoginIntentBody = {
            user,
            token,
        };
        for (let [key, value] of Object.entries(loginInfo)) {
            params.set(key, JSON.stringify(value));
        }

        const url = environment.isProduction
            ? `/apps/launch/android?${params.toString()}`
            : `http://localhost:8443/apps/launch/android?${params.toString()}`;
        res.redirect(url);

        // const template = continueWithAppTemplate
        //   .replace('[launchLink]', `/android/auth/login?${params.toString()}`)
        //   .replace('[accessToken]', token.accessToken);
        //
        // res.send(template);
    });

    return router;
};
