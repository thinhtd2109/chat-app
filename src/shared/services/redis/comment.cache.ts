
import { BaseCache } from "./base.cache";
import Logger from "bunyan";
import { config } from "@root/config";
import _ from 'lodash';
import { BadRequestError } from "@global/helpers/error.handler";
import { ICommentDocument, ICommentNameList } from "@root/features/comments/interfaces/comment.interface";

const log: Logger = config.createLogger('userCache');

class CommentCache extends BaseCache {
    constructor() {
        super("CommentCache");
    }
    public async savePostCommentToCache(postId: string, comment: ICommentDocument): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const dataCommentSave: string[] = [
                '_id', _.toString(comment._id),
                "postId", _.toString(postId),
                "comment", comment.comment,
                "username", comment.username,
                "avataColor", comment.avatarColor,
                "profilePicture", comment.profilePicture,
                "createdAt", _.toString(comment.createdAt)
            ]

            const transaction = this.client.multi();

            transaction.LPUSH(`comments:${postId}`, JSON.stringify(comment));
            transaction.HSET(`comments:${postId}:${_.toString(comment._id)}`, dataCommentSave);
            const commentCounts = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
            let count = JSON.parse(commentCounts[0]) as number;
            count += 1;
            const dataSave: string[] = ['commentsCount', _.toString(count)];
            transaction.HSET(`posts:${postId}`, dataSave);

            await transaction.exec();
        } catch (error) {
            throw new BadRequestError(error as any)
        }
    }

    public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const reply: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
            const comments: ICommentDocument[] = [];
            for (const item of reply) {
                comments.push(JSON.parse(item));
            };

            return comments;

        } catch (error) {
            throw new BadRequestError(error as any)
        }
    }

    public async getCommentsNamesFromCache(postId: string): Promise<ICommentNameList[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const [commentsCount, comments] = await Promise.all([
                this.client.LLEN(`comments:${postId}`),
                this.client.LRANGE(`comments:${postId}`, 0, -1)
            ])

            const list: string[] = [];
            for (const item of comments) {
                list.push(JSON.parse(item));
            };

            return [{
                count: commentsCount,
                names: list
            }]
        } catch (error) {
            throw new BadRequestError(error as any)
        }
    }

    public async getSingleCommentFromCache(postId: string, commentId: string) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const comment = await this.client.HGETALL(`comments:${postId}:${commentId}`) as unknown as ICommentDocument;
            return comment;
        } catch (error) {
            throw new BadRequestError(error as any)
        }
    }

}

export default CommentCache;