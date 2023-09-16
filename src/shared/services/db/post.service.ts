import { ServerError } from "@global/helpers/error.handler";
import { IGetPostsQuery, IPostDocument } from "@post/interfaces/post.interface";
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
    public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
        let postQuery = {};
        if (query.imgId && query.gifUrl) {
            postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
        } else {
            postQuery = query;
        };

        const posts = await PostModel.aggregate([
            { $match: query },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ]);

        return posts;
    };

    public async postsCount() {
        const count: number = await PostModel.count({});
        return count;
    };

    public async deletePost(postId: string, userId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        await UserModel.updateOne({
            _id: userId
        }, {
            $inc: {
                postsCount: -1
            }
        }, { session })
        const result = await PostModel.deleteOne({
            _id: postId
        }, { session });

        await session.commitTransaction();
        return result;
    }


}

export default new PostService();