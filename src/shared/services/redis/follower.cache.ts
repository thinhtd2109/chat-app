import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error.handler";
import { RedisClientMultiCommandType } from "@redis/client/dist/lib/client/multi-command";

const log: Logger = config.createLogger('followerCache');
class FollowerCache extends BaseCache {
    constructor() {
        super('followersCache');
    };

    public async saveFollowerToCache(key: string, value: string, transaction: RedisClientMultiCommandType<any, any, any>) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            };

            transaction.LPUSH(key, JSON.stringify(value));
        } catch (error) {
            log.error(error);
            throw new ServerError('Internal Server Error')
        }
    }

    public async removeFollowerFromCache(key: string, value: string) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            };

            await this.client.LREM(key, 1, value);
        } catch (error) {
            log.error(error);
            throw new ServerError('Internal Server Error')
        }
    }

    public async updateFollowerCountFromCache(key: string, prop: string, value: number, transaction: RedisClientMultiCommandType<any, any, any>) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            };

            transaction.HINCRBY(`user:${key}`, prop, value);
        } catch (error) {
            log.error(error);
            throw new ServerError('Internal Server Error')
        }
    }
}

export default FollowerCache;