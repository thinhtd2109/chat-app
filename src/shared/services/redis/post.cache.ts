import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@root/config";
import { IPostDocument, ISavePostToCache } from "@post/interfaces/post.interface";
import _ from 'lodash';
import { ServerError } from "@global/helpers/error.handler";

const log: Logger = config.createLogger('postCache');

class PostCache extends BaseCache {
    constructor() {
        super('postCache');
    };

    public async savePostToCache(data: ISavePostToCache) {
        const { key, currentUserId, uId, createdPost } = data;

        const {
            _id,
            userId,
            username,
            email,
            avatarColor,
            profilePicture,
            bgColor,
            post,
            gifUrl,
            feelings,
            privacy,
            commentsCount,
            imgId,
            createdAt,
            reactions,
        } = createdPost;

        const dataInsert: string[] = [
            '_id', _.toString(_id),
            'userId', _.toString(userId),
            'username', username,
            'email', email,
            'avatarColor', avatarColor,
            'profilePicture', profilePicture,
            'bgColor', bgColor,
            'post', post,
            'gifUrl', _.toString(gifUrl),
            'feelings', JSON.stringify(feelings),
            'privacy', _.toString(privacy),
            'commentsCount', _.toString(commentsCount),
            'imgId', _.toString(imgId),
            'createdAt', _.toString(createdAt),
            'reactions', JSON.stringify(reactions),
        ];

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const userKey = `users:${currentUserId}`;
            const postCount: string[] = await this.client.HMGET(userKey, 'postsCount');
            const countNum = parseInt(postCount[0], 10) ? parseInt(postCount[0], 10) : 0;
            const transaction = this.client.multi();
            transaction.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
            transaction.HSET(`posts:${key}`, dataInsert);
            const count: number = countNum + 1;
            transaction.HSET(userKey, ['postsCount', count]);
            await transaction.exec();
        } catch (error) {
            throw new ServerError('Internal Server Error.')
        }

    }

    public async getPostFromCache(key: string, start: number, end: number): Promise<IPostDocument[] | any> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

            const transaction = this.client.multi();
            for (let value of reply) {
                transaction.HGETALL(`posts:${value}`);
            };

            const replies = await transaction.exec();

            const postReplies: IPostDocument[] = [];

            for (const post of replies as unknown as IPostDocument[]) {
                post.commentsCount = JSON.parse(_.toString(post.commentsCount)) as number;
                post.reactions = JSON.parse(_.toString(post.reactions));
                post.createdAt = JSON.parse(_.toString(post.createdAt));
                postReplies.push(post);
            }
            return postReplies;

        } catch (error) {
            log.error(error)
            throw new ServerError("Internal Server Error.");
        }
    }

    public async getTotalPostsFromCache(): Promise<number> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            };

            const count: number = await this.client.ZCARD('post');
            return count;
        } catch (error) {
            throw new ServerError("Internal Server Error.");
        }
    }

    public async getPostWithImageFromCache(key: string, start: number, end: number): Promise<IPostDocument[] | any> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

            const transaction = this.client.multi();
            for (let value of reply) {
                transaction.HGETALL(`posts:${value}`);
            };

            const replies = await transaction.exec();
            const postWithImage: IPostDocument[] = [];

            for (const post of replies as unknown as IPostDocument[]) {
                if ((post.imgId && post.imgVersion) || post.gifUrl) {
                    post.commentsCount = JSON.parse(_.toString(post.commentsCount)) as number;
                    post.reactions = JSON.parse(_.toString(post.reactions));
                    post.createdAt = JSON.parse(_.toString(post.createdAt));
                    postWithImage.push(post);
                }
            }
            return postWithImage;

        } catch (error) {
            throw new ServerError("Internal Server Error.");
        }
    }
    public async getPostUserFromCache(key: string, start: number, end: number): Promise<IPostDocument[] | any> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

            const transaction = this.client.multi();
            for (let value of reply) {
                transaction.HGETALL(`posts:${value}`);
            };

            const replies = await transaction.exec();
            const postReplies: IPostDocument[] = [];

            for (const post of replies as unknown as IPostDocument[]) {
                post.commentsCount = JSON.parse(_.toString(post.commentsCount)) as number;
                post.reactions = JSON.parse(_.toString(post.reactions));
                post.createdAt = JSON.parse(_.toString(post.createdAt));
                postReplies.push(post);
            }
            return postReplies;

        } catch (error) {
            throw new ServerError("Internal Server Error.");
        }
    }
    public async getTotalUserPostInCache(uId: number): Promise<IPostDocument[] | any> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            return await this.client.ZCOUNT('post', uId, uId);
        } catch (error) {
            throw new ServerError("Internal Server Error.");
        }
    };

    public async deletePostFromCache(key: string, userId: string) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const userKey = `users:${userId}`;
            const postCount: string[] = await this.client.HMGET(userKey, 'postsCount');
            const transaction = this.client.multi();
            const count = parseInt(postCount[0], 10) - 1;
            transaction.DEL(`posts:${key}`);
            transaction.DEL(`comments:${key}`);
            transaction.DEL(`reactions:${key}`);
            transaction.HSET(userKey, ['postsCount', count]);
            transaction.ZREM('post', key);
            await transaction.exec();

        } catch (error) {
            throw new ServerError("Internal Server Error.");
        }
    }
}

export default new PostCache();