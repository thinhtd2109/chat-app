import { hash, compare, genSaltSync } from 'bcrypt';
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { model, Model, Schema } from 'mongoose';
import { BadRequestError } from '@global/helpers/error.handler';

const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

authSchema.pre('save', async function (this: IAuthDocument) {
  try {
    const salt = genSaltSync(SALT_ROUND);
    if (this.password) {
      const hashedPassword: string = await hash(this.password as string, salt);
      this.password = hashedPassword;
    }
  } catch (error: any) {
    throw new BadRequestError(error)
  }
});

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!;
  return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return hash(password, SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');
export { AuthModel };
