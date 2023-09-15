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
        const user = await AuthModel.findOne(mongoose.sanitizeFilter({ username })).lean();
        return user;
    }
}

export const authService = new AuthService();  