import { BaseQueue } from "./base.queue";
import { IAuthJob } from "@auth/interfaces/auth.interface";

class UserQueue extends BaseQueue {
    constructor() {
        super('User');
    }

    public addUserJob(name: string, data: IAuthJob): void {
        return this.addJob(name, data);
    }
}

export default new UserQueue();