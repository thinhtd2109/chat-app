import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import reactionService from '@service/db/reaction.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';


const log: Logger = config.createLogger('ReactionWorker');

class ReactionWorker {
    async addReactionToDatabase(job: Job, done: DoneCallback) {
        try {
            await reactionService.addReactionToDatabase(job.data);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
    // async removeReactionFromDatabase(job: Job, done: DoneCallback) {
    //     try {
    //         await reactionService.removeReaction(job.data);
    //         job.progress(100);
    //         done(null, job.data);
    //     } catch (error) {
    //         log.error(error);
    //         done(error as Error);
    //     }
    // }
}

export default new ReactionWorker();