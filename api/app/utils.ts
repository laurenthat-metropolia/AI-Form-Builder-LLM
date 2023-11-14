import {
    FormButton,
    FormCheckbox,
    FormImage,
    FormLabel,
    FormTextfield,
    FormToggleSwitch,
    UploadedFile,
} from '@prisma/client';
import { fetchPopulatedUploadedFile } from './databases/userDatabase.js';
import { ImageEvents } from './enums.js';

export const safeParse = (input: any): any => {
    try {
        return JSON.parse(input);
    } catch (e) {
        return null;
    }
};

export const parseUploadedFile = (uploadedFile: Awaited<ReturnType<typeof fetchPopulatedUploadedFile>>) => {
    if (!uploadedFile) {
        return null;
    }
    const events =
        uploadedFile.events?.map((event) => {
            const parsed = safeParse(event.payload);
            const secondParse = typeof parsed === 'string' ? safeParse(parsed) : parsed;
            const parsedPayload: any[] = secondParse ?? parsed ?? event.payload;
            switch (event.event) {
                case ImageEvents.TEXT_DETECTION_COMPLETED:
                    return {
                        ...event,
                        parsedPayload: secondParse ?? parsed ?? event.payload,
                    };
                case ImageEvents.OBJECT_DETECTION_COMPLETED:
                    return {
                        ...event,
                        parsedPayload: secondParse ?? parsed ?? event.payload,
                    };
                case ImageEvents.STRUCTURE_GENERATION_COMPLETED:
                    const safePayload = parsedPayload.map((payload: any) => {
                        switch (payload.type) {
                            case 'FormLabel':
                                return [
                                    'FormLabel',
                                    {
                                        id: '',
                                        formId: '',
                                        order: payload.order,
                                        value: payload.value ?? payload.label ?? 'Text',
                                    } satisfies FormLabel,
                                    payload,
                                ];
                            case 'FormButton':
                                return [
                                    'FormButton',
                                    {
                                        id: '',
                                        formId: '',
                                        type: 'submit',
                                        order: payload.order,
                                        label: payload.label,
                                    } satisfies FormButton,
                                    payload,
                                ];

                            case 'FormCheckbox':
                                return [
                                    'FormCheckbox',
                                    {
                                        id: '',
                                        formId: '',
                                        order: payload.order,
                                        label: payload.label,
                                    } satisfies FormCheckbox,
                                    payload,
                                ];
                            case 'FormToggleSwitch':
                                return [
                                    'FormToggleSwitch',
                                    {
                                        id: '',
                                        formId: '',
                                        order: payload.order,
                                        label: payload.label,
                                    } satisfies FormToggleSwitch,
                                    payload,
                                ];
                            case 'FormImage':
                                return [
                                    'FormImage',
                                    {
                                        id: '',
                                        formId: '',
                                        order: payload.order,
                                        imageId: '',
                                    } satisfies FormImage,
                                    payload,
                                ];
                            case 'FormInput': // TODO: Configure chatgpt to not generate this.
                                return [
                                    'FormTextfield',
                                    {
                                        id: '',
                                        formId: '',
                                        order: payload.order,
                                        label: payload.label,
                                    } satisfies FormTextfield,
                                    payload,
                                ];
                            case 'FormTextfield':
                                return [
                                    'FormTextfield',
                                    {
                                        id: '',
                                        formId: '',
                                        order: payload.order,
                                        label: payload.label,
                                    } satisfies FormTextfield,
                                    payload,
                                ];
                        }
                    });

                    return {
                        ...event,
                        parsedPayload: safePayload,
                    };
            }
            return {
                ...event,
                parsedPayload: secondParse ?? parsed ?? event.payload,
            };
        }) ?? [];
    uploadedFile.events = events;

    return uploadedFile;
};
