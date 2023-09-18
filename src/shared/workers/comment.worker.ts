import { config } from "@root/config";
import commentService from "@service/db/comment.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('CommentWorker');

class CommentWorker {
    async addCommentDB(job: Job, done: DoneCallback) {
        try {
            await commentService.saveComment(job.data);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export default new CommentWorker()