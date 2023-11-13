import multer, { Multer } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';
import { environment } from './environment.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export interface UploadedFile {
    key: string;
    url: string;
}

const bucket = 'draw2form';
export const s3 = new S3Client({
    endpoint: environment.APP_S3_ENDPOINT,
    forcePathStyle: true,
    tls: environment.NODE_ENV === 'development',
    region: 'eu-west-1',
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

export const uploadImageMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    return upload.single('image')(req, res, next);
};
export const requireImageToBeUploaded: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        throw new Error('Image is required');
    } else {
        next();
    }
};

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
