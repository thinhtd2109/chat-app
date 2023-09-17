import UserCache from '@service/redis/user.cache';
import { Request, Response } from 'express';
import userService from '@service/db/user.service';
import { BadRequestError } from '@global/helpers/error.handler';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

class CurrentUserController {
    public async read(request: Request, response: Response) {
        const cached = await userCache.getUserFromCache(request.user!.userId);
        const user = cached ? cached : await userService.getUserById(request.user!.userId);
        if (!user) throw new BadRequestError('Có lỗi xảy ra.');
        response.status(HTTP_STATUS.OK).send({
            token: request.session?.jwt,
            user,
            isUser: true
        })
    }
}

export default new CurrentUserController();