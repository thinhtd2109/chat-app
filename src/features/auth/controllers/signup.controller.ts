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
import { IUserDocument } from '@user/interfaces/user.interface';
import UserCache from '@service/redis/user.cache';
import JWT from 'jsonwebtoken';
import { authQueue } from '@service/queues/auth.queue';
import userQueue from '@service/queues/user.queue';

const userCache = new UserCache();

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
        if (!result?.public_id) throw new BadRequestError("File upload: Invalid credentials");

        const userData = SignUpController.prototype.userData(authObjectId, userObjectId);
        userData.profilePicture = `https://res.cloudinary.com/ducthinh2109/image/upload/v${result.version}/${_.toString(authObjectId)}.jpg`
        await userCache.saveUserToCache(_.toString(userObjectId), _.toString(uId), userData);

        authQueue.addAuthJob('addAuthUserToDB', { value: authData });
        userQueue.addUserJob('addUserToDB', { value: userData });
        const userJWT = Helpers.signupToken(authData, userObjectId);
        request.session = { jwt: userJWT };

        response.status(HTTP_STATUS.CREATED).send({
            statusCode: HTTP_STATUS.CREATED,
            status: 'success',
            data: { user: userData, token: userJWT },
            message: 'Đăng ký thành công.'
        })
        // return response.send(await AuthModel.create(request.body))
    }

    public userData(authId: ObjectId, userObjectId: ObjectId): IUserDocument {
        return {
            _id: userObjectId,
            authId: authId,
            profilePicture: '',
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            passwordResetToken: '',
            passwordResetExpires: 0,
            blocked: [],
            blockedBy: [],
            notifications: {
                messages: false,
                reactions: false,
                comments: false,
                follows: false
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            },
            work: '',
            school: '',
            location: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: ''
        } as unknown as IUserDocument;
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
    };


}

export default new SignUpController();