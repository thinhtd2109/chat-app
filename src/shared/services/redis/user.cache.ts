import { IUserDocument } from "@user/interfaces/user.interface";
import { BaseCache } from "./base.cache";
import Logger from "bunyan";
import { config } from "@root/config";
import { BadRequestError, ServerError } from "@global/helpers/error.handler";
import _ from 'lodash';
import { Helpers } from "@global/helpers/helpers";

const log: Logger = config.createLogger('userCache');

class UserCache extends BaseCache {
    constructor() {
        super("userCache");
    }

    public async saveUserToCache(key: string, uId: string, createdUser: IUserDocument): Promise<void> {
        const {
            _id,
            authId,
            username,
            email,
            password,
            avatarColor,
            postsCount,
            work,
            school,
            quote,
            location,
            blocked,
            blockedBy,
            followersCount,
            followingCount,
            notifications,
            social,
            bgImageVersion,
            bgImageId,
            profilePicture,
            createdAt,
        } = createdUser;
        const dataSave: string[] = [
            "_id", _.toString(_id),
            "authId", _.toString(authId),
            "username", _.toString(username),
            "email", _.toString(email),
            "password", _.toString(password),
            "avatarColor", _.toString(avatarColor),
            "uId", _.toString(uId),
            "postsCount", _.toString(postsCount),
            "work", _.toString(work),
            "school", _.toString(school),
            "quote", _.toString(quote),
            "location", _.toString(location),
            "blocked", JSON.stringify(blocked),
            "blockedBy", JSON.stringify(blockedBy),
            "followersCount", _.toString(followersCount),
            "followingCount", _.toString(followingCount),
            "notifications", JSON.stringify(notifications),
            "social", JSON.stringify(social),
            "bgImageVersion", bgImageVersion,
            "bgImageId", _.toString(bgImageId),
            "profilePicture", _.toString(profilePicture),
            "createdAt", _.toString(createdAt)
        ];

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            await this.client.ZADD('user', { score: parseInt(uId, 10), value: _.toString(key) });
            await this.client.HSET(`user:${key}`, dataSave);
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. try again');
        }

    }

    public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            };

            const response: IUserDocument = await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;
            response.blocked = Helpers.parseJSON(_.toString(response.blocked));
            response.blockedBy = Helpers.parseJSON(_.toString(response.blockedBy));
            response.notifications = Helpers.parseJSON(_.toString(response.notifications));
            response.social = Helpers.parseJSON(_.toString(response.social));
            response.followersCount = Helpers.parseJSON(_.toString(response.followersCount));
            response.followingCount = Helpers.parseJSON(_.toString(response.followingCount));
            console.log(response)
            return response;
        } catch (error: any) {
            throw new BadRequestError(error);
        }
    }
}

export default UserCache;