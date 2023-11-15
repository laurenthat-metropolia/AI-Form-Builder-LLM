import OpenAI from 'openai';
import { environment } from './environment.js';
import { ObjectDetectionResponse } from './configObjectDetection.js';
import { TextDetectionResponse } from './configAzureVision.js';
import { safeParse } from '../utils.js';

export const openAI = new OpenAI({
    organization: environment.APP_OPENAI_ORGANIZATION,
    apiKey: environment.APP_OPENAI_API_KEY,
});

export async function generateFormStructure(objects: ObjectDetectionResponse, texts: TextDetectionResponse) {
    const tables: string = `
model FormTextField {
  id        String @id @default(uuid())
  label     String
}

model FormCheckbox {
  id        String @id @default(uuid())
  label     String
  order     Int
}

model FormToggleSwitch {
  id        String @id @default(uuid())
  label     String
  order     Int
}

model FormImage {
  id      String @id @default(uuid())
  order   Int
  imageId String
}

model FormButton {
  id     String @id @default(uuid())
  label     String
  order  Int
  type   String
}

model FormLabel {
  id     String @id @default(uuid())
  order  Int
  label  String
}
`;
    const objectsPredictions: string = JSON.stringify(objects);
    const textPredictions: string = JSON.stringify(texts);
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
                        `One key should be "order" and it should be the order of the component in the predictions based on coordinates and y axis first.`,
                        `One key should be "label" and it should be added only if there is a text prediction in the same line or inside the component..`,
                        `One key should be "coordinates" and it should be the coordinate of things you think is related to the form component.`,
                        `For drawing prediction class type "image" use "FormImage"`,
                        `For drawing prediction class type "input" use "FormTextField"`,
                        `For drawing prediction class type "checkbox" use "FormCheckbox"`,
                        `For drawing prediction class type "toggle" use "FormToggleSwitch"`,
                        `For drawing prediction class type "button" use "FormButton"`,
                        `And if there is a label in the same row as input then there is high chance that this is the input label.`,
                        `If there is a text with label of "V", there is a probability that it is a checked checkbox and text prediction just counted it as text "V"`,
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
        const parsedContent = safeParse(content);
        console.log(parsedContent);
        if (parsedContent === null) {
            console.log(`CHATGPT response is not parsable.`);
            return null;
        }
        const isArray = Array.isArray(parsedContent);
        if (isArray) {
            console.log(`CHATGPT returned array`);
            return parsedContent;
        }
        if (typeof parsedContent === 'object') {
            console.log(`CHATGPT returned object. returning value of first key.`);
            const entries = Object.values(parsedContent);
            return entries.length > 0 ? entries[0] : null;
        }

        console.log(`CHATGPT returned unknown format. ${typeof parsedContent}`);
        return parsedContent;
    } catch (e) {
        console.log(e);
        return null;
    }
}
