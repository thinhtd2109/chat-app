import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@root/config";
import _ from 'lodash';
import { BadRequestError } from "@global/helpers/error.handler";
import { IReactionDocument, IReactions } from "@reaction/interfaces/reaction.interface";

const log: Logger = config.createLogger('postCache');

class ReactionCache extends BaseCache {
    constructor() {
        super('postCache');
    };

    public async removeReactionFromCache(key: string, username: string, postReactions: IReactions) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            };
            const keyString = `reactions:${key}`;
            const reactionByPost = await this.client.LRANGE(keyString, 0, -1);
            const transaction = this.client.multi();
            const previousReaction: IReactionDocument = this.getPreviousReaction(reactionByPost, username) as unknown as IReactionDocument;
            transaction.LREM(`reactions:${key}`, 1, JSON.stringify(previousReaction))

            const dataUpdate: string[] = ['reactions', JSON.stringify(postReactions)];
            transaction.HSET(`posts:${key}`, dataUpdate);
            await transaction.exec();

        } catch (error: any) {
            log.error(error)
            throw new BadRequestError(error);
        }
    }

    public async saveUserReactionToCache(
        key: string,
        reaction: IReactionDocument,
        postReaction: IReactions,
        type: string,
        previousReaction: string
    ): Promise<void> {
        try {
            if (!this.client.isOpen) await this.client.connect();
            const transaction = this.client.multi();

            if (previousReaction) {
                this.removeReactionFromCache(key, reaction.username, postReaction);
            }

            if (type) {
                transaction.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
                const reactionInput = [
                    'reactions', JSON.stringify(postReaction)
                ];
                transaction.HSET(`posts:${key}`, reactionInput);
                await transaction.exec();
            }

        } catch (error: any) {
            log.error(error)
            throw new BadRequestError(error);
        }
    }

    private getPreviousReaction(response: string[], username: string) {
        return _.find(response, (item: IReactionDocument) => {
            const parseItem: IReactionDocument = JSON.parse(_.toString(item));
            return parseItem.username == username;
        })
    }

}


export default new ReactionCache();