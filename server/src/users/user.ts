import {compareSync, hashSync} from 'bcryptjs';
import {Document, Model, model, Schema} from 'mongoose';
import {CONFIG} from '../config';
import {generatePassword} from '../utils/generate-password';

export interface User extends Document {
  email: string;
  password: string;

  /**
   * Methods
   */
  generateHash: (password: string) => string;
  validatePassword: (password: string) => boolean;
}

export interface IUserSchema extends Model<User> {
  createInitialUsers: (email: string, password?: string) => Promise<{
    email: string;
    password: string;
  }>;
}

const UserSchema = new Schema<User>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.statics.createInitialUsers = async function(email: string, password?: string) {
  const users = await UserModel.countDocuments();

  if (users === 0) {

    const account = {
      email,
      password: password || generatePassword()
    };

    await new UserModel(account).save();

    return account;
  }
};

UserSchema.methods.validatePassword = function(password: string) {
  return compareSync(password, this.password)
};

UserSchema.methods.generateHash = function(password) {
  return hashSync(password, 8);
};

UserSchema.pre<User>('save', async function(next) {
  if (this.isModified('password')) {
    this.password = this.generateHash(this.password);
  }

  next();
});

UserSchema.index({email: 1}, {unique: true});

export const UserModel = model<User, IUserSchema>('User', UserSchema);
