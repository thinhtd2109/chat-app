import postWorker from "@worker/post.worker";
import { BaseQueue } from "./base.queue";
import { IPostJobData } from "@post/interfaces/post.interface";

class UserQueue extends BaseQueue {
    constructor() {
        super('Post');
        this.processJob('addPostToDB', 5, postWorker.savePost);
    }
    public addPostJob(name: string, data: IPostJobData): void {
        return this.addJob(name, data);
    }
}

export default new UserQueue();