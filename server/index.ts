import {json} from 'body-parser';
import compression from 'compression';
import express from 'express';
import cors from 'cors';
import {connect} from 'mongoose';
import {accountsRouter} from './src/accounts/accounts.router';
import {CONFIG} from './src/config';
import {jobsRouter} from './src/jobs/jobs.router';
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
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    process.exit();
  });

const app = express();

app.set('port', CONFIG.port);
app.use(compression());
app.use(json());
app.use(cors());


app.use('/users', usersRouter);
app.use('/accounts', accountsRouter);
app.use('/jobs', jobsRouter);

app.listen(app.get('port'), () => {
  console.log(
    `App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`
  );
});
