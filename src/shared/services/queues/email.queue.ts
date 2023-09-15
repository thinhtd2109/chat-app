import { IEmailJob } from "@user/interfaces/user.interface";
import { BaseQueue } from "./base.queue";
import emailWorker from "@worker/email.worker";

class EmailQueue extends BaseQueue {
    constructor() {
        super('Email');
        this.processJob('forgotPassword', 5, emailWorker.addNotificationEmail)
    };

    public addEmailJob(name: string, data: IEmailJob) {
        this.addJob(name, data);
    }
}

export default new EmailQueue();