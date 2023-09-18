import commentWorker from "@worker/comment.worker";
import { BaseQueue } from "./base.queue";
import { ICommentJob } from "@comment/interfaces/comment.interface";

class CommentQueue extends BaseQueue {
    constructor() {
        super('Comment');
        this.processJob('addCommentDB', 5, commentWorker.addCommentDB)
    };

    public addCommentQueue(name: string, data: ICommentJob) {
        this.addJob(name, data);
    }
}

export default new CommentQueue();