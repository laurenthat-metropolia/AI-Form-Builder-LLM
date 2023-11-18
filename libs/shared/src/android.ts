import { User } from '@prisma/client';

export interface AndroidLoginIntentBody {
    token: {
        accessToken: string;
        expiresAt: number;
    };
    user: User;
}
