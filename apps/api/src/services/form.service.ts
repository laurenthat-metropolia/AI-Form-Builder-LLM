import { Form } from '@prisma/client';
import { convertChatGPTOutputToFormComponents } from '../configurations/configOpenAi';
import { prisma } from '../databases/userDatabase';
import { SupportedFormComponent } from '@draw2form/shared';
import { randomUUID } from 'crypto';

export const populateUserFormBasedOnChatGPTResponse = async (
    name: string,
    supportedComponents: ReturnType<typeof convertChatGPTOutputToFormComponents>,
    form: Form,
): Promise<void> => {
    await prisma.form.update({
        where: {
            id: form.id,
        },
        data: {
            name: name,
        },
    });
    for (let supportedComponentsRow of supportedComponents) {
        for (let component of supportedComponentsRow satisfies SupportedFormComponent[]) {
            if (component[0] === 'FormButton') {
                await prisma.formButton.create({
                    data: {
                        ...component[1],
                        formId: form.id,
                        id: randomUUID(),
                    },
                });
            }
            if (component[0] === 'FormCheckbox') {
                await prisma.formCheckbox.create({
                    data: {
                        ...component[1],
                        formId: form.id,
                        id: randomUUID(),
                    },
                });
            }
            if (component[0] === 'FormImage') {
                await prisma.formImage.create({
                    data: {
                        ...component[1],
                        formId: form.id,
                        id: randomUUID(),
                    },
                });
            }
            if (component[0] === 'FormLabel') {
                await prisma.formLabel.create({
                    data: {
                        ...component[1],
                        formId: form.id,
                        id: randomUUID(),
                    },
                });
            }
            if (component[0] === 'FormTextField') {
                await prisma.formTextField.create({
                    data: {
                        ...component[1],
                        formId: form.id,
                        id: randomUUID(),
                    },
                });
            }
            if (component[0] === 'FormToggleSwitch') {
                await prisma.formToggleSwitch.create({
                    data: {
                        ...component[1],
                        formId: form.id,
                        id: randomUUID(),
                    },
                });
            }
        }
    }
};
