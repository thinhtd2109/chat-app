
import { IFollowerData } from "@follower/interfaces/follower.interface";
import { joiValidation } from "@global/decorators/joi-validations.decorator";
import { BadRequestError, ServerError } from "@global/helpers/error.handler";
import FollowerCache from "@service/redis/follower.cache";
import UserCache from "@service/redis/user.cache";
import { IUserDocument } from "@user/interfaces/user.interface";
import { Request, Response } from "express";
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { socketIOFollowerObject } from "@socket/follower.socket";
import mongoose from "mongoose";
import followerQueue from "@service/queues/follower.queue";

const followerCache = new FollowerCache();
const userCache = new UserCache();

class CreateFollowController {
    constructor() { }
    public async follower(request: Request, response: Response) {
        const transaction = followerCache.client.multi();
        try {
            const { followerId } = request.params;
            const updatedFollowerCount = followerCache.updateFollowerCountFromCache(followerId, 'followersCount', 1, transaction);
            const updatedFollowingCount = followerCache.updateFollowerCountFromCache(request.user!.userId, 'followingCount', 1, transaction);
            await Promise.all([updatedFollowerCount, updatedFollowingCount]);

            const cachedFollower = userCache.getUserFromCache(followerId);
            const cachedFollowing = userCache.getUserFromCache(_.toString(request.user!.userId));
            const [followerUser, followingUser] = await Promise.all([cachedFollower, cachedFollowing]);
            if (!followerUser || !followingUser) throw new ServerError('Internal Server Error.')
            const followerObjectId = new ObjectId();
            const addFollowerData = CreateFollowController.prototype.userData(followerUser);

            socketIOFollowerObject.emit('add follower', addFollowerData);

            const savedFollowerToCache = followerCache.saveFollowerToCache(`followers:${_.toString(followerUser._id)}`, followerUser as any, transaction);
            const savedFollowingToCache = followerCache.saveFollowerToCache(`following:${request.user?.userId}`, followingUser as any, transaction);

            await Promise.all([savedFollowerToCache, savedFollowingToCache]);

            followerQueue.addFollowerJob('addFollowerToDB', {
                followerId,
                followerDocumentId: followerObjectId,
                followingId: request.user!.userId,
                username: request.user?.username,
            })

            await transaction.exec();

            // send data to client with socketIO


            response.status(HTTP_STATUS.OK).send({
                message: 'Following user now.'
            })
        } catch (error) {
            console.log(error);
            throw new BadRequestError('Internal Server Error.')
        }

    }

    private userData(user: IUserDocument): IFollowerData {
        return {
            _id: new ObjectId(user._id),
            username: user.username!,
            avatarColor: user.avatarColor!,
            postCount: user.postsCount,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            uId: user.uId!,
            userProfile: user
        };
    }
}

export default CreateFollowController;