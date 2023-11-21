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
import morgan from 'morgan';
import { PrismaModel } from './_gen/prisma-class';

async function bootstrap() {
    Logger.log(`Starting Version: \"${environment.APP_BUILD_VERSION}\" Environment: \"${environment.NODE_ENV}\"`);

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
        .setVersion(environment.APP_BUILD_VERSION)
        .addBearerAuth(
            {
                name: 'Authorization',
                bearerFormat: 'Bearer',
                type: 'http',
                scheme: 'bearer',
                in: 'Header',
            },
            'Bearer',
        )
        .build();

    const document = SwaggerModule.createDocument(app, documentBuilder, {
        extraModels: [...PrismaModel.extraModels],
    });

    SwaggerModule.setup(`api/docs`, app, document, {
        swaggerOptions: {
            persistAuthorization: true, // this
        },
    });

    app.use(morgan(':method :status :url :response-time'));

    const port = 8000;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();

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
