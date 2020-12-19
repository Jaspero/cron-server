import {compareSync, hashSync} from 'bcryptjs';
import {Document, Model, model, Schema} from 'mongoose';
import {User} from '../users/user';

export interface Account extends Document {
  name: string;
  apiKey: string;
  description?: string;

  /**
   * Methods
   */
  generateHash: (password: string) => string;
}

export interface IAccountSchema extends Model<Account> {
  findApiKey: (account: string, key: string) => Promise<Account>
}

const AccountSchema = new Schema<User>({
  name: {
    type: String,
    required: true
  },
  description: String,
  apiKey: {
    type: String,
    required: true
  }
});

AccountSchema.statics.findApiKey = async function(_id: string, apiKey: string) {
  const account = await AccountModel.findById(_id, {apiKey: 1});

  if (account) {
    return compareSync(apiKey, account.apiKey);
  } else {
    throw new Error('Account not found');
  }

};

AccountSchema.methods.generateHash = function(apiKey) {
  return hashSync(apiKey, 8);
};

AccountSchema.pre<Account>('save', async function(next) {
  if (this.isModified('apiKey')) {
    this.apiKey = this.generateHash(this.apiKey);
  }

  next();
});

AccountSchema.index({name: 1}, {unique: true});
AccountSchema.index({apiKey: 1});

export const AccountModel = model<Account, IAccountSchema>('Account', AccountSchema);
