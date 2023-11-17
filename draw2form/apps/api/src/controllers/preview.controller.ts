import express, {
  Application,
  Request,
  RequestHandler,
  Response,
} from 'express';
import {
  requireImageToBeUploaded,
  transformUploadedFile,
  uploadImageMiddleware,
} from '../configurations/configUpload';
import {
  fetchPopulatedUploadedFile,
  prisma,
  UserDatabase,
} from '../databases/userDatabase';
import { parseUploadedFile, safeParse } from '../utils';
import { processUploadedFile } from '../services/background.service';

export const previewController = () => {
  const router = express.Router();

  router.post(
    '/upload',
    uploadImageMiddleware,
    requireImageToBeUploaded,
    async (req: Request, res: Response) => {
      const image = transformUploadedFile(req.file);

      // Upload Image
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          url: image.url,
          key: image.key,
        },
      });
      // Send the response
      res.status(200).send(uploadedFile);

      processUploadedFile(uploadedFile).then();
    }
  );

  router.get('/upload/:id', async (req: Request, res: Response) => {
    const uploadedFileId = req.params.id;
    const uploadedFile = await fetchPopulatedUploadedFile(uploadedFileId);
    const parsedUploadedFile = parseUploadedFile(uploadedFile);
    res.status(200).send(parsedUploadedFile);
  });

  return router;
};
