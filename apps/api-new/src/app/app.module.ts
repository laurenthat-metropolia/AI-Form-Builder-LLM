import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppValidationPipe } from './validation.pipe';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthStrategy } from './authentication/jwt-auth.strategy';
import { GoogleAuthStrategy } from './authentication/google-auth-strategy';
import { AnonymousAuthStrategy } from './authentication/anonymous-auth.strategy';
import { FormController } from './controllers/form.controller';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bull';
import { UploadService } from './services/upload.service';

@Module({
    imports: [
        MulterModule.register({
            storage: UploadService.storageEngine,
        }),
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'image-events',
        }),
    ],
    controllers: [AppController, AuthController, FormController],
    providers: [AppService, JwtAuthStrategy, GoogleAuthStrategy, AnonymousAuthStrategy, AppValidationPipe],
})
export class AppModule {}
