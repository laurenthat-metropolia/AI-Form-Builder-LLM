import { ImageEvents } from '@draw2form/shared';
import { GoogleProfile } from '../interfaces/googleProfile';
import { ImageEvent, PrismaClient, User } from '@prisma/client';

export const prisma = new PrismaClient();

async function upsertImageEvent(
    fileId: string,
    event: keyof typeof ImageEvents,
    payload: Record<string, any> | null,
): Promise<ImageEvent> {
    const imageEvent = await prisma.imageEvent.findFirst({
        where: {
            fileId,
            event,
        },
    });
    if (!imageEvent) {
        return prisma.imageEvent.create({
            data: {
                fileId,
                event,
                payload,
            },
        });
    } else {
        return prisma.imageEvent.update({
            where: {
                id: imageEvent.id,
            },
            data: {
                event,
                payload,
            },
        });
    }
}
async function syncUserByGoogleProfile(googleProfile: GoogleProfile): Promise<User> {
    const user = await prisma.user.findFirst({
        where: {
            email: googleProfile.email,
        },
    });

    if (!user) {
        return prisma.user.create({
            data: {
                email: googleProfile.email,
                name: googleProfile.displayName,
                picture: googleProfile.picture,
            },
        });
    }
    const updatedUser = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            picture: user.picture ?? googleProfile.picture,
        },
    });

    return updatedUser;
}

export const fetchPopulatedUploadedFile = async (id: string) => {
    return prisma.uploadedFile.findFirst({
        where: {
            id: id,
        },
        include: {
            events: true,
        },
    });
};

export const UserDatabase = {
    syncUserByGoogleProfile: syncUserByGoogleProfile,
    upsertImageEvent: upsertImageEvent,
};
