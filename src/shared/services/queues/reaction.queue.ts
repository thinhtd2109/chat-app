import reactionWorker from "@worker/reaction.worker";
import { BaseQueue } from "./base.queue";
import { IReactionJob } from "@reaction/interfaces/reaction.interface";

class ReactionQueue extends BaseQueue {
    constructor() {
        super('Reaction');
        this.processJob('addReactionToDatabase', 5, reactionWorker.addReactionToDatabase);
        //this.processJob('removeReactionFromDatabase', 5, reactionWorker.removeReactionFromDatabase);
    }

    public addReactionJob(name: string, data: IReactionJob): void {
        return this.addJob(name, data);
    }
}

export default new ReactionQueue();