import { loginSchema } from '@auth/schemes/signin';
import { joiValidation } from '@global/decorators/joi-validations.decorator';
import { BadRequestError } from '@global/helpers/error.handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import mailTransport from '@service/emails/mail.transport';
import resetPasswordTemplate from '@service/emails/templates/reset-password/reset-password.template';
import emailQueue from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import publicId from 'ip';
import moment from 'moment';

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
        // const resetLink = `${config.CLIENT_URL}/reset-password?token=123456`;
        // const templateParams: IResetPasswordParams = {
        //     username: username,
        //     email: userExist.email,
        //     ipaddress: publicId.address(),
        //     date: moment().format('DD/MM/YYYY HH:mm')
        // }
        // const template = resetPasswordTemplate.passwordResetTemplate(templateParams, resetLink);
        // emailQueue.addEmailJob('forgotPassword', {
        //     subject: 'Đặt lại mật khẩu của bạn',
        //     template,
        //     receiverEmail: 'dina69@ethereal.email'
        // })
        response.status(HTTP_STATUS.OK).send({
            statusCode: HTTP_STATUS.OK,
            status: 'success',
            data: { user: userExist, token: jwt },
            message: 'Đăng nhập thành công.'
        })

    }
}

export default new SignInController();