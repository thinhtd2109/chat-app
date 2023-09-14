import mongoose from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';
import redisConnection from '@service/redis/redis.connection';

const log: Logger = config.createLogger('database');

export default () => {
    const connect = () => {
        mongoose.connect(config.DATABASE_URL)
            .then(async () => {
                log.info('Kết nối database thành công.');
                await redisConnection.connect();

            }).catch((err) => {
                log.error(err)
                return process.exit(0);
            })
    };
    connect();
    mongoose.connection.on('disconnected', connect);
};


