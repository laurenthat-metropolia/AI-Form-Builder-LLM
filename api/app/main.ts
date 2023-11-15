import express from 'express';
import cors from 'cors';

import { config as configGoogleOAuth2 } from './strategies/passport-google-oauth2.service.js';

import { config as configJWT } from './strategies/passport-jwt.service.js';
import { configSession } from './configurations/configSession.js';
import { configSwagger } from './configurations/configSwagger.js';
import { configLogging } from './configurations/configLogging.js';
import { previewController } from './controllers/preview.controller.js';
import { uploadController } from './controllers/upload.controller.js';
import { profileController } from './controllers/profile.controller.js';
import { formController } from './controllers/form.controller.js';
import { authController } from './controllers/auth.controller.js';
import { expressGlobalErrorHandler } from './error.handler.js';
import { environment } from './configurations/environment.js';

console.log(`Starting Version: \"${environment.APP_BUILD_VERSION}\" Environment: \"${environment.NODE_ENV}\"`);

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

router.use('/auth', authController());

router.use('/preview', previewController());

router.use('/upload', uploadController());

router.use('/profile', profileController());

router.use('/form', formController());

app.use(expressGlobalErrorHandler);

app.listen(8000, '0.0.0.0', (): void => {
    console.log('Started listening on port 8000');
});

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
