
import { AuthModel } from "@auth/models/auth.schema";
import { IUserDocument } from "@user/interfaces/user.interface";
import { UserModel } from "@user/models/user.schema";

class UserService {

    public async insertUser(data: IUserDocument) {
        const newUser = new UserModel(data);
        return await newUser.save();
    }
}

export default new UserService()