/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { json, urlencoded } from 'body-parser';
import { AppValidationPipe } from './app/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { environment } from './app/configurations/environment';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    app.use(urlencoded({ limit: '100mb', extended: true }));
    app.use(json({ limit: '100mb' }));

    app.enableCors();

    const appValidationPipe: AppValidationPipe = app.get(AppValidationPipe);
    app.useGlobalPipes(appValidationPipe);

    const documentBuilder = new DocumentBuilder()
        .setTitle('Draw2Form')
        .setDescription('Controllers')
        .setVersion(environment.APP_BUILD_VERSION)
        .addSecurity('BearerAuth', {
            type: 'http',
            scheme: 'bearer',
        })
        .build();

    const document = SwaggerModule.createDocument(app, documentBuilder, {});

    SwaggerModule.setup(`api/docs`, app, document);

    const port = 8000;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
