import {Router} from 'express';
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
    const account = req['account'] || req.query.account;
    const {name} = req.params;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 10;

    const items = await JobModel.find(
      {
        account,
        ...name && {name: {$regex: name, $options: 'i'}},
      },
      {},
      {
        skip: page * size,
        limit: page + 1,
        sort: {
          _id: -1
        }
      }
    );

    return {
      hasMore: items.length === (page + 1),
      items: items.slice(0, -1)
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
      const nJob = await new JobModel({
        ...req.body,
        name,
        account
      }).save();

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

    const job = await JobModel.findOne( {name, account});

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

    const job = await JobModel.findOne({name, account});

    if (!job) {
      throw new ApiError('Job not found.', 400);
    }

    job.newRun();
  })
);

export const jobsRouter = router;
