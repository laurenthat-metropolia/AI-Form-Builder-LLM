import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class JwtAndAnonymousAuthGuard extends AuthGuard(['jwt', 'anonymous']) {
    canActivate(context: ExecutionContext) {
        // Add your custom authentication logic here
        // for example, call super.logIn(request) to establish a session.

        return super.canActivate(context);
    }
    handleRequest(err: any | null, userModel: any | undefined, info: Error | undefined): User | any {
        if (err) {
            throw err;
        }

        if (!userModel) {
            throw new UnauthorizedException();
        }

        return userModel;
    }
}
