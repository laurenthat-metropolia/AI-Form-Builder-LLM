import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
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
        if (err) {
            throw err;
        }

        if (!userModel) {
            throw new UnauthorizedException();
        }

        return userModel;
    }
}
