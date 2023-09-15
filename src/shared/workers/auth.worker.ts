import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';


const log: Logger = config.createLogger('authWorker');

class AuthWorker {
    async addAuthUserToDB(job: Job, done: DoneCallback) {
        try {
            const { value } = job.data;
            await authService.insertAuthUser(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export default new AuthWorker();