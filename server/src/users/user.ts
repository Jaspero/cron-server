import {compareSync, hashSync} from 'bcryptjs';
import {Document, Model, model, Schema} from 'mongoose';
import {CONFIG} from '../config';
import {generatePassword} from '../utils/generate-password';
import crypto from 'crypto';

export interface User extends Document {
  email: string;
  password: string;
  passwordResetHash?: string | null;

  /**
   * Methods
   */
  generateHash: (password: string) => string;
  validatePassword: (password: string) => boolean;
  generatePasswordResetHash: () => string;
  verifyPasswordResetHash: (resetHash: string) => boolean;
}

export interface IUserSchema extends Model<User> {
  createInitialUsers: () => Promise<{
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
  },
  passwordResetHash: {
    type: String,
    default: null
  }
});

UserSchema.statics.createInitialUsers = async function() {
  const users = await UserModel.countDocuments();

  if (users === 0) {

    const account = {
      email: CONFIG.user.initialAccount,
      password: CONFIG.user.initialAccountPassword || generatePassword()
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


UserSchema.methods.generatePasswordResetHash = function() {
  const resetHash = crypto.randomBytes(20).toString('hex');
  this.passwordResetHash = resetHash;
  return resetHash;
};

UserSchema.methods.verifyPasswordResetHash = function(resetHash) {
  return this.passwordResetHash === resetHash;
};


UserSchema.index({email: 1}, {unique: true});

export const UserModel = model<User, IUserSchema>('User', UserSchema);


