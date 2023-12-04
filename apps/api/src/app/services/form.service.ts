import { prisma } from '../databases/userDatabase';
import { Form } from '@prisma/client';
import { randomUUID } from 'crypto';
import { SupportedFormComponent } from '@draw2form/shared';

export const populateUserFormBasedOnChatGPTResponse = async (
    name: string,
    supportedComponents: SupportedFormComponent[],
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
    for (const component of supportedComponents) {
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
const countFormFields = async (formId: string): Promise<number> => {
    const checkboxes = await prisma.formCheckbox.count({
        where: {
            formId: formId,
        },
    });
    const textFields = await prisma.formTextField.count({
        where: {
            formId: formId,
        },
    });
    const toggleSwitches = await prisma.formToggleSwitch.count({
        where: {
            formId: formId,
        },
    });
    const buttons = await prisma.formButton.count({
        where: {
            formId: formId,
        },
    });
    const labels = await prisma.formLabel.count({
        where: {
            formId: formId,
        },
    });
    const images = await prisma.formImage.count({
        where: {
            formId: formId,
        },
    });

    return checkboxes + textFields + toggleSwitches + buttons + labels + images;
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
            formSubmissions: {
                include: {
                    checkboxResponses: true,
                    toggleSwitchResponses: true,
                    textFieldResponses: true,
                    owner: true,
                },
            },
        },
    });

    return item ?? null;
};

export const forms = {
    findPopulatedManyByOwnerId: findPopulatedManyByOwnerId,
    findOnePopulatedById: findOnePopulatedById,
    countFormFields: countFormFields,
};
