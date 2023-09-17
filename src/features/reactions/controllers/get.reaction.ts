import ReactionCache from "@service/redis/reaction.cache";
import { Request, Response } from "express";
import reactionService from "@service/db/reaction.service";
import HTTP_STATUS from 'http-status-codes';
import _ from 'lodash'

const reactionCache = new ReactionCache();
class CreateReactionController {
    public async reaction(request: Request, response: Response) {
        const { postId } = request.params;
        const cachedReactions = await reactionCache.getReactionsCache(postId);
        for (let i = 0; i < cachedReactions.length; i++) {
            cachedReactions[i] = JSON.parse(cachedReactions[i]);
        }
        const result = cachedReactions.length ? cachedReactions : await reactionService.getPostReaction({
            postId,
        }, {
            createdAt: -1
        });

        response.status(HTTP_STATUS.OK).send({
            message: 'Post Reactions',
            data: {
                reactions: result[0],
                count: result[1]
            }
        })
    };

    public async getPostReactionByUsername(request: Request, response: Response) {
        const { postId, username } = request.body;

        const cachedReactions = await reactionCache.getReactionsCache(postId);
        for (let i = 0; i < cachedReactions.length; i++) {
            cachedReactions[i] = JSON.parse(cachedReactions[i]);
        }
        const results = cachedReactions ? cachedReactions : await reactionService.getSinglePostIdReactionByUsername(postId, username);
        response.status(HTTP_STATUS.OK).send({
            message: 'Post Reactions By Username',
            data: {
                reactions: results[0],
                count: results[1]
            }
        })
    }

    public async getReactionByUsername(request: Request, response: Response) {
        const { username } = request.params;
        const reactions = await reactionService.getPostByUsername(username);
        response.status(HTTP_STATUS.OK).send({
            message: 'All reaction by username',
            reactions
        })
    }
};
export default new CreateReactionController();