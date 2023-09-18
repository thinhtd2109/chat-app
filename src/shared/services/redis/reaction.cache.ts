import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@root/config";
import _ from 'lodash';
import { BadRequestError } from "@global/helpers/error.handler";
import { IReactionDocument } from "@reaction/interfaces/reaction.interface";
import { IPostDocument } from "@post/interfaces/post.interface";

const log: Logger = config.createLogger('postCache');

class ReactionCache extends BaseCache {
    constructor() {
        super('postCache');
    };

    public async getHashCacheByKey(key: string) {
        if (!this.client.isOpen) {
            await this.client.connect();
        };
        return await this.client.HGETALL(key);
    }

    public async removeReactionFromCache(key: string, username: string) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            };


            const transaction = this.client.multi();

            await transaction.exec();

        } catch (error: any) {
            log.error(error)
            throw new BadRequestError(error);
        }
    }

    public async getReactionsCache(postId: string): Promise<any> {
        if (!this.client.isOpen) await this.client.connect();
        const key = `reactions:${postId}`;
        const results = await this.client.LRANGE(key, 0, -1) as unknown as IReactionDocument[];
        return [results, results.length]
    }

    public async getSingleReactionUsernameFromCache(postId: string, username: string) {
        try {

            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
            const list: IReactionDocument[] = [];
            for (const item of response) {
                const parseItem = JSON.parse(item);
                list.push(parseItem);
            };

            const result: IReactionDocument | undefined | null = _.find(list, (item: IReactionDocument) => {
                return item.username == username
            });

            return result ? result[0] : []
        } catch (error) {
            log.error(error)
        }
    }

    public async saveUserReactionToCache(
        key: string,
        reaction: IReactionDocument,
        type: string,
        userId: string
    ): Promise<void> {
        try {
            if (!this.client.isOpen) await this.client.connect();
            const transaction = this.client.multi();
            const keyObject = {
                reactionKey: `reactions:${key}`,
                reactionUserKey: `reactions:user:${key}`,
                postKey: `posts:${key}`,
                stringKey: `reactions.${type}`
            }
            const post = await this.client.HGETALL(keyObject.postKey) as unknown as IPostDocument;
            post.reactions = JSON.parse(_.toString(post.reactions));
            const previousItem = await this.client.HGETALL(keyObject.reactionUserKey) as unknown as IReactionDocument;
            const item = _.get(post, keyObject.stringKey);
            if (!_.isEmpty(previousItem)) {
                if (previousItem.type == type) return;
                this.removeReaction({
                    reactionKey: keyObject.reactionKey,
                    postKey: keyObject.postKey,
                    post, previousItem,
                    transaction,
                    reactionUserKey: keyObject.reactionUserKey,
                    userId
                })
            }

            if (type) {

                this.addReaction({
                    post,
                    stringKey: keyObject.stringKey,
                    item,
                    reaction,
                    transaction,
                    postKey: keyObject.postKey,
                    reactionKey: keyObject.reactionKey,
                    reactionUserKey: keyObject.reactionUserKey,
                    userId
                })
            }
            await transaction.exec();
        } catch (error: any) {
            log.error(error)
            throw new BadRequestError(error);
        }
    }
    public removeReaction({ reactionKey, postKey, post, previousItem, transaction, reactionUserKey, userId }) {
        const previousParsed = JSON.parse(_.toString(previousItem)) as unknown as IReactionDocument;
        post.reactions[previousParsed.type] = post.reactions[previousParsed.type] - 1;
        const reactionInput = ['reactions', JSON.stringify(post.reactions)];
        transaction.HSET(postKey, reactionInput);
        transaction.LREM(reactionKey, 1, previousItem as any);
        transaction.HDEL(reactionUserKey, userId);
    }

    public addReaction({ post, stringKey, item, reaction, transaction, postKey, reactionKey, reactionUserKey, userId }) {
        const dataToSave: string[] = [
            '_id', _.toString(reaction._id),
            "username", _.toString(reaction.username),
            "avataColor", reaction.avataColor,
            "type", reaction.type,
            "postId", reaction.postId,
            "profilePicture", reaction.profilePicture,
            "createdAt", _.toString(reaction.createdAt),
            "userTo", _.toString(reaction.userTo),
            "comment", _.toString(reaction.comment)
        ]

        _.set(post, stringKey, item + 1);
        const reactionInput = ['reactions', JSON.stringify(post.reactions)];
        transaction.HSET(postKey, reactionInput);
        transaction.LPUSH(reactionKey, JSON.stringify(reaction));
        transaction.HSET(reactionUserKey, dataToSave);
    }

}


export default ReactionCache