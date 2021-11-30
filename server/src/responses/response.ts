import {model, Document, Schema} from 'mongoose';
import {Job} from '../jobs/job';

export interface Response extends Document {
  job: string | Job;
  account: string;
  status?: number;
  body?: any;
  headers?: {[key: string]: string};
  error?: string;
}

const ResponseSchema = new Schema<Response>({
  job: {
    type: String,
    ref: 'Job',
    required: true
  },
  status: Number,
  account: String,
  body: Schema.Types.Mixed,
  headers: Schema.Types.Mixed,
  error: String
});

ResponseSchema.index({job: 1});

export const ResponseModule = model<Response>('Response', ResponseSchema);
