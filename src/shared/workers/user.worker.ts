import { config } from "@root/config";
import userService from "@service/db/user.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('UserWorker');

class UserWorker {
    async addUserToDB(job: Job, done: DoneCallback) {
        const { value } = job.data;
        try {
            await userService.insertUser(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export default new UserWorker()