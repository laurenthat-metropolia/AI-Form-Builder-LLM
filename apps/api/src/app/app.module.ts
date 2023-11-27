import { Module } from '@nestjs/common';

import { AppValidationPipe } from './validation.pipe';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthStrategy } from './authentication/jwt-auth.strategy';
import { GoogleAuthStrategy } from './authentication/google-auth.strategy';
import { AnonymousAuthStrategy } from './authentication/anonymous-auth.strategy';
import { FormController } from './controllers/form.controller';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bull';
import { UploadService } from './services/upload.service';
import { ImageEventHandler } from './event-consumers/image-event.handler';
import { ConsumerTopics } from './event-consumers/consumer-topics';
import { environment } from './configurations/environment';
import { ProfileController } from './controllers/profile.controller';
import { UploadController } from './controllers/upload.controller';
import { JwtModule } from '@nestjs/jwt';
import { OpenaiService } from './services/openai.service';
import { PredictionService } from './services/prediction.service';
import { FormFieldController } from './controllers/form-field.controller';

@Module({
    imports: [
        MulterModule.register({
            storage: UploadService.storageEngine,
        }),
        BullModule.forRoot({
            redis: {
                host: environment.APP_REDIS_HOSTNAME,
                port: 6379,
                password: environment.APP_REDIS_PASSWORD,
            },
        }),
        BullModule.registerQueue({
            name: ConsumerTopics.FormCreated,
        }),
        JwtModule.register({
            global: true,
            secret: environment.APP_JWT_SECRET,
            signOptions: {
                expiresIn: '30d',
                audience: environment.APP_JWT_AUDIENCE,
                issuer: environment.APP_JWT_ISSUER,
            },
        }),
    ],
    controllers: [AuthController, ProfileController, FormController, FormFieldController, UploadController],
    providers: [
        JwtAuthStrategy,
        GoogleAuthStrategy,
        AnonymousAuthStrategy,
        AppValidationPipe,
        ImageEventHandler,
        OpenaiService,
        PredictionService,
    ],
})
export class AppModule {}
