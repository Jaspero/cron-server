import {join} from 'path';
import {json} from 'body-parser';
import compression from 'compression';
import express from 'express';
import cors from 'cors';
import {connect} from 'mongoose';
import {accountsRouter} from './src/accounts/accounts.router';
import {CONFIG} from './src/config';
import {JobModel} from './src/jobs/job';
import {jobsRouter} from './src/jobs/jobs.router';
import {responsesRouter} from './src/responses/responses.router';
import {UserModel} from './src/users/user';
import {usersRouter} from './src/users/users.router';

connect(
  CONFIG.mongo.url,
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

UserModel.createInitialUsers()
  .then(data => {
    if (data) {
      console.log('Initial user created', JSON.stringify(data, null, 4))
    }
  })
  .catch(err => {
    console.error('Failed to create initial user.', err);
    process.exit()
  });

const app = express();

app.set('port', CONFIG.port);
app.use(compression());
app.use(json());
app.use(cors());

app.use('/api/users', usersRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/responses', responsesRouter);

app.get('/api/healthz', (req, res) =>
  res.sendStatus(200)
);

app.get('/api/**', (req, res) =>
  res
    .status(400)
    .json({
      error: 'Unknown request.'
    })
);

app.use(
  express.static(
    join(__dirname, '../static')
  )
);
app.get('**', (req, res) =>
  res.sendFile(
    join(__dirname, '../static/index.html')
  )
);

app.listen(app.get('port'), () => {
  console.log(
    `App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`
  );
});
