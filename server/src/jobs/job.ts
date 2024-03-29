import {CronJob} from 'cron';
import {Document, model, Model, Schema} from 'mongoose';
import {CONFIG} from '../config';
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
  complete?: boolean;
  runnerId?: string;

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
  complete: Boolean,
  runnerId: String,
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
  const jobs = await JobModel.find({
    complete: {$ne: true},
    runnerId: CONFIG.runnerId
  }, {}, {sort: {nextRun: 1}});

  const rescheduleJob = [];
  for (const job of jobs) {
    try {
      const jJob = job.cronJob();
      jJob.start();
    } catch (e) {
      if (CONFIG.startupStrategy) {
        rescheduleJob.push(job._id)
      } else {
        console.log('e', e);
        console.error(job._id, e);
      }
    }
  }

  if (CONFIG.startupStrategy) {
    let currentDate = Date.now();
    const timeDif = ((CONFIG.startupStrategy.upperLimit - CONFIG.startupStrategy.lowerLimit) * 60000) / rescheduleJob.length;
    currentDate += CONFIG.startupStrategy.lowerLimit
    for (const jobId of rescheduleJob) {
      try {
        const job = jobs.find(x => x._id.toString() === jobId)
        currentDate += timeDif;
        if (job) {
          job.nextRun = currentDate;
          job.schedule = new Date(currentDate).toISOString();
          await job.save()
          const jJob = job.cronJob();
          jJob.start();
        }
      } catch (e) {
        console.error(jobId, e);
      }
    }

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
        ...(this.headers || CONFIG.apiKey) && {
          headers: {
            ...(this.headers || {}),
            ...CONFIG.apiKey && {
              authorization: 'Basic ' + CONFIG.apiKey
            }
          }
        }
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
        account: this.account.toString()
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

      if (isISODate(this.schedule)) {
        this.complete = true;
      }

      Promise.all([
        this.save(),
        new ResponseModule({
          job: this._id,
          status: this.lastRun,
          account: this.account.toString(),
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

  [
    'body',
    'headers'
  ].forEach(key => {
    // @ts-ignore
    const current = this[key] as any;

    let value;

    if (typeof current !== 'string') {
      try {
        // @ts-ignore
        value = JSON.stringify(this[key]);
      } catch (e) {}

      if (value) {
        // @ts-ignore
        this[key] = value;
      } else {
        // @ts-ignore
        delete this[key];
      }
    }
  });

  if (this.isNew && CONFIG.runnerId) {
    this.runnerId = CONFIG.runnerId;
  }

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

    const _id = this._id.toString();

    if (jobs[_id]) {
      jobs[_id].stop();
      delete jobs[_id];
    }

    const job = this.cronJob();

    job.start();

    this.nextRun = job.nextDate().valueOf();
    jobs[_id] = job;
  }

  next();
});

JobSchema.pre<Job>('remove', function (next) {

  const _id = this._id.toString();

  if (jobs[_id]) {
    jobs[_id].stop();
    delete jobs[_id];
  }

  next();
});

JobSchema.index({account: 1});
JobSchema.index(
  {name: 1, account: 1},
  {
    unique: true,
    partialFilterExpression: {
      name: {$exists: true},
      account: {$exists: true}
    }
  }
);
JobSchema.index(
  {complete: 1},
  {
    partialFilterExpression: {
      complete: {$exists: true}
    }
  }
);
JobSchema.index(
  {complete: 1, runnerId: 1},
  {
    partialFilterExpression: {
      complete: {$exists: true},
      runnerId: {$exists: true}
    }
  }
);

export const JobModel = model<Job, IJobSchema>('Job', JobSchema);
