import { prisma } from '../databases/userDatabase';
import { Form } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Resources, SupportedFormComponent, ValueOf } from '@draw2form/shared';

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

const updateResourceOrder = async (resource: ValueOf<typeof Resources>, id: string, order: number) => {
    const args = {
        where: {
            id: id,
        },
        data: {
            order,
        },
    };
    switch (resource) {
        case Resources.FormLabel:
            await prisma.formLabel.update(args);
            break;
        case Resources.FormImage:
            await prisma.formImage.update(args);
            break;
        case Resources.FormToggleSwitch:
            await prisma.formToggleSwitch.update(args);
            break;
        case Resources.FormButton:
            await prisma.formButton.update(args);
            break;
        case Resources.FormCheckbox:
            await prisma.formCheckbox.update(args);
            break;
        case Resources.FormTextField:
            await prisma.formTextField.update(args);
            break;
    }
};
const validateAndFixFormFieldOrders = async (formId: string) => {
    const formFields = await getFormFields(formId);

    const everythingGood = formFields.every((item, index) => item.order === index);
    if (everythingGood) {
        console.log(`[OrderValidation] Form ${formId} Healthy`);
        return true;
    } else {
        console.log(`[OrderValidation] Form ${formId} Order mismatch. fixing....`);
        for (const formField of formFields) {
            const index = formFields.indexOf(formField);
            await updateResourceOrder(formField.resource, formField.id, index);
        }
    }
};

const getFormFields = async (formId: string) => {
    const checkboxes = await prisma.formCheckbox.findMany({
        where: {
            formId: formId,
        },
    });
    const textFields = await prisma.formTextField.findMany({
        where: {
            formId: formId,
        },
    });
    const toggleSwitches = await prisma.formToggleSwitch.findMany({
        where: {
            formId: formId,
        },
    });
    const buttons = await prisma.formButton.findMany({
        where: {
            formId: formId,
        },
    });
    const labels = await prisma.formLabel.findMany({
        where: {
            formId: formId,
        },
    });
    const images = await prisma.formImage.findMany({
        where: {
            formId: formId,
        },
    });

    return [
        checkboxes.map((x) => ({ id: x.id, order: x.order, resource: Resources.FormCheckbox, item: x })),
        textFields.map((x) => ({ id: x.id, order: x.order, resource: Resources.FormTextField, item: x })),
        toggleSwitches.map((x) => ({ id: x.id, order: x.order, resource: Resources.FormToggleSwitch, item: x })),
        buttons.map((x) => ({ id: x.id, order: x.order, resource: Resources.FormButton, item: x })),
        labels.map((x) => ({ id: x.id, order: x.order, resource: Resources.FormLabel, item: x })),
        images.map((x) => ({ id: x.id, order: x.order, resource: Resources.FormImage, item: x })),
    ]
        .flat()
        .sort((a, b) => a.order - b.order);
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
    validateAndFixFormFieldOrders: validateAndFixFormFieldOrders,
    getFormFields: getFormFields,
    updateResourceOrder: updateResourceOrder,
};
