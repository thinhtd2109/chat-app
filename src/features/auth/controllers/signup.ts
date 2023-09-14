import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validations.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error.handler';
import { Helpers } from '@global/helpers/helpers';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { uploads } from '@global/helpers/cloudinary.upload';
import _ from 'lodash';
import HTTP_STATUS from 'http-status-codes';


class SignUpController {
    @joiValidation(signupSchema)
    public async create(request: Request, response: Response): Promise<any> {
        const { username, email, password, avatarColor, avatarImage } = request.body;
        const authExist = await authService.getUserByUsernameOrEmail(username, email);
        if (authExist) throw new BadRequestError(`Thông tin người dùng không hợp lệ.`);

        const authObjectId = new ObjectId();
        const userObjectId = new ObjectId();
        const uId = Helpers.generateRandomInteger().toString();

        const authData: IAuthDocument = SignUpController.prototype.signUpData({
            _id: authObjectId,
            uId,
            username,
            email,
            password,
            avatarColor
        });

        const result = await uploads(avatarImage, _.toString(authObjectId), true, true);
        if (!result?.public_id) throw new BadRequestError("File upload: Invalid credentials")

        // https://res.cloudinary.com/ducthinh2109/image/upload/v1694671882/${_.toString(authObjectId)}.jpg
        response.status(HTTP_STATUS.CREATED).send({
            statusCode: HTTP_STATUS.CREATED,
            status: 'success',
            message: 'Đăng ký thành công.'
        })
        // return response.send(await AuthModel.create(request.body))
    }

    public signUpData(data: ISignUpData): IAuthDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id,
            username,
            email: Helpers.toLowerCase(email),
            uId,
            password,
            avatarColor,
            createdAt: new Date()
        } as IAuthDocument
    }
}

export default new SignUpController();