import {
    FormButton,
    FormCheckbox,
    FormImage,
    FormLabel,
    FormTextField,
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
            const parsedPayload: any[] = (secondParse ?? parsed ?? event.payload ?? []).filter((x: any) => x);
            switch (event.event) {
                case ImageEvents.TEXT_DETECTION_COMPLETED:
                    return {
                        ...event,
                        parsedPayload,
                    };
                case ImageEvents.OBJECT_DETECTION_COMPLETED:
                    return {
                        ...event,
                        parsedPayload,
                    };
                case ImageEvents.STRUCTURE_GENERATION_COMPLETED:
                    const safePayload = parsedPayload
                        .map((payload: any) => {
                            switch (payload.type) {
                                case 'FormLabel':
                                    return [
                                        'FormLabel',
                                        {
                                            id: '',
                                            formId: '',
                                            order: payload.order,
                                            label: payload.label ?? payload.label ?? 'Text',
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
                                            label: payload.label ?? 'Label',
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
                                            label: payload.label ?? 'Label',
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
                                            label: payload.label ?? 'Label',
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
                                        'FormTextField',
                                        {
                                            id: '',
                                            formId: '',
                                            order: payload.order,
                                            label: payload.label ?? 'Label',
                                        } satisfies FormTextField,
                                        payload,
                                    ];
                                case 'FormTextField':
                                    return [
                                        'FormTextField',
                                        {
                                            id: '',
                                            formId: '',
                                            order: payload.order ?? 'Label',
                                            label: payload.label,
                                        } satisfies FormTextField,
                                        payload,
                                    ];
                            }
                        })
                        .filter((x) => x);

                    return {
                        ...event,
                        parsedPayload: safePayload,
                    };
            }
            return {
                ...event,
                parsedPayload,
            };
        }) ?? [];
    uploadedFile.events = events;

    return uploadedFile;
};
