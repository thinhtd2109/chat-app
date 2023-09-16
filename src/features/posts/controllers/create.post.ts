import { joiValidation } from '@global/decorators/joi-validations.decorator';
import { AuthorizedError, BadRequestError } from '@global/helpers/error.handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemes/post.schemes';
import { Express, Response, Request } from 'express';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import HTTP_STATUS from 'http-status-codes'

export class Create {
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, feelings, gifUrl, privacy, profilePicture } = req.body;
        const postObjectId = new ObjectId;

        if (!req.user) throw new AuthorizedError('Internal Server Error.');
        const userAuthen = req.user;

        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: userAuthen.userId!,
            username: userAuthen.username!,
            email: userAuthen.email!,
            avatarColor: userAuthen.avatarColor!,
            profilePicture,
            bgColor,
            post,
            gifUrl,
            feelings,
            privacy,
            commentsCount: 0,
            imgId: "",
            createdAt: moment(),
            reactions: {
                like: 0,
                love: 0,
                haha: 0,
                wow: 0,
                sad: 0,
                angry: 0,
                happy: 0,
                sum: 0,
            }
        } as IPostDocument;

        res.status(HTTP_STATUS.CREATED).send({
            message: 'Bài đăng tạo thành cộng.'
        })
    }
}