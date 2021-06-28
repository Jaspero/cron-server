import {json} from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import {Router} from 'express';
import {connect} from 'mongoose';
import {accountsRouter} from './src/accounts/accounts.router';
import {CONFIG} from './src/config';
import {Config} from './src/interfaces/config.interface';
import {JobModel} from './src/jobs/job';
import {jobsRouter} from './src/jobs/jobs.router';
import {responsesRouter} from './src/responses/responses.router';
import {UserModel} from './src/users/user';
import {usersRouter} from './src/users/users.router';

export function cronServer(config: Config) {

  CONFIG.user = config.user;
  CONFIG.runnerId = config.runnerId;

  connect(
    config.mongoUrl,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }
  )
    .catch(err => {
      console.error(`MongoDB connection error. Please make sure MongoDB is running.`, err);
      process.exit();
    });

  JobModel.registerAllJobs()
    .catch(err => {
      console.error(`Failed to register jobs on startup.`, err);
      process.exit();
    });

  UserModel.createInitialUsers(config.user.initialAccount, config.user.initialAccountPassword)
    .then(data => {
      if (data) {
        console.log('Initial user created', JSON.stringify(data, null, 4))
      }
    })
    .catch(err => {
      console.error('Failed to create initial user.', err);
      process.exit()
    });

  const router = Router();

  router.use(compression());
  router.use(json());
  router.use(cors());

  router.use('/users', usersRouter);
  router.use('/accounts', accountsRouter);
  router.use('/jobs', jobsRouter);
  router.use('/responses', responsesRouter);

  router.get('/healthz', (req, res) =>
    res.sendStatus(200)
  );

  router.get('/**', (req, res) =>
    res
      .status(400)
      .json({
        error: 'Unknown request.'
      })
  );

  return router;
}
