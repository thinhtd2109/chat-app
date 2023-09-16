import { IPostJobData } from "@post/interfaces/post.interface";
import { config } from "@root/config";
import postService from "@service/db/post.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";
const log: Logger = config.createLogger('PostWorker');

export class PostWorker {
    async savePost(job: Job, done: DoneCallback) {
        try {
            const { value, key, keyOne, keyTwo }: IPostJobData = job.data;
            await postService.savePost(key, value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
};

export default new PostWorker();