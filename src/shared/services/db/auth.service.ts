import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { Helpers } from "@global/helpers/helpers";
import mongoose from "mongoose";

class AuthService {
    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
        const query = { $or: [{ username: Helpers.toLowerCase(username) }, { email: Helpers.toLowerCase(email) }] };
        const user: IAuthDocument = await AuthModel.findOne(mongoose.sanitizeFilter(query)).exec() as IAuthDocument;
        return user;
    }

    public async insertAuthUser(data: IAuthDocument) {
        const newAuth = new AuthModel(data);
        return await newAuth.save();
    }

    public async getAuthByUsername(username: string) {
        const user = await AuthModel.findOne(mongoose.sanitizeFilter({ username }));
        return user;
    }

    public async getAuthByEmail(email: string) {
        const user = await AuthModel.findOne({ email });
        return user;
    }

    public async updatePasswordToken(authId: string, token: string, tokenExpiration: number) {
        const user = await AuthModel.updateOne({ _id: authId }, {
            passwordResetToken: token,
            passwordResetExpires: tokenExpiration
        });

        return user;
    }

    public async getAuthPasswordByToken(token: string) {
        const user = await AuthModel.findOne(mongoose.sanitizeFilter({
            passwordResetToken: token
        })).gt("passwordResetExpires", Date.now()).exec();
        return user;
    }

}

export const authService = new AuthService();  