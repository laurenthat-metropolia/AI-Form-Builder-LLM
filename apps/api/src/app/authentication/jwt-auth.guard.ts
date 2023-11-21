import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { IAuthGuard } from '@nestjs/passport/dist/auth.guard';
import { IAuthModuleOptions } from '@nestjs/passport/dist/interfaces/auth-module.options';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
    logger = new Logger('JwtAuthGuard');
    canActivate(context: ExecutionContext) {
        this.logger.log('[canActivate]');
        // Add your custom authentication logic here
        // for example, call super.logIn(request) to establish a session.

        return super.canActivate(context);
    }

    /**
     * @link JwtStrategy Comes from JwtStrategy
     * Goes to the endpoint that had the Decorator @UseGuards(JwtAuthGuard)
     * @param err thrown errors in JwtStrategy
     * @param userModel if no error then userModel should be present
     * @param info Who knows what this is
     */
    handleRequest(err: any | null, userModel: any | undefined, info: Error | undefined): User | any {
        this.logger.log('[handleRequest]');
        if (err) {
            throw err;
        }

        if (!userModel) {
            throw new UnauthorizedException();
        }

        return userModel;
    }

    getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
        this.logger.log('[getAuthenticateOptions]');
        return super.getAuthenticateOptions(context);
    }
    logIn(request: any): Promise<void> {
        this.logger.log('[logIn]');
        return super.logIn(request);
    }

    getRequest(context: ExecutionContext) {
        this.logger.log('[getRequest]');
        return super.getRequest(context);
    }
}
