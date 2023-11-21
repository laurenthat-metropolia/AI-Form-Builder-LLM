import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { environment } from '../configurations/environment';
import { prisma } from '../databases/userDatabase';
import { User } from '@prisma/client';
import jsonwebtoken from 'jsonwebtoken';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
    logger = new Logger('JwtAuthStrategy');
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: environment.APP_JWT_SECRET,
            issuer: environment.APP_JWT_ISSUER,
            audience: environment.APP_JWT_AUDIENCE,
            passReqToCallback: false,
        });
    }

    /**
     *
     * @param payload
     */
    async validate(payload: any): Promise<User | null> {
        this.logger.log(`[Validate] ${payload}`);
        const user = await prisma.user.findFirst({
            where: {
                id: payload.sub,
            },
        });

        if (user) {
            return user;
        } else {
            throw new UnauthorizedException();
        }
    }

    static generateAccessToken(user: User) {
        const payload = { sub: user.id, type: 'USER_LOGIN_TOKEN' };

        const accessToken = jsonwebtoken.sign(payload, environment.APP_JWT_SECRET, {
            expiresIn: '30d',
            audience: environment.APP_JWT_AUDIENCE,
            issuer: environment.APP_JWT_ISSUER,
        });

        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

        return {
            accessToken,
            expiresAt,
        };
    }
}
