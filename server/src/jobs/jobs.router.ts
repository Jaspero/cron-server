import {Router} from 'express';
import {Types} from 'mongoose';
import {authenticatedAccount} from '../midlewares/authenticated-account';
import {ApiError} from '../utils/api-error';
import {reqWrapper} from '../utils/req-wrapper';
import {JobModel} from './job';

const router = Router();

router.use(authenticatedAccount);

router.get(
  '/',
  reqWrapper(async req => {

    // @ts-ignore
    const account: string = req['account'] || req.query.account;
    const {name} = req.query;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 10;
    const sort = {
      [(req.query.sort || '_id') as string]: req.query.sort_dir === 'asc' ? 1 : -1
    };

    const items = await JobModel.find(
      // @ts-ignore
      {
        account: new Types.ObjectId(account),
        ...name && {name: {$regex: name, $options: 'i'}},
      },
      {},
      {
        skip: page * size,
        limit: size + 1,
        sort
      }
    );

    return {
      hasMore: items.length === (size + 1),
      items: items.slice(0, size)
    }
  })
);

router.post(
  '/:name',
  reqWrapper(async req => {

    // @ts-ignore
    const account = req['account'] || req.query.account;
    const name = req.params.name as string;

    const job = await JobModel.findOne({name, account});

    if (job) {

      job.name = name;

      for (const key in req.body) {
        // @ts-ignore
        job[key] = req.body[key];
      }

      await job.save();
    } else {
      const nJob = await JobModel.create({
        ...req.body,
        name,
        account
      });

      return {
        _id: nJob._id
      };
    }
  })
);

router.delete(
  '/:name',
  reqWrapper(async req => {

    // @ts-ignore
    const account = req['account'] || req.query.account;
    const name = req.params.name as string;

    const job = await JobModel.findOne( {
      name,
      // @ts-ignore
      account: new Types.ObjectId(account)
    });

    if (!job) {
      throw new ApiError('Job not found.', 400);
    }

    await job.remove();
  })
);

router.get(
  '/:name/run',
  reqWrapper(async req => {

    // @ts-ignore
    const account = req['account'] || req.query.account;
    const name = req.params.name as string;

    const job = await JobModel.findOne({
      name,
      // @ts-ignore
      account: new Types.ObjectId(account)
    });

    if (!job) {
      throw new ApiError('Job not found.', 400);
    }

    job.newRun();
  })
);

export const jobsRouter = router;
