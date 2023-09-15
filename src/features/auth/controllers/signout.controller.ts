import { BadRequestError } from '@global/helpers/error.handler';
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes';

class SignoutController {
    public async update(request: Request, response: Response) {
        if (!request.session) throw new BadRequestError('Có lỗi xảy ra.')
        request.session = null;
        response.status(HTTP_STATUS.OK).send({
            message: 'Đăng xuất thành công.',
            user: {},
            status: 'success'
        })
    }
}