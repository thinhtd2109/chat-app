import { config } from "@root/config";
import followerService from "@service/db/follower.service";
import mailTransport from "@service/emails/mail.transport";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";
import mongoose from "mongoose";

const log: Logger = config.createLogger('FollowerWorker');

class FollowerWorker {
    async addFollowToDB(job: Job, done: DoneCallback) {
        try {
            const { followerId, followingId, username, newFollowId } = job.data;
            await followerService.addFollowerToDB(
                followingId,
                followerId,
                username,
                newFollowId,

            );

            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export default new FollowerWorker()