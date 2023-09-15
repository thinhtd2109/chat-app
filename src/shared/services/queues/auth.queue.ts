import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue";

class AuthQueue extends BaseQueue {
    constructor() {
        super("Auth");
    };

    public addAuthJob(name: string, data: IAuthJob): void {
        this.addJob(name, data);
    }
}

export const authQueue = new AuthQueue();