import express, { Response } from 'express';
import { generateAccessToken } from '../strategies/passport-jwt.service';

import { UserDatabase } from '../databases/userDatabase';
import passport from 'passport';
import { GoogleProfile } from '../interfaces/googleProfile';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export const authController = () => {
  const router = express.Router();

  const continueWithAppTemplate = readFileSync(
    resolve(
      process.cwd(),
      'apps',
      'api',
      'src',
      'templates',
      'continue-with-app.html'
    )
  ).toString();

  router.get('/google', passport.authenticate('google'));

  router.get(
    '/google/callback',
    passport.authenticate('google'),
    async (req: any, res: Response) => {
      const googleProfile = req.user as GoogleProfile;
      const user = await UserDatabase.syncUserByGoogleProfile(googleProfile);
      const token = generateAccessToken(user);
      const params = new URLSearchParams();
      params.set('token', JSON.stringify(token));
      params.set('user', JSON.stringify(user));
      const template = continueWithAppTemplate
        .replace('[launchLink]', `/android/auth/login?${params.toString()}`)
        .replace('[accessToken]', token.accessToken);

      res.send(template);
    }
  );

  return router;
};
