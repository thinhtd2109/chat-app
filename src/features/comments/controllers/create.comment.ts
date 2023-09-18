import { joiValidation } from '@global/decorators/joi-validations.decorator';
import { Response, Request } from 'express';
import { ObjectId } from 'mongodb';
import _ from 'lodash';
import { addCommentSchema } from '@comment/schemes/comment';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import moment from 'moment';
import CommentCache from '@service/redis/comment.cache';
import commentQueue from '@service/queues/comment.queue';
import HTTP_STATUS from 'http-status-codes';

const commentCache = new CommentCache();

class CreateCommentController {
    @joiValidation(addCommentSchema)
    public async comment(request: Request, response: Response) {
        const { userTo, postId, profilePicture, comment } = request.body;

        const commentObjectId = new ObjectId();

        const commentData: ICommentDocument = {
            _id: commentObjectId,
            postId,
            userTo,
            profilePicture,
            comment,
            username: request.user!.username,
            avatarColor: request.user!.avatarColor,
            createdAt: moment()
        } as ICommentDocument;

        await commentCache.savePostCommentToCache(postId, commentData);

        const commentDataDB: ICommentJob = {
            postId,
            userTo,
            userFrom: request.user!.userId,
            username: request.user!.username,
            comment: commentData
        };

        commentQueue.addCommentQueue('addCommentDB', commentDataDB);

        response.status(HTTP_STATUS.OK).send({
            message: 'Bình luận thành công'
        })
    }

};
export default new CreateCommentController()