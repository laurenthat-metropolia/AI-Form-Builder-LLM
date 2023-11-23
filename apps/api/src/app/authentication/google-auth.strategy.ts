import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { environment } from '../configurations/environment';
import { GoogleProfileFromApi, normalizeGoogleProfile } from '../interfaces/googleProfile';
import { Request } from 'express';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: environment.APP_OAUTH2_CLIENT_ID,
            clientSecret: environment.APP_OAUTH2_CLIENT_SECRET,
            callbackURL: environment.APP_OAUTH2_CALLBACK_URL,
            passReqToCallback: true,
            scope: ['profile', 'email'],
        });
    }

    async validate(
        request: Request,
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfileFromApi,
        done: VerifyCallback,
    ): Promise<any> {
        done(null, normalizeGoogleProfile(profile));
    }
}
