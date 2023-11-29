import { Request } from 'express';
import { StorageEngine } from 'multer';
import { environment } from '../configurations/environment';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Client } from 'minio';

export interface UploadedFile {
    key: string;
    url: string;
}

export const transformUploadedFile = (file: Request['file']): UploadedFile => {
    if (!file) {
        throw new Error('File is expected for transformation');
    }
    const s3File = file as any;
    return {
        key: s3File.key,
        url: `https://draw2form.ericaskari.com/files/${s3File.key}`,
    };
};

@Injectable()
export class UploadService {
    static bucket = 'draw2form';
    static minioClient = new Client({
        endPoint: environment.APP_S3_ENDPOINT,
        port: environment.NODE_ENV === 'development' ? 443 : 9000,
        useSSL: environment.NODE_ENV === 'development',
        region: 'eu-west-1',
        accessKey: environment.APP_S3_ACCESS_KEY,
        secretKey: environment.APP_S3_SECRET_KEY,
    });

    static storageEngine: StorageEngine = {
        async _handleFile(
            req: Request,
            file: Express.Multer.File,
            callback: (error?: any, info?: Partial<Express.Multer.File>) => void,
        ): Promise<void> {
            const key = randomUUID() + path.parse(file.originalname).ext;
            console.log(`[UploadService] Uploading ${key} with size: ${file.size}`);
            await UploadService.upload(file, UploadService.bucket, key, file.mimetype);
            (file as any).key = key;
            callback(undefined, file);
        },
        _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error | null) => void): void {},
    };

    static async upload(file: Express.Multer.File, bucket: string, name: string, mimetype: string) {
        return UploadService.minioClient.putObject(bucket, name, file.stream);
    }
}
