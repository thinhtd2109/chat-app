import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue";
import authWorker from "@worker/auth.worker";

class AuthQueue extends BaseQueue {
    constructor() {
        super("Auth");
        this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
    };

    public addAuthJob(name: string, data: IAuthJob): void {
        this.addJob(name, data);
    }
}

export const authQueue = new AuthQueue();