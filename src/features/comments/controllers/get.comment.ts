import { ICommentDocument } from '@comment/interfaces/comment.interface';
import commentService from '@service/db/comment.service';
import CommentCache from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
const commentCache = new CommentCache();

class GetCommentController {
    public async comments(request: Request, response: Response) {
        const { postId } = request.params;
        const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId)
        const comments: ICommentDocument[] = cachedComments.length
            ? cachedComments : await commentService.getPostComments({
                postId
            }, {
                createdAt: -1
            });

        response.status(HTTP_STATUS.OK).send({
            message: 'GET COMMENTS',
            comments
        })
    };

    public async singleComment(request: Request, response: Response) {
        const { postId, commentId } = request.params;
        const cachedComments: ICommentDocument = await commentCache.getSingleCommentFromCache(postId, commentId)
        const comment: ICommentDocument = cachedComments
            ? cachedComments : await commentService.getPostComments({
                _id: commentId
            }, {
                createdAt: -1
            })[0];

        response.status(HTTP_STATUS.OK).send({
            message: 'GET SINGLE COMMENT',
            comment
        })
    };


}

export default new GetCommentController();