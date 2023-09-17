import { BadRequestError } from "@global/helpers/error.handler";
import { IPostDocument } from "@post/interfaces/post.interface";
import { PostModel } from "@post/models/post.schema";
import { IReactionJob } from "@reaction/interfaces/reaction.interface";
import { ReactionModel } from "@reaction/models/reaction.schema";
import ReactionCache from "@service/redis/reaction.cache";
import _ from 'lodash';
import mongoose from "mongoose";

const reactionCache = new ReactionCache();

class ReactionService {
    public async getReactionByPostAndUserName(postId: string, username: string) {
        return await ReactionModel.findOne({
            postId,
            username
        })
    }
    public async addReactionToDatabase(reaction: IReactionJob) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const {
                postId,
                username,
                userTo,
                userFrom,
                type,
                reactionObject,
            } = reaction;
            const postKey = `posts:${postId}`;

            const postData = await reactionCache.getHashCacheByKey(postKey) as unknown as IPostDocument;

            const reactionNew = new ReactionModel(reactionObject)
            await ReactionModel.deleteOne({ postId, username });
            await Promise.all([
                reactionNew.save({ session }),
                PostModel.updateOne({
                    _id: postId,
                }, {
                    $set: postData
                }, { session })
            ])
            // send notification

            await session.commitTransaction();

        } catch (error: any) {
            await session.abortTransaction();
            throw new BadRequestError(error)

        }

    }

}

export default new ReactionService();