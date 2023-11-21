import {
    BadRequestException,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { transformUploadedFile } from '../services/upload.service';
import { fetchPopulatedUploadedFile, prisma } from '../databases/userDatabase';
import { InjectQueue } from '@nestjs/bull';
import { ConsumerTopics } from '../event-consumers/consumer-topics';
import { Queue } from 'bull';
import { ImageEvents } from '@draw2form/shared';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    constructor(@InjectQueue(ConsumerTopics.FormCreated) private imageEventsQueue: Queue) {}

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Upload image without creating Form',
        description: 'Upload Image and get processing results without logging in and creating form',
    })
    async createItem(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException({
                message: 'image is required.',
            });
        }
        const image = transformUploadedFile(file);

        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                url: image.url,
                key: image.key,
            },
        });

        await this.imageEventsQueue.add({ uploadedFile, form: null });

        return uploadedFile;
    }

    @Get(':id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'uploadedFileId',
    })
    @ApiOperation({
        summary: 'Get UploadedFile with details',
        description: 'Get UploadedFile with details',
    })
    async getItem(@Param() params: Record<string, string>) {
        const uploadedFileId = params.id;
        return await fetchPopulatedUploadedFile(uploadedFileId);
    }

    @Get(':id/status')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'uploadedFileId',
    })
    @ApiOperation({
        summary: 'Get UploadedFile event status',
        description: 'Get UploadedFile event status',
    })
    async getItemStatus(@Param() params: Record<string, string>) {
        const uploadedFileId = params.id;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile) {
            throw new NotFoundException();
        }
        const hasTextRes = uploadedFile.events.find((ev) => ev.event === ImageEvents.TextDetectionResponseReceived);
        const hasObjectRes = uploadedFile.events.find((ev) => ev.event === ImageEvents.ObjectDetectionResponseReceived);
        const hasFormRes = uploadedFile.events.find((ev) => ev.event === ImageEvents.FormComponentsCreated);
        return {
            textRecognition: hasTextRes === undefined ? 'loading' : hasTextRes === null ? 'error' : 'success',
            objectRecognition: hasObjectRes === undefined ? 'loading' : hasObjectRes === null ? 'error' : 'success',
            formGeneration: hasFormRes === undefined ? 'loading' : hasFormRes === null ? 'error' : 'success',
        };
    }
    @Get(':id/event/:event')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'uploadedFileId',
    })
    @ApiParam({
        name: 'event',
        type: 'string',
        description: 'event',
        enum: Object.values(ImageEvents),
    })
    @ApiOperation({
        summary: 'Get UploadedFile event details',
        description: 'Get UploadedFile event details',
    })
    async getItemEvent(@Param() params: Record<string, string>) {
        const uploadedFileId = params.id;
        const eventName = params.event;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile) {
            throw new NotFoundException();
        }
        const eventItem = uploadedFile.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            throw new NotFoundException();
        }
        return eventItem;
    }

    @Get(':id/event/:event/payload')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'uploadedFileId',
    })
    @ApiParam({
        name: 'event',
        type: 'string',
        description: 'event',
        enum: Object.values(ImageEvents),
    })
    @ApiOperation({
        summary: 'Get UploadedFile event payload',
        description: 'Get UploadedFile event payload',
    })
    async getItemEventPayload(@Param() params: Record<string, string>) {
        const uploadedFileId = params.id;
        const eventName = params.event;
        const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
        if (!uploadedFile) {
            throw new NotFoundException();
        }
        const eventItem = uploadedFile.events.find((event) => event.event === eventName) ?? null;
        if (!eventItem) {
            throw new NotFoundException();
        }
        return eventItem.payload;
    }
}
