import { BadRequestError } from "@global/helpers/error.handler";
import { IPostDocument } from "@post/interfaces/post.interface";
import { PostModel } from "@post/models/post.schema";
import { IQueryReaction, IReactionDocument, IReactionJob } from "@reaction/interfaces/reaction.interface";
import { ReactionModel } from "@reaction/models/reaction.schema";
import ReactionCache from "@service/redis/reaction.cache";
import _ from 'lodash';
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';
import { Helpers } from "@global/helpers/helpers";



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
            const reactionNew = new ReactionModel(reactionObject);
            if (type) {
                await reactionNew.save({ session });
            }
            Promise.all([
                ReactionModel.deleteOne({ postId, username }, { session }),
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
    public async getPostReaction(query: IQueryReaction, sort: Record<string, 1 | -1>) {
        const reactions = await ReactionModel.aggregate([
            { $match: query },
            { $sort: sort }
        ]);

        return [reactions as IReactionDocument[], reactions.length];
    }

    public async getSinglePostIdReactionByUsername(postId: string, username: string) {
        const reactions = await ReactionModel.aggregate([
            { $match: { postId: new ObjectId(postId), username: Helpers.toLowerCase(username) } },
        ]);

        return reactions.length ? [reactions[0], 1] : []
    }

    public async getPostByUsername(username: string) {
        const reactions = await ReactionModel.aggregate([
            { $match: { username: Helpers.toLowerCase(username) } },
        ]);

        return reactions.length ? [reactions[0], 1] : []
    }


}

export default new ReactionService();