import { prisma } from '../databases/userDatabase';
import { Form } from '@prisma/client';
import { SupportedFormComponent } from '@draw2form/shared';
import { randomUUID } from 'crypto';
import { convertChatGPTOutputToFormComponents } from '../configurations/configOpenAi';

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

const findPopulatedManyByOwnerId = async (ownerId: string) => {
    return prisma.form.findMany({
        where: {
            ownerId: ownerId,
        },
        include: {
            checkboxes: true,
            textFields: true,
            toggleSwitches: true,
            buttons: true,
            labels: true,
            images: true,
            upload: {
                include: {
                    events: true,
                },
            },
        },
    });
};

const findOnePopulatedById = async (id: string) => {
    const item = await prisma.form.findFirst({
        where: {
            id: id,
        },
        include: {
            checkboxes: true,
            textFields: true,
            toggleSwitches: true,
            buttons: true,
            labels: true,
            images: true,
            upload: {
                include: {
                    events: true,
                },
            },
        },
    });

    return item ?? null;
};

export const forms = {
    findPopulatedManyByOwnerId: findPopulatedManyByOwnerId,
    findOnePopulatedById: findOnePopulatedById,
};
