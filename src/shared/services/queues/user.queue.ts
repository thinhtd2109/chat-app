import userWorker from "@worker/user.worker";
import { BaseQueue } from "./base.queue";
import { IAuthJob } from "@auth/interfaces/auth.interface";

class UserQueue extends BaseQueue {
    constructor() {
        super('User');
        this.processJob('addUserToDB', 5, userWorker.addUserToDB)
    }

    public addUserJob(name: string, data: IAuthJob): void {
        return this.addJob(name, data);
    }
}

export default new UserQueue();