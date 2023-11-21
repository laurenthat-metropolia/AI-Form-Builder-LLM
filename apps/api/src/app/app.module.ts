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
    ],
    controllers: [AuthController, FormController, ProfileController, UploadController],
    providers: [JwtAuthStrategy, GoogleAuthStrategy, AnonymousAuthStrategy, AppValidationPipe, ImageEventHandler],
})
export class AppModule {}
