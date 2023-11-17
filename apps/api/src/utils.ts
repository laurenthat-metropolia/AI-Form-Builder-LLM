import {
  FormButton,
  FormCheckbox,
  FormImage,
  FormLabel,
  FormTextField,
  FormToggleSwitch,
} from '@prisma/client';
import { fetchPopulatedUploadedFile } from './databases/userDatabase';
import { ImageEvents } from './enums';

export const safeParse = (input: any): any => {
  try {
    return JSON.parse(input);
  } catch (e) {
    return null;
  }
};

export const parseUploadedFile = (
  uploadedFile: Awaited<ReturnType<typeof fetchPopulatedUploadedFile>>
) => {
  if (!uploadedFile) {
    return null;
  }

  console.log(uploadedFile);
  const events = (uploadedFile.events ?? []).map((event) => {
    const name = event.event;
    const payload = event.payload;
    console.log({ name, payload });

    const parsed = safeParse(payload);
    const secondParse = typeof parsed === 'string' ? safeParse(parsed) : parsed;

    const parsedPayload: any[] = secondParse ?? parsed ?? event.payload ?? [];

    const safeParsedPayload: any[][] = Array.isArray(parsedPayload)
      ? parsedPayload.filter((x: any) => x)
      : parsedPayload;

    switch (name) {
      case ImageEvents.TEXT_DETECTION_COMPLETED:
        return {
          ...event,
          parsedPayload: safeParsedPayload,
        };
      case ImageEvents.OBJECT_DETECTION_COMPLETED:
        return {
          ...event,
          parsedPayload: safeParsedPayload,
        };
      case ImageEvents.OBJECT_DETECTION_COMPLETED:
        return {
          ...event,
          parsedPayload: safeParsedPayload,
        };
      case ImageEvents.STRUCTURE_GENERATION_COMPLETED:
        const safePayload = (
          JSON.parse(JSON.parse(payload as any)) as any[][]
        ).map((row) => {
          console.log({ row });

          const parsedRow = row.map((rowItem) => {
            console.log({ rowItem });
            switch (rowItem.type) {
              case 'FormLabel':
                return [
                  'FormLabel',
                  {
                    id: '',
                    formId: '',
                    order: rowItem.order,
                    label: rowItem.label ?? '',
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
                    order: rowItem.order,
                    label: rowItem.label ?? '',
                  } satisfies FormButton,
                  payload,
                ];
              case 'FormCheckbox':
                return [
                  'FormCheckbox',
                  {
                    id: '',
                    formId: '',
                    order: rowItem.order,
                    label: rowItem.label ?? '',
                  } satisfies FormCheckbox,
                  payload,
                ];
              case 'FormToggleSwitch':
                return [
                  'FormToggleSwitch',
                  {
                    id: '',
                    formId: '',
                    order: rowItem.order,
                    label: rowItem.label ?? '',
                  } satisfies FormToggleSwitch,
                  payload,
                ];
              case 'FormImage':
                return [
                  'FormImage',
                  {
                    id: '',
                    formId: '',
                    order: rowItem.order,
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
                    order: rowItem.order,
                    label: rowItem.label ?? 'Label',
                  } satisfies FormTextField,
                  payload,
                ];
              case 'FormTextField':
                return [
                  'FormTextField',
                  {
                    id: '',
                    formId: '',
                    order: rowItem.order,
                    label: rowItem.label ?? 'Label',
                  } satisfies FormTextField,
                  payload,
                ];
            }
          });
          console.log({ parsedRow });
          return parsedRow;
        });
        console.log({ safePayload });
        return {
          ...event,
          parsedPayload: safePayload,
        };
    }
    return {
      ...event,
      parsedPayload: safeParsedPayload,
    };
  });
  uploadedFile.events = events;

  return uploadedFile;
};
