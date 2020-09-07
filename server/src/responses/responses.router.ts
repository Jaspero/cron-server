import {Router} from 'express';
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
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 10;

    const response = {
      hasMore: true,
      items: []
    };

    const items = await ResponseModule.find(
      {
        account,
        // @ts-ignore
        job
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

router.delete(
  '/:id',
  reqWrapper(async req => {
    // @ts-ignore
    const account = req['account'] || req.query.account;

    const item = await ResponseModule.findOne({
      account,
      _id: req.params.id
    });

    if (!item) {
      throw new ApiError('Response not found.', 400);
    }

    await item.remove();
  })
);

export const responsesRouter = router;