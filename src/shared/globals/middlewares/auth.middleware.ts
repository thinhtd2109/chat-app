import { Response, Request, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { AuthorizedError } from '@global/helpers/error.handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

class AuthMiddleware {
    public veriryUser(request: Request, response: Response, next: NextFunction) {
        if (!request.session?.jwt) throw new AuthorizedError("Token không hợp lệ.");

        try {
            const payload = JWT.verify(request.session.jwt, config.JWT_TOKEN) as AuthPayload
            request.user = payload;
            next();
        } catch (error) {
            throw new AuthorizedError('Token không hợp lệ.')
        }
    }
    public checkAuthentication(request: Request, response: Response, next: NextFunction) {
        if (!request.user) {
            throw new AuthorizedError("Token không hợp lệ.")
        };

        next();
    }

}

export default new AuthMiddleware();