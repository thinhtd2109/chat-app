import { config } from "@root/config";
import mailTransport from "@service/emails/mail.transport";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('EmailWorker');

class EmailWorker {
    async addNotificationEmail(job: Job, done: DoneCallback) {
        try {
            const { template, receiverEmail, subject } = job.data;
            await mailTransport.sendMail(receiverEmail, subject, template);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export default new EmailWorker()