import { Injectable } from '@nestjs/common';
import OpenAI from 'openai/index';
import { environment } from '../configurations/environment';
import {
    ExpectedChatGPTOutputForFinalJSON,
    safeParse,
    SupportedFormComponent,
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

    generateChatGPTInputForFinalJSON(predictions: UnifiedPrediction[], description: string): ChatGPTApiInput {
        const PredictionsString: string = JSON.stringify(predictions);

        const tables: string = `
model FormTextField {
  label     String
  order     Int
}

model FormCheckbox {
  label     String
  order     Int
}

model FormToggleSwitch {
  label     String
  order     Int
}

model FormImage {
  order   Int
  order   Int
}

model FormButton {
  label  String
  order  Int
}

model FormLabel {
  order  Int
  label  String
}
`;

        const messages: ChatGPTApiInput = [
            {
                role: 'system',
                content: [
                    `Here is a description of the information of the image that will be provided: "${description}"`,
                    `Each prediction has coordinates and the data format is [topLeftX, topLeftY, bottomRightX, bottomRightY].`,
                    `Here is my database tables in prisma format: \n${tables}\n`,
                    `You are supposed map each prediction to the relevant database model and output the JSON.`,
                    `Each object should have the following keys:`,
                    `One key should be "type" and value should be name of mapped database table.`,
                    `"type" key is really important and it should be one of the provided database table names.`,
                    `One key should be "kind" and value should be the name of the mapped prediction class.`,
                    `One key should be "label" and value should be text inside predictions with type "TEXT_PREDICTION" in the same line or closest coordinate or overlapping.`,
                    `For kind "image" use "FormImage"`,
                    `For kind "input" use "FormTextField"`,
                    `For kind "checkbox" use "FormCheckbox"`,
                    `For kind "toggle" use "FormToggleSwitch"`,
                    `For kind "button" use "FormButton"`,
                    `For kind "label" use "FormLabel"`,
                    `If there is a "TEXT_PREDICTION" with text of "V" or "v" then it's a FormCheckbox and for label use the TEXT_PREDICTION in the same line.`,
                    `Please note that images cannot have label so  you can use separate FormLabel for that.`,
                    `If there is a text with value of "v" or "V" then it is not a label and it is just a checkbox mistaken with character v.`,
                    `When you used a label as a component label you cannot create FormLabel with it so just skip it.`,
                ].join('\n'),
            },
            {
                role: 'user',
                content: [
                    `Here is a list of drawing prediction information: \n${PredictionsString}\n`,
                    `Create the JSON with following keys:`,
                    `one key is "name" and value should be a short descriptive form name based on the context of this form.`,
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

    convertChatGPTOutputToFormComponents = (
        components: ExpectedChatGPTOutputForFinalJSON['components'],
    ): SupportedFormComponent[] => {
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

    async sendCommandsToChatGPTV4Api(messages: OpenAI.ChatCompletionCreateParams['messages']): Promise<string | null> {
        try {
            const body: OpenAI.ChatCompletionCreateParams = {
                messages: messages,
                max_tokens: 300,
                model: 'gpt-4-vision-preview',
            };
            const chatCompletion = await this.openAI.chat.completions.create(body);
            const content = chatCompletion.choices[0];
            return content.message.content;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    async describeImageForFormComponentMapping(imageUrl: string): Promise<any> {
        const messages: OpenAI.ChatCompletionCreateParams['messages'] = [
            {
                role: 'system',
                content: [
                    `You are supposed to receive an image of a hand drawn form and try to map it to our form components.`,
                    `Form components that we support at this moment are: "label, button, checkbox, toggle, image, input"`,
                    `You can use "label" for Header texts`,
                    `Please try to map each form component in the picture to one of ours.`,
                    `Note that form component labels has higher priority so if a text looks to be an input's label, button's label, checkboxes' label or any other component's label then choose them as that component's label and not a standalone label.`,
                    `For numeric inputs and date inputs and dropdown inputs just use "input"`,
                ].join('.\n'),
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Please map the form components.`,
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl,
                        },
                    },
                ],
            },
        ];
        return this.sendCommandsToChatGPTV4Api(messages);
    }
}
