import { ICommentJob, ICommentNameList, IQueryComment } from "@comment/interfaces/comment.interface";
import { CommentsModel } from "@comment/models/comment.schema";
import { ServerError } from "@global/helpers/error.handler";
import { PostModel } from "@post/models/post.schema";
import { config } from "@root/config";
import UserCache from "@service/redis/user.cache";
import Logger from "bunyan";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';

const log: Logger = config.createLogger('CommentService');
const userCache = new UserCache();

class CommentService {
    public async saveComment(commentData: ICommentJob) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {

            const {
                postId,
                userTo,
                userFrom,
                username,
                comment
            } = commentData;

            console.log(comment)

            const newComment = new CommentsModel(comment);
            await newComment.save({ session });
            await PostModel.findOneAndUpdate({
                _id: postId
            }, {
                $inc: {
                    commentsCount: 1
                }
            }, {
                new: true,
                session
            })
            userCache.getUserFromCache(userTo);
            // send comment notification

            await session.commitTransaction();


        } catch (error) {
            log.error(error);
            await session.abortTransaction();
            throw new ServerError('Internal Server Error')
        }

    }
    public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>) {
        const comments = await CommentsModel.aggregate([
            { $match: { query } },
            { $sort: sort }
        ]);

        return comments
    };

    public async getPostCommentByNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
        const comments = await CommentsModel.aggregate([
            { $match: { query } },
            { $sort: sort },
            {
                $group: {
                    _id: null,


                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]);

        return comments
    }
};

export default new CommentService();