import {Router} from 'express';
import {Types} from 'mongoose';
import {authenticatedAccount} from '../midlewares/authenticated-account';
import {ApiError} from '../utils/api-error';
import {reqWrapper} from '../utils/req-wrapper';
import {ResponseModule} from './response';

const router = Router();

router.use(authenticatedAccount);

router.get(
  '/:job',
  reqWrapper(async req => {
    // @ts-ignore
    const account = req['account'] || req.query.account;
    const {job} = req.params;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 10;
    const sort = {
      [(req.query.sort || '_id') as string]: req.query.sort_dir === 'asc' ? 1 : -1
    };

    const items = await ResponseModule.find(
      {
        // @ts-ignore
        account: new Types.ObjectId(account),
        // @ts-ignore
        job
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

router.delete(
  '/:id',
  reqWrapper(async req => {
    // @ts-ignore
    const account = req['account'] || req.query.account;

    const item = await ResponseModule.findOne({
      // @ts-ignore
      account: new Types.ObjectId(account),
      _id: req.params.id
    });

    if (!item) {
      throw new ApiError('Response not found.', 400);
    }

    await item.remove();
  })
);

export const responsesRouter = router;
