import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import {
  GoogleProfileFromApi,
  normalizeGoogleProfile,
} from '../interfaces/googleProfile';
import { environment } from '../configurations/environment';

export function config() {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: environment.APP_OAUTH2_CLIENT_ID,
        clientSecret: environment.APP_OAUTH2_CLIENT_SECRET,
        callbackURL: environment.APP_OAUTH2_CALLBACK_URL,
        passReqToCallback: true,
        scope: ['email', 'profile'],
      },
      function (
        request: any,
        accessToken: any,
        refreshToken: any,
        profile: GoogleProfileFromApi,
        done: any
      ) {
        const error = null;
        return done(error, normalizeGoogleProfile(profile));
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done) {
    done(null, user);
  });
}
