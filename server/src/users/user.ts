import {compareSync, hashSync} from 'bcryptjs';
import {Document, model, Schema} from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;

  /**
   * Methods
   */
  generateHash: (password: string) => string;
  validatePassword: (password: string) => boolean;
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

UserSchema.methods.validatePassword = function(password: string) {
  return compareSync(this.password, password)
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

export const UserModel = model<User>('User', UserSchema);
