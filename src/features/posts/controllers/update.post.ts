import { AuthorizedError, BadRequestError } from "@global/helpers/error.handler";
import { IPostDocument } from "@post/interfaces/post.interface";
import postQueue from "@service/queues/post.queue";
import PostCache from "@service/redis/post.cache";
import { socketIOPostObject } from "@socket/post.socket";
import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import _ from 'lodash';
const postCache = new PostCache();
class UpdatePostController {
    public async updatePost(request: Request, response: Response) {
        const { postId } = request.params;

        socketIOPostObject.emit('updatePost', request.params.postId);
        if (!postId) throw new BadRequestError("Input không hợp lệ.");
        if (!request.user) throw new AuthorizedError("Unauthorized");
        const updatedPost = _.omitBy(request.body, _.isNil) as IPostDocument;

        await postCache.updatePostInCache(postId, updatedPost);

        postQueue.addPostJob('updatePost', {
            key: postId,
            value: updatedPost
        });

        response.status(HTTP_STATUS.OK).send({
            message: 'Cập nhật bài đăng thành công.'
        })
    }

};

export default new UpdatePostController();