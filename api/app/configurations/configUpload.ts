import multer, { Multer } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';
import { environment } from './environment.js';
import { NextFunction, Request, Response } from 'express';

export interface UploadedFile {
    id: string;
    url: string;
}

export function configUpload() {
    const bucket = 'draw2form';
    const s3 = new S3Client({
        endpoint: environment.APP_S3_ENDPOINT,
        forcePathStyle: true,
        tls: environment.NODE_ENV === 'development',

        credentials: {
            accessKeyId: environment.APP_S3_ACCESS_KEY,
            secretAccessKey: environment.APP_S3_SECRET_KEY,
        },
    });

    const storage = multerS3({
        s3: s3,
        bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req: Express.Request, file: Express.Multer.File, callback: (error: any, metadata?: any) => void) => {
            callback(null, file);
        },
        key: (req: Express.Request, file: Express.Multer.File, callback: (error: any, acl?: string) => void) => {
            callback(null, randomUUID() + path.parse(file.originalname).ext);
        },
    });

    const upload = multer({ storage });

    const uploadImageMiddleware = upload.single('image');

    const requireImageToBeUploaded = (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            res.sendStatus(400).json({
                message: 'Image is required.',
            });
        } else {
            next();
        }
    };

    const transformUploadedFile = (file: Request['file']): UploadedFile => {
        if (!file) {
            throw new Error('File is expected for transformation');
        }
        const s3File = file as any;
        return {
            id: s3File.key,
            url: `https://draw2form.ericaskari.com/files/${s3File.key}`,
        };
    };

    return { s3, uploadImageMiddleware, requireImageToBeUploaded, transformUploadedFile };
}
