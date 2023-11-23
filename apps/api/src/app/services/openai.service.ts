import { Injectable } from '@nestjs/common';
import OpenAI from 'openai/index';
import { environment } from '../configurations/environment';
import {
    ExpectedChatGPTOutputForFinalJSON,
    IdentifiableUnifiedObjectPrediction,
    IdentifiableUnifiedTextPrediction,
    safeParse,
    SupportedFormComponent,
    UiComponentPrediction,
    UnifiedPrediction,
} from '@draw2form/shared';
import { ChatCompletionContentPart } from 'openai/src/resources/chat/completions';
import { FormButton, FormCheckbox, FormImage, FormLabel, FormTextField, FormToggleSwitch } from '@prisma/client';

type ChatGPTApiInput = (
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
)[];

@Injectable()
export class OpenaiService {
    openAI = new OpenAI({
        organization: environment.APP_OPENAI_ORGANIZATION,
        apiKey: environment.APP_OPENAI_API_KEY,
    });

    generateChatGPTInputForLabelMapping(predictions: UnifiedPrediction[]): ChatGPTApiInput {
        const labels: [number, string, [number, number, number, number]][] = predictions
            .filter((x): x is IdentifiableUnifiedTextPrediction => x.type === 'TEXT_PREDICTION')
            .map((x) => [x.id, x.label, x.coordinates]);

        const objects: [number, string, [number, number, number, number]][] = predictions
            .filter((x): x is IdentifiableUnifiedObjectPrediction => x.type === 'OBJECT_PREDICTION')
            .map((x) => [x.id, x.kind, x.coordinates]);

        const labelsString: string = JSON.stringify(labels);
        const objectsString: string = JSON.stringify(objects);
        return [
            {
                role: 'system',
                content: [
                    `We have an array of texts in this format [Id, Text, Coordinate]`,
                    `We have an array of form components in this format [Id, Type, Coordinate]`,
                    `Coordinate data format is [topLeftX, topLeftY, bottomRightX, bottomRightY]`,
                    `We want to see if these texts are related to a form component or not and you are supposed to help us figure it out if text is a form component label or it is just an standalone sentence or word.`,
                    `You can use the coordinates to see if for example they in the same line or at least some how related in position level`,
                    `You can also use the context of the text to see if it is related to a component. Like if there was a text "I Agree" and there was a component type "checkbox" close by then they are related.`,
                    `Same goes with inputs you can see if text makes sense or not to be the input label.`,
                    `Same goes with buttons you can see if text makes sense or not to be the button label or if then text is inside button then certainly it is a button label.`,
                    `I want you to return an array of [id ,id]`,
                    `First id is the text id and second one is the component id that you think is related and can be used as label.`,
                    `If there was a text that didn't make sense to be any component's label then use null for component id`,
                    `If there is a text with value of "v" or "V" there is a high chance that it was mistaken with a form component of type "checkbox" and for this use "checkbox" for form component id`,
                    `So just to make sure, the output should be a JSON with a key "mappedIds" and the value of this key should be list of [id, id]`,
                ]
                    .map((x) => x.trim())
                    .map((x) => (x.endsWith('.') ? x : `${x}.`))
                    .join('\n'),
            },
            {
                role: 'user',
                content: [
                    `Here is the labels: "${labelsString}"`,
                    `Here is the form components: "${objectsString}"`,
                    `Create the JSON`,
                ]
                    .map((x) => x.trim())
                    .map((x) => (x.endsWith('.') ? x : `${x}.`))
                    .join(''),
            },
        ];
    }

    generateChatGPTInputForFinalJSON(predictions: UnifiedPrediction[]): ChatGPTApiInput {
        const labels = predictions
            .flat()
            .filter((x): x is IdentifiableUnifiedTextPrediction => x.type === 'TEXT_PREDICTION')
            .map((x) => x.label)
            .join(', ');
        const PredictionsString: string = JSON.stringify(predictions);

        const tables: string = `
model FormTextField {
  id        String
  label     String
  order     Int
}

model FormCheckbox {
  id        String
  label     String
  order     Int
}

model FormToggleSwitch {
  id        String
  label     String
  order     Int
}

model FormImage {
  id      String
  order   Int
  order   Int
}

model FormButton {
  id     String @id @default(uuid())
  label  String
  order  Int
}

model FormLabel {
  id     String @id @default(uuid())
  order  Int
  label  String
}
`;

        const messages: ChatGPTApiInput = [
            {
                role: 'system',
                content: [
                    `You are designed to accept "OBJECT_PREDICTION" which are drawing form components and "TEXT_PREDICTION" for written texts for input.`,
                    `"OBJECT_PREDICTION" with class of "label" is the same as "TEXT_PREDICTION".`,
                    `Each prediction has coordinates and the data format is [topLeftX, topLeftY, bottomRightX, bottomRightY].`,
                    `Here is my database tables in prisma format: \n${tables}\n`,
                    `You are supposed map each prediction to the relevant database model and output the JSON.`,
                    `Array represents the rows and objects inside represent the columns`,
                    `Each row supports only on column and each column is equivalent to one form component.`,
                    `Each object should have the following keys:`,
                    `One key should be "type" and value should be name of mapped database table.`,
                    `"type" key is really important and it should be one of the provided database table names.`,
                    `One key should be "class" and value should be the name of the mapped prediction class.`,
                    `One key should be "label" and value should be text inside predictions with type "TEXT_PREDICTION" in the same line or closest coordinate or overlapping.`,
                    `If you assigned a "TEXT_PREDICTION" prediction as a label then you should not output it anymore not even as a FormLabel.`,
                    `For "OBJECT_PREDICTION" prediction type "image" use "FormImage"`,
                    `For "OBJECT_PREDICTION" prediction type "input" use "FormTextField"`,
                    `For "OBJECT_PREDICTION" prediction type "checkbox" use "FormCheckbox"`,
                    `For "OBJECT_PREDICTION" prediction type "toggle" use "FormToggleSwitch"`,
                    `For "OBJECT_PREDICTION" prediction type "button" use "FormButton"`,
                    `For "OBJECT_PREDICTION" prediction type "label" use "FormLabel" but only for the labels that you did not assign to a Form component.`,
                    `And if there is a label in the same row as input then there is high chance that this is the input label.`,
                    `And if there is a label overlapping a button then there is high chance that this is the button label.`,
                    `And if there is a label overlapping a checkbox then there is high chance that this is the checkbox label.`,
                    `If there is a "TEXT_PREDICTION" with text of "V" or "v" then it's a FormCheckbox and for label use the TEXT_PREDICTION in the same line.`,
                    `Keep the order of components based on topLeftY`,
                ].join('\n'),
            },
            {
                role: 'user',
                content: [
                    `Here is a list of drawing predictions: \n${PredictionsString}\n`,
                    `Each prediction object has a key named "type" and it represents the type of the prediction.`,
                    `Each prediction object has a key named "coordinates" and it represents the coordinate of the prediction.`,
                    `Each prediction object has a key named "data" and it represents the information of the prediction.`,
                    `Create the JSON with following keys:`,
                    `one key is "name" and value should be a short descriptive form name based on following words: (${labels}) and do not the words and in no way just print the words to the value.`,
                    `one key is "components" and value is a an array of mapped predictions to database models.`,
                ].join('\n'),
            },
        ];

        return messages;
    }

    processChatGPTOutputForFinalJSON(
        parsedContent: Awaited<ReturnType<typeof this.sendCommandsToChatGPTApi>>,
    ): ExpectedChatGPTOutputForFinalJSON | null {
        const topLevelObject: ExpectedChatGPTOutputForFinalJSON | null = (() => {
            if (parsedContent === null) {
                console.log(`CHATGPT response is not parsable.`);
                return null;
            }
            const isArray = Array.isArray(parsedContent);
            if (isArray) {
                console.log(`CHATGPT returned array. Panicking don't know what to doooo!!!`);
                return null;
            }
            if (typeof parsedContent === 'object') {
                console.log(`CHATGPT returned object.`);
                const name = (parsedContent as Record<string, any>)['name'];
                const components = (parsedContent as Record<string, any>)['components'];
                return {
                    name: typeof name === 'string' ? name : 'Generated Form',
                    components: Array.isArray(components) ? components : [],
                };
            } else {
                console.log(`CHATGPT returned unknown format. ${typeof parsedContent}`);
                return null;
            }
        })();

        if (topLevelObject === null) {
            return null;
        }

        const validatedComponents: ExpectedChatGPTOutputForFinalJSON['components'] = (() => {
            return topLevelObject.components
                .map((items) => {
                    if (Array.isArray(items)) {
                        return items;
                    }
                    if (typeof items === 'object') {
                        return [items];
                    }
                    return [];
                })
                .flat();
        })();

        topLevelObject.components = validatedComponents;

        return topLevelObject;
    }

    convertChatGPTOutputToFormComponents = (components: UiComponentPrediction[]): SupportedFormComponent[] => {
        return components
            .map((columnItem, index): SupportedFormComponent => {
                switch (columnItem.kind) {
                    case 'label':
                        return [
                            'FormLabel',
                            {
                                id: '',
                                formId: '',
                                order: index,
                                label: columnItem.label ?? '',
                            } satisfies FormLabel,
                        ];
                    case 'button':
                        return [
                            'FormButton',
                            {
                                id: '',
                                formId: '',
                                type: 'submit',
                                order: index,
                                label: columnItem.label ?? '',
                            } satisfies FormButton,
                        ];
                    case 'checkbox':
                        return [
                            'FormCheckbox',
                            {
                                id: '',
                                formId: '',
                                order: index,
                                label: columnItem.label ?? '',
                            } satisfies FormCheckbox,
                        ];
                    case 'toggle':
                        return [
                            'FormToggleSwitch',
                            {
                                id: '',
                                formId: '',
                                order: index,
                                label: columnItem.label ?? '',
                            } satisfies FormToggleSwitch,
                        ];
                    case 'image':
                        return [
                            'FormImage',
                            {
                                id: '',
                                formId: '',
                                order: index,
                                imageId: '',
                            } satisfies FormImage,
                        ];
                    case 'input':
                        return [
                            'FormTextField',
                            {
                                id: '',
                                formId: '',
                                order: index,
                                label: columnItem.label,
                            } satisfies FormTextField,
                        ];
                    case 'FormTextField':
                        return [
                            'FormTextField',
                            {
                                id: '',
                                formId: '',
                                order: index,
                                label: columnItem.label ?? '',
                            } satisfies FormTextField,
                        ];
                    default:
                        return null;
                }
            })
            .filter((item): item is SupportedFormComponent => item !== null);
    };

    async sendCommandsToChatGPTApi<T = any>(input: ChatGPTApiInput): Promise<T | null> {
        try {
            const body: OpenAI.ChatCompletionCreateParams = {
                messages: input,
                response_format: { type: 'json_object' },
                model: 'gpt-3.5-turbo-1106',
            };
            const chatCompletion = await this.openAI.chat.completions.create(body);
            const content = chatCompletion.choices[0]?.message?.content;
            const parsedContent = safeParse(content);
            return parsedContent ?? [];
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}
