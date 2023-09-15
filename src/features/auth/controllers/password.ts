import { emailSchema, passwordSchema } from "@auth/schemes/password";
import { joiValidation } from "@global/decorators/joi-validations.decorator";
import { BadRequestError } from "@global/helpers/error.handler";
import { authService } from "@service/db/auth.service";
import { Request, Response } from "express";
import crypto from 'crypto';
import _ from 'lodash';
import { config } from "@root/config";
import forgotPasswordTemplate from "@service/emails/templates/forgot-password/forgot-password.template";
import emailQueue from "@service/queues/email.queue";
import HTTP_STATUS from 'http-status-codes';
import { IResetPasswordParams } from "@user/interfaces/user.interface";

import publicId from 'ip';
import moment from "moment";
import resetPasswordTemplate from "@service/emails/templates/reset-password/reset-password.template";

class PasswordController {
    @joiValidation(emailSchema)
    public async create(request: Request, response: Response): Promise<void> {
        const { email } = request.body;
        const user = await authService.getAuthByEmail(email);
        if (!user) throw new BadRequestError('Người dùng không hợp lệ.');

        const randomBytes = crypto.randomBytes(12);
        const randomCharacters = randomBytes.toString('hex');

        await authService.updatePasswordToken(_.toString(user._id), randomCharacters, Date.now() * 60 * 60 * 1000);

        const resetLink = config.CLIENT_URL + '/api/v1/auth/password/reset-password?token=' + randomCharacters;

        const template = forgotPasswordTemplate.passwordForgotTemplate(user.username, resetLink);

        emailQueue.addEmailJob('forgotPassword', {
            template,
            receiverEmail: email,
            subject: 'Đặt lại mật khẩu của bạn'
        });

        response.status(HTTP_STATUS.OK).send({ message: 'Mật khẩu đã gửi vào email của bạn.', link: resetLink })

    }
    @joiValidation(passwordSchema)
    public async update(request: Request, response: Response): Promise<void> {
        const { password, confirmPassword } = request.body;
        const { token } = request.params;

        if (password !== confirmPassword) throw new BadRequestError('Mật khẩu không hợp lệ.');

        const existUser = await authService.getAuthPasswordByToken(token);
        if (!existUser) throw new BadRequestError("Token đã hết hạn.");

        existUser.password = password;
        existUser.passwordResetExpires = undefined;
        existUser.passwordResetToken = undefined;

        existUser.save();

        const templateParams: IResetPasswordParams = {
            username: existUser.username,
            email: existUser.email,
            ipaddress: publicId.address(),
            date: moment().format('DD/MM/YYYY HH:mm')
        };
        const template = resetPasswordTemplate.passwordResetTemplate(templateParams);

        emailQueue.addEmailJob('forgotPassword', {
            template,
            receiverEmail: existUser.email,
            subject: 'Xác nhận đặt lại mật khẩu của bạn'
        });

        response.status(HTTP_STATUS.OK).send({ message: 'Mật khẩu đã gửi vào email của bạn.' })

    }
};

export default new PasswordController();