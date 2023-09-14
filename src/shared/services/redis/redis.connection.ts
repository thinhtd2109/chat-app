import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import { BadRequestError } from '@global/helpers/error.handler';

const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }

    async connect() {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            log.info(await this.client.ping());
        } catch (error: any) {
            log.error(error);
            throw new BadRequestError(error);
        }
    }
}

export default new RedisConnection();