
import { AuthModel } from "@auth/models/auth.schema";
import { IUserDocument } from "@user/interfaces/user.interface";
import { UserModel } from "@user/models/user.schema";
import mongoose from "mongoose";

class UserService {
    public async insertUser(data: IUserDocument) {
        const newUser = new UserModel(data);
        return await newUser.save();
    }
    public async getUserById(userId: string) {
        const users = await UserModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'Auth',
                    localField: 'authId',
                    foreignField: '_id', as: 'authId'
                }
            },
            {
                $unwind: '$authId'
            },
            {
                $project: this.aggregateProject()
            }
        ]);

        return users[0];
    }

    private aggregateProject() {
        return {
            _id: 1,
            username: '$authId.username',
            uId: '$authId.uId',
            email: '$authId.email',
            avatarColor: '$authId.avatarColor',
            profilePicture: 1,
            postsCount: 1,
            followersCount: 1,
            followingCount: 1,
            passwordResetToken: 1,
            passwordResetExpires: 1,
            blocked: 1,
            blockedBy: 1,
            notifications: {
                messages: 1,
                reactions: 1,
                comments: 1,
                follows: 1
            },
            social: {
                facebook: 1,
                instagram: 1,
                twitter: 1,
                youtube: 1
            },
            work: 1,
            school: 1,
            location: 1,
            quote: 1,
            bgImageVersion: 1,
            bgImageId: 1
        }
    }
}

export default new UserService()