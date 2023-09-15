import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { ObjectId } from 'mongodb';
import randomstring from "randomstring";
import JWT from 'jsonwebtoken';
import { config } from "@root/config";
import _ from 'lodash';
export class Helpers {
    static toLowerCase(str: string) {
        return str.toLowerCase();
    }
    static generateRandomInteger() {
        return randomstring.generate({
            charset: 'numeric',
            length: 12
        })
    }

    static signupToken(data: IAuthDocument, userObjectId: string | ObjectId) {
        return JWT.sign({
            _id: _.toString(userObjectId),
            username: data.username,
            email: Helpers.toLowerCase(data.email),
            uId: data.uId,
            password: data.password,
            avatarColor: data.avatarColor,
            createdAt: data.createdAt
        }, config.JWT_TOKEN)
    }
}