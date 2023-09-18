import { IFollowerJobData } from "@follower/interfaces/follower.interface";
import { BaseQueue } from "./base.queue";
import followerWorker from "@worker/follower.worker";

class FollowerQueue extends BaseQueue {
    constructor() {
        super('follower');
        this.processJob('addFollowerToDB', 5, followerWorker.addFollowToDB);
    };

    public addFollowerJob(name: string, data: IFollowerJobData) {
        this.addJob(name, data);
    }
}

export default new FollowerQueue();