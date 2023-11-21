import { User } from '@prisma/client';

export interface LoginInformation {
    token: {
        accessToken: string;
        expiresAt: number;
    };
    user: User;
}
