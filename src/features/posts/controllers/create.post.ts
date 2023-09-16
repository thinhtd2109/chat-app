import { joiValidation } from '@global/decorators/joi-validations.decorator';
import { AuthorizedError, BadRequestError } from '@global/helpers/error.handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { Response, Request } from 'express';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import HTTP_STATUS from 'http-status-codes'
import postCache from '@service/redis/post.cache';
import _ from 'lodash';
import { socketIOPostObject } from '@socket/post.socket';
import postQueue from '@service/queues/post.queue';
import { uploads } from '@global/helpers/cloudinary.upload';

export class CreatePostController {
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

        socketIOPostObject.emit('addPost', createdPost);

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: _.toString(userAuthen.userId),
            uId: _.toString(userAuthen.uId),
            createdPost
        });

        postQueue.addPostJob('addPostToDB', {
            value: createdPost,
            key: userAuthen.userId
        })


        res.status(HTTP_STATUS.CREATED).send({
            message: 'Bài đăng tạo thành cộng.'
        })
    }

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const {
            image,
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
        } = req.body;
        const result = await uploads(image);
        if (!result?.public_id) throw new BadRequestError("File upload: Invalid credentials");
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
            imgVersion: _.toString(result.version),
            imgId: result.public_id,
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

        socketIOPostObject.emit('addPost', createdPost);

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: _.toString(userAuthen.userId),
            uId: _.toString(userAuthen.uId),
            createdPost
        });

        postQueue.addPostJob('addPostToDB', {
            value: createdPost,
            key: userAuthen.userId
        })


        res.status(HTTP_STATUS.CREATED).send({
            message: 'Bài đăng tạo thành cộng.'
        })
    }
}