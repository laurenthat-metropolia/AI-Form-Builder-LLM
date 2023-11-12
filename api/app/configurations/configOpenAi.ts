import OpenAI from 'openai';
import { environment } from './environment.js';
import { DetectionResponse } from './configObjectDetection.js';
import { TextDetectionResponse } from './configAzureVision.js';

export function configOpenAi() {
    const openAI = new OpenAI({
        organization: environment.APP_OPENAI_ORGANIZATION,
        apiKey: environment.APP_OPENAI_API_KEY,
    });

    async function generateFormStructure(objects: DetectionResponse, texts: TextDetectionResponse) {
        const tables: string = `
model FormTextfield {
  id        String @id @default(uuid())
}

model FormCheckbox {
  id        String @id @default(uuid())
  order     Int
}

model FormToggleSwitch {
  id        String @id @default(uuid())
  order     Int
}

model FormImage {
  id      String @id @default(uuid())
  order   Int
  imageId String
}

model FormButton {
  id     String @id @default(uuid())
  order  Int
  type   String
}

model FormLabel {
  id     String @id @default(uuid())
  order  Int
  value  String
}
`;
        const objectsPredictions: string = JSON.stringify(objects);
        const textPredictions: string = JSON.stringify(objects);
        try {
            const body: OpenAI.ChatCompletionCreateParams = {
                messages: [
                    {
                        role: 'system',
                        content: [
                            `You are designed to accept drawing predictions of form components and written text predictions as input.`,
                            `Here is my database tables in prisma format: \n${tables}\n`,
                            `You are supposed map each prediction to the relevant database model and output it all as an array of objects.`,
                            `Each object should have the following keys:`,
                            `One key should be "type" and it is the name of database table.`,
                            `One key should be "class" and it is the name of the mapped prediction class.`,
                            `One key should be "order" and it should be the order of the component in the predictions based on coordinates.`,
                            `One key should be "label" and it should be added only if there is a text prediction in the same line or inside the component..`,
                        ].join('\n'),
                    },
                    {
                        role: 'user',
                        content: [
                            `Here is a list of drawing predictions of form components: \n${objectsPredictions}\n`,
                            `Here is a list of drawing predictions of texts: \n${textPredictions}\n`,
                            `Create the JSON with array of mapped predictions to database models.`,
                        ].join('\n'),
                    },
                ],
                response_format: { type: 'json_object' },
                model: 'gpt-3.5-turbo-1106',
            };
            const chatCompletion = await openAI.chat.completions.create(body);
            const content = chatCompletion.choices[0]?.message?.content;

            return content ? JSON.parse(content) : null;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    return {
        openAI: openAI,
        generateFormStructure: generateFormStructure,
    };
}

// router.get('/', async (req: Request, res: Response) => {
//     const body: OpenAI.ChatCompletionCreateParams = {
//         messages: [{ role: 'user', content: 'Say this is a test' }],
//         model: 'gpt-3.5-turbo',
//     };
//     const chatCompletion = await openai.chat.completions.create(body);
//
//     res.send({
//         input: body,
//         output: chatCompletion,
//     });
//     return;
// });
