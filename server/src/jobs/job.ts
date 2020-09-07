import {CronJob} from 'cron';
import {Document, model, Model, Schema} from 'mongoose';
import {isISODate} from '../utils/is-iso-date';
import {ResponseModule} from '../responses/response';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

const jobs: {[key: string]: CronJob} = {};

export interface Job extends Document {
  name: string;
  account: Schema.Types.ObjectId | Account;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  lastRun?: number;
  runs?: number;
  nextRun?: number;
  storeBody?: boolean;
  storeHeaders?: boolean;

  /**
   * ISO date or CRON pattern
   */
  schedule: string;

  /**
   * Moment timezone, defaults to 'UTC'
   */
  timeZone: string;
  body?: any;
  headers?: any;

  /**
   * Methods
   */
  cronJob: () => CronJob;
  newRun: () => void;
}

export interface IJobSchema extends Model<Job> {
  registerAllJobs: () => Promise<void>;
}

const JobSchema = new Schema<Job>({
  name: {
    type: String,
    required: true
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  lastRun: Number,
  runs: Number,
  nextRun: Number,
  storeBody: Boolean,
  storeHeaders: Boolean,
  method: {
    type: String,
    enum: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
    default: 'GET'
  },
  schedule: {
    type: String,
  },
  timeZone: {
    type: String,
    default: 'UTC'
  },
  headers: Schema.Types.Mixed,
  body: Schema.Types.Mixed
});

JobSchema.statics.registerAllJobs = async function() {
  const jobs = await JobModel.find({});

  for (const job of jobs) {
    const jJob = job.cronJob();
    jJob.start();
  }
};

JobSchema.methods.newRun = function() {
  const controller = new AbortController();
  const to = setTimeout(() => {
    controller.abort();
  }, 1000 * 60 * 2);

  let status: number;

  const exec = async () => {
    const response = await fetch(
      this.url,
      {
        signal: controller.signal,
        method: this.method,
        ...this.method !== 'GET' && {body: this.body},
        ...this.headers && {headers: this.headers}
      }
    );

    status = response.status;

    if (status >= 200 && status <= 299) {

      this.lastRun = status;
      this.runs = (this.runs || 0) + 1;

      await this.save();

      const resp: any = {
        job: this._id,
        status,
      };

      if (this.storeHeaders) {
        resp.headers = response.headers.raw();
      }

      if (this.storeBody) {
        resp.body = await response.json();
      }

      await new ResponseModule(resp).save()
    } else {
      throw new Error('Bad request');
    }
  };

  exec()
    .catch(error => {
      if (status !== undefined) {
        this.lastRun = status;
      }

      if (error.name === 'AbortError') {
        this.lastRun = 0;
      }

      this.runs = (this.runs || 0) + 1;

      Promise.all([
        this.save(),
        new ResponseModule({
          job: this._id,
          status: this.lastRun,
          error: error.toString()
        }).save()
      ])
        .catch(e => {
          console.error('Failed to save response after bad run', e);
        });

    })
    .finally(() => {
      clearTimeout(to);
    })
};

JobSchema.methods.cronJob = function() {
  return new CronJob(
    isISODate(this.schedule) ?
      new Date(this.schedule) :
      this.schedule,
    () => {
      this.newRun();
    },
    undefined,
    undefined,
    this.timeZone
  )
};

JobSchema.pre<Job>('save', function (next) {

  if (
    this.isNew ||
    [
      'method',
      'url',
      'schedule',
      'timeZone',
      'body',
      'headers'
    ].some(it =>
      this.isModified(it)
    )
  ) {
    if (jobs[this._id]) {
      jobs[this._id].stop();
      delete jobs[this._id];
    }

    const job = this.cronJob();

    job.start();

    this.nextRun = job.nextDate().valueOf();
    jobs[this._id] = job;
  }

  next();
});

JobSchema.pre<Job>('remove', function (next) {

  if (jobs[this._id]) {
    jobs[this._id].stop();
    delete jobs[this._id];
  }

  next();
});

JobSchema.index({account: 1});
JobSchema.index({name: 1, account: 1}, {
  unique: true,
  partialFilterExpression: {
    name: {$exists: true},
    account: {$exists: true}
  }
});

export const JobModel = model<Job, IJobSchema>('Job', JobSchema);