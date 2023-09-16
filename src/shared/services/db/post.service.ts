import { ServerError } from "@global/helpers/error.handler";
import { IPostDocument } from "@post/interfaces/post.interface";
import { PostModel } from "@post/models/post.schema";
import { IUserDocument } from "@user/interfaces/user.interface";
import { UserModel } from "@user/models/user.schema";
import mongoose, { UpdateQuery } from "mongoose";

class PostService {
    public async savePost(userId?: string, data?: IPostDocument) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const post = new PostModel(data);
            const user: UpdateQuery<IUserDocument> = await UserModel.updateOne({
                _id: userId,
            }, {
                $inc: {
                    postsCount: 1
                }
            }, {
                session
            })
            const result = await post.save({
                session
            });
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw new ServerError('Internal Server Error.')
        }
    }
}

export default new PostService();