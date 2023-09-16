import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@root/config";
import { ISavePostToCache } from "@post/interfaces/post.interface";
import _ from 'lodash';
import { ServerError } from "@global/helpers/error.handler";

const log: Logger = config.createLogger('postCache');

class PostCache extends BaseCache {
    constructor() {
        super('postCache');
    };

    private async savePostToCache(data: ISavePostToCache) {
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

            const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
            const transaction = this.client.multi();
            transaction.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
            transaction.HSET(`posts:${key}`, dataInsert);
            const count: number = parseInt(postCount[0], 10) + 1;
            transaction.HSET(`users:${currentUserId}`, ['postsCount', count]);
            await transaction.exec();
        } catch (error) {
            throw new ServerError('Internal Server Error.')
        }

    }
}

export default new PostCache();