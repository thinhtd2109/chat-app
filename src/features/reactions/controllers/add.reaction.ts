import { IReactionDocument, IReactionJob } from "@reaction/interfaces/reaction.interface";
import ReactionCache from "@service/redis/reaction.cache";
import { Request, Response } from "express";
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import reactionQueue from "@service/queues/reaction.queue";
import reactionService from "@service/db/reaction.service";
import { BadRequestError } from "@global/helpers/error.handler";

const reactionCache = new ReactionCache();
class CreateReactionController {
    public async reaction(request: Request, response: Response) {
        const { userTo, postId, type, postReactions, profilePicture } = request.body;
        const userAuth = request.user;
        const reactionObject: IReactionDocument = {
            _id: new ObjectId(),
            postId: postId,
            type,
            avataColor: userAuth?.avatarColor,
            username: userAuth?.username,
            profilePicture,
        } as IReactionDocument;

        await reactionCache.saveUserReactionToCache(postId, reactionObject, type, userAuth!.userId);

        const reactionData: any = {
            postId,
            userTo,
            userFrom: userAuth?.userId,
            type,
            username: userAuth!.username,
            reactionObject,
        };

        reactionQueue.addReactionJob('addReactionToDatabase', reactionData);

        response.status(HTTP_STATUS.OK).send({ message: 'Reaction added successfully' })
    }
};
export default new CreateReactionController();