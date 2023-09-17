import { AuthorizedError, BadRequestError } from "@global/helpers/error.handler";
import postQueue from "@service/queues/post.queue";
import PostCache from "@service/redis/post.cache";
import { socketIOPostObject } from "@socket/post.socket";
import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
const postCache = new PostCache();
class DeletePostController {
    public async deletePost(request: Request, response: Response) {
        const { postId } = request.params;
        socketIOPostObject.emit('deletePost', request.params.postId);
        if (!postId) throw new BadRequestError("Input không hợp lệ.");
        if (!request.user) throw new AuthorizedError("Unauthorized");
        const userId = request.user.userId;

        await postCache.deletePostFromCache(postId, userId);

        postQueue.addPostJob('deletePost', {
            keyOne: postId,
            keyTwo: userId
        });

        response.status(HTTP_STATUS.OK).send({
            message: 'Xóa bài đăng thành công.'
        })
    }

}

export default new DeletePostController();