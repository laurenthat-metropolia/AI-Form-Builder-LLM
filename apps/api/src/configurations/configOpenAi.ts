import OpenAI from 'openai';
import { environment } from './environment';
import { FormButton, FormCheckbox, FormImage, FormLabel, FormTextField, FormToggleSwitch } from '@prisma/client';
import { ExpectedChatGPTOutput, safeParse, SupportedFormComponent, UnifiedPrediction } from '@draw2form/shared';
import { ChatCompletionContentPart } from 'openai/src/resources/chat/completions';

export const openAI = new OpenAI({
    organization: environment.APP_OPENAI_ORGANIZATION,
    apiKey: environment.APP_OPENAI_API_KEY,
});

export function generateChatGPTInput(predictions: UnifiedPrediction[][]) {
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
    const PredictionsString: string = JSON.stringify(predictions);
    const messages:
        | (
              | {
                    /**
                     * The contents of the user message.
                     */
                    content: string | Array<ChatCompletionContentPart> | null;

                    /**
                     * The role of the messages author, in this case `user`.
                     */
                    role: 'user';
                }
              | {
                    /**
                     * The contents of the system message.
                     */
                    content: string | null;

                    /**
                     * The role of the messages author, in this case `system`.
                     */
                    role: 'system';
                }
          )[] = [
        {
            role: 'system',
            content: [
                `You are designed to accept drawing predictions of form components and written text predictions as input.`,
                `Your input is an array which represents the Rows and nested array represents the column`,
                `Coordinates format is [topLeftX, topLeftY, bottomRightX, bottomRightY]`,
                `Here is my database tables in prisma format: \n${tables}\n`,
                `You are supposed map each prediction to the relevant database model and output it all as an array of array of objects where the nested array represents the columns and top level array represents the rows.`,
                `Each object should have the following keys:`,
                `One key should be "type" and it is the name of database table. "type" key is really important and it should be database table name.`,
                `One key should be "class" and it is the name of the mapped prediction class.`,
                `One key should be "orderX" and it should be the order of the component in the x axis.`,
                `One key should be "orderY" and it should be the order of the component in the y axis.`,
                `One key should be "label" and it should be added only if there is a text prediction in the same line or overlapping.`,
                // `One key should be "coordinates" and it should be the coordinate of things you think is related to the form component.`,
                `For drawing prediction class type "image" use "FormImage"`,
                `For drawing prediction class type "input" use "FormTextField"`,
                `For drawing prediction class type "checkbox" use "FormCheckbox"`,
                `For drawing prediction class type "toggle" use "FormToggleSwitch"`,
                `For drawing prediction class type "button" use "FormButton"`,
                `For drawing prediction class type "label" use "FormLabel"`,
                `And if there is a label in the same row as input then there is high chance that this is the input label.`,
                `And if there is a label overlapping a button then there is high chance that this is the button label.`,
                `If there is a text with label of "V" or "v", there is a probability that it is a checked checkbox so you can count it as a "FormCheckbox"`,
                `Keep the components in the nested array in order based on x axis which is the first number in the coordinates array.`,
            ].join('\n'),
        },
        {
            role: 'user',
            content: [
                `Here is a list of drawing predictions: \n${PredictionsString}\n`,
                `Each object has a key named "type" and it represents the type of the prediction.`,
                `Each object has a key named "coordinates" and it represents the coordinate of the prediction.`,
                `Each object has a key named "data" and it represents the information of the prediction.`,
                `Create the JSON with array of mapped predictions to database models.`,
            ].join('\n'),
        },
    ];

    return {
        messages,
    };
}

export function processChatGPTOutput(
    parsedContent: ReturnType<typeof sendCommandsToChatGPTApi>,
): ExpectedChatGPTOutput {
    const topLevelArray: any[] | null = (() => {
        if (parsedContent === null) {
            console.log(`CHATGPT response is not parsable.`);
            return null;
        }
        const isArray = Array.isArray(parsedContent);
        if (isArray) {
            console.log(`CHATGPT returned array`);
            return parsedContent as any;
        }
        if (typeof parsedContent === 'object') {
            console.log(`CHATGPT returned object. returning the values.`);
            return (Object.values(parsedContent) ?? []).flat() as any;
        } else {
            console.log(`CHATGPT returned unknown format. ${typeof parsedContent}`);
            return parsedContent;
        }
    })();

    if (topLevelArray === null) {
        return null;
    }

    const validatedNestedArray: any[][] | null = (() => {
        return topLevelArray.map((items) => {
            const isArray = Array.isArray(items);
            if (isArray) {
                console.log(`CHATGPT returned array`);
                return items;
            }
            if (typeof items === 'object') {
                console.log(`CHATGPT returned object. returning the values.`);
                return [items];
            }
        });
    })();

    return validatedNestedArray;
}

export async function sendCommandsToChatGPTApi<T = any>(
    input: ReturnType<typeof generateChatGPTInput>,
): Promise<T | null> {
    try {
        const body: OpenAI.ChatCompletionCreateParams = {
            messages: input.messages,
            response_format: { type: 'json_object' },
            model: 'gpt-3.5-turbo-1106',
        };
        const chatCompletion = await openAI.chat.completions.create(body);
        const content = chatCompletion.choices[0]?.message?.content;
        const parsedContent = safeParse(content);
        return parsedContent ?? [];
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const convertChatGPTOutputToFormComponents = (rows: ExpectedChatGPTOutput): SupportedFormComponent[][] => {
    return rows.map((rowItems): SupportedFormComponent[] => {
        const items: (SupportedFormComponent | null)[] = rowItems.map((columnItem): SupportedFormComponent | null => {
            switch (columnItem.type) {
                case 'FormLabel':
                    return [
                        'FormLabel',
                        {
                            id: '',
                            formId: '',
                            order: columnItem.orderX,
                            label: columnItem.label ?? '',
                        } satisfies FormLabel,
                    ];
                case 'FormButton':
                    return [
                        'FormButton',
                        {
                            id: '',
                            formId: '',
                            type: 'submit',
                            order: columnItem.orderX,
                            label: columnItem.label ?? '',
                        } satisfies FormButton,
                    ];
                case 'FormCheckbox':
                    return [
                        'FormCheckbox',
                        {
                            id: '',
                            formId: '',
                            order: columnItem.orderX,
                            label: columnItem.label ?? '',
                        } satisfies FormCheckbox,
                    ];
                case 'FormToggleSwitch':
                    return [
                        'FormToggleSwitch',
                        {
                            id: '',
                            formId: '',
                            order: columnItem.orderX,
                            label: columnItem.label ?? '',
                        } satisfies FormToggleSwitch,
                    ];
                case 'FormImage':
                    return [
                        'FormImage',
                        {
                            id: '',
                            formId: '',
                            order: columnItem.orderX,
                            imageId: '',
                        } satisfies FormImage,
                    ];
                case 'FormInput': // TODO: Configure chatgpt to not generate this.
                    return [
                        'FormTextField',
                        {
                            id: '',
                            formId: '',
                            order: columnItem.orderX,
                            label: columnItem.label ?? 'Label',
                        } satisfies FormTextField,
                    ];
                case 'FormTextField':
                    return [
                        'FormTextField',
                        {
                            id: '',
                            formId: '',
                            order: columnItem.orderX,
                            label: columnItem.label ?? 'Label',
                        } satisfies FormTextField,
                    ];
                default:
                    return null;
            }
        });
        return items.filter((item): item is SupportedFormComponent => item !== null);
    });
};
