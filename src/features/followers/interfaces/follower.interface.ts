import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';

export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IFollower {
  _id: mongoose.Types.ObjectId | string;
  followingId?: IFollowerData;
  followerId?: IFollowerData;
  createdAt?: Date;
}

export interface IFollowerData {
  avatarColor: string;
  followersCount: number;
  followingCount: number;
  profilePicture: string;
  postCount: number;
  username: string;
  uId: string;
  _id?: mongoose.Types.ObjectId;
  userProfile?: IUserDocument;
}

export interface IFollowerJobData {
  followerId: string;
  followingId: string;
  username?: string;
  transaction?: mongoose.mongo.ClientSession;
  followerDocumentId?: string | ObjectId;
}

export interface IBlockedUserJobData {
  keyOne?: string;
  keyTwo?: string;
  type?: string;
}
