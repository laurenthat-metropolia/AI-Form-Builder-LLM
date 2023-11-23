import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Form, UploadedFile } from '@prisma/client';
import { populateUserFormBasedOnChatGPTResponse } from '../services/form.service';
import { ConsumerTopics } from './consumer-topics';
import { PredictionService } from '../services/prediction.service';

@Processor(ConsumerTopics.FormCreated)
export class ImageEventHandler {
    constructor(private predictionService: PredictionService) {}
    @Process()
    async transcode(job: Job<{ uploadedFile: UploadedFile; form: Form | null }>) {
        const { uploadedFile, form } = job.data;
        const processedUploadedFile = await this.predictionService
            .processUploadedFile(uploadedFile)
            .then((data) => {
                console.log(`UploadedFile processing "${uploadedFile.id}" Completed.`);
                return data;
            })
            .catch((err) => {
                console.log(`UploadedFile processing "${uploadedFile.id}" Failed.`);
                console.log(err);
                return null;
            });

        if (processedUploadedFile && form) {
            await populateUserFormBasedOnChatGPTResponse(
                processedUploadedFile.name,
                processedUploadedFile.components,
                form,
            )
                .then((data) => {
                    console.log(`UploadedFile processing "${uploadedFile.id}" Form Completed.`);
                    return data;
                })
                .catch((err) => {
                    console.log(`UploadedFile processing "${uploadedFile.id}" Form Failed.`);
                    console.log(err);
                    return null;
                });
        }
    }

    @OnQueueActive()
    onActive(job: Job) {
        console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
    }
}
