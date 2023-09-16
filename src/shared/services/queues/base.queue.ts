import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import _ from 'lodash';

import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '@root/config';

let bullAdapter: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;


export abstract class BaseQueue {
    queue: Queue.Queue;
    log: Logger;
    constructor(queueName: string) {
        this.queue = new Queue(queueName, _.toString(config.REDIS_HOST));
        this.log = config.createLogger(`${queueName}Queue`);
        bullAdapter.push(new BullAdapter(this.queue));
        bullAdapter = [...new Set(bullAdapter)];
        serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/queues');

        createBullBoard({
            queues: bullAdapter,
            serverAdapter
        });

        this.queue.on('completed', (job: Job) => {
            job.remove();
        });

        this.queue.on('global:completed', (jobId: string) => {
            this.log.info(`Job ${jobId} completed`);
        });

        this.queue.on('global:stalled', (jobId: string) => {
            this.log.info(`Job ${jobId} stalled`);
        });

    };

    protected addJob(name: string, data: any) {
        this.queue.add(name, data, {
            attempts: 3,
            backoff: {
                type: 'fixed',
                delay: 5000
            }
        });
    }

    protected processJob(name: string, concurrently: number, callback: Queue.ProcessCallbackFunction<void>) {
        this.queue.process(name, concurrently, callback);
    }

};