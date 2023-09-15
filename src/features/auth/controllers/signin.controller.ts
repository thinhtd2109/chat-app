import { loginSchema } from '@auth/schemes/signin';
import { joiValidation } from '@global/decorators/joi-validations.decorator';
import { BadRequestError } from '@global/helpers/error.handler';
import { Helpers } from '@global/helpers/helpers';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

class SignInController {
    @joiValidation(loginSchema)
    public async signIn(request: Request, response: Response): Promise<void> {
        const { username, password } = request.body;

        const userExist = await authService.getAuthByUsername(username);
        if (!userExist) throw new BadRequestError('Sai thông tin đăng nhập.');

        const passwordMatch = await userExist.comparePassword(password);
        if (!passwordMatch) throw new BadRequestError('Sai thông tin đăng nhập.');

        const jwt = Helpers.signupToken(userExist, userExist._id);

        request.session = { jwt };

        response.status(HTTP_STATUS.OK).send({
            statusCode: HTTP_STATUS.OK,
            status: 'success',
            data: { user: userExist, token: jwt },
            message: 'Đăng ký thành công.'
        })

    }
}

export default new SignInController();