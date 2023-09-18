import { FollowerModel } from "@follower/models/follower.schema";
import { UserModel } from "@user/models/user.schema";
import mongoose, { ObjectId } from "mongoose";

class FollowerService {
    public async addFollowerToDB(
        followingId: string,
        followerId: string,
        username: string,
        followerDocumentId: ObjectId
    ) {

        const newFollow = new FollowerModel({
            _id: followerDocumentId,
            followingId: followingId,
            followerId: followerId
        });

        const bulkWrite = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: {
                        _id: followingId
                    },
                    update: {
                        $inc: { followingCount: 1 }
                    }
                }
            },
            {
                updateOne: {
                    filter: {
                        _id: followerId
                    },
                    update: {
                        $inc: { followersCount: 1 }
                    }
                }
            }
        ])

        const saveFollow = newFollow.save();

        await Promise.all([saveFollow, bulkWrite]);
        return saveFollow;

    }

    public async removeFollowerFromDB(followerId: string, followingId: string, session: mongoose.mongo.ClientSession) {
        const unfollow = FollowerModel.deleteOne({
            followerId,
            followingId
        });

        const bulkWrite = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: {
                        _id: followingId
                    },
                    update: {
                        $inc: { followingCount: -1 }
                    }
                }
            },
            {
                updateOne: {
                    filter: {
                        _id: followerId
                    },
                    update: {
                        $inc: { followersCount: -1 }
                    }
                }
            }
        ], { session });

        await Promise.all([unfollow, bulkWrite]);
    }
}


export default new FollowerService();