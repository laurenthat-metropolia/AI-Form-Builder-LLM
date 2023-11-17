import express from 'express';
import cors from 'cors';
import path from 'path';

import { config as configGoogleOAuth2 } from './strategies/passport-google-oauth2.service';

import { config as configJWT } from './strategies/passport-jwt.service';
import { configSession } from './configurations/configSession';
import { configSwagger } from './configurations/configSwagger';
import { configLogging } from './configurations/configLogging';
import { previewController } from './controllers/preview.controller';
import { uploadController } from './controllers/upload.controller';
import { profileController } from './controllers/profile.controller';
import { formController } from './controllers/form.controller';
import { authController } from './controllers/auth.controller';
import { expressGlobalErrorHandler } from './error.handler';
import { environment } from './configurations/environment';

console.log(
  `Starting Version: \"${environment.APP_BUILD_VERSION}\" Environment: \"${environment.NODE_ENV}\"`
);

// Express App
const app = express();

// include before other routes
app.use(cors());

// Loggers
configLogging(app);

// Session is required by passport.js
configSession(app);

// Parsing capabilities for body of request.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Swagger UI
configSwagger(app);

// https://www.passportjs.org/packages/passport-google-oauth2/
configGoogleOAuth2();

// https://www.passportjs.org/packages/passport-jwt/
configJWT();

const router = express.Router();

app.use('/api', router);

router.use('/assets', express.static(path.join(__dirname, 'assets')));

router.use('/auth', authController());

router.use('/preview', previewController());

router.use('/upload', uploadController());

router.use('/profile', profileController());

router.use('/form', formController());

app.use(expressGlobalErrorHandler);

const server = app.listen(8000, '0.0.0.0', (): void => {
  console.log('Started listening on port 8000');
});
server.on('error', console.error);

// Support Docker Container Exit order
process.on('SIGTERM', function () {
  console.log('\ncaught SIGTERM, stopping gracefully');
  process.exit(1);
});
// Support Docker Container Exit order
process.on('SIGINT', function () {
  console.log('\ncaught SIGINT, stopping gracefully');
  process.exit();
});
