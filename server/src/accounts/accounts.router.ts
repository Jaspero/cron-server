import {Router} from 'express';
import {authenticatedUser} from '../midlewares/authenticated-user';
import {ApiError} from '../utils/api-error';
import {reqWrapper} from '../utils/req-wrapper';
import {AccountModel} from './account';

const router = Router();

router.use(authenticatedUser);

router.get(
  '/',
  reqWrapper(async () => {
    return AccountModel.find(
      {},
      {
        name: 1
      }
    )
  })
);

router.post(
  '/',
  reqWrapper(async req => {
    const {_id} = await new AccountModel(req.body).save();
    return {_id};
  })
);

router.get(
  '/:id',
  reqWrapper(async req => {
    const account = await AccountModel.findById(req.params.id);

    if (!account) {
      throw new ApiError('Account not found.', 400);
    }

    return account;
  })
);

router.put(
  '/:id',
  reqWrapper(async (req, res) => {

    const account = await AccountModel.findById(req.params.id);

    if (!account) {
      throw new ApiError('Account not found.', 400);
    }

    for (const key in req.body) {
      // @ts-ignore
      account[key] = req.body[key];
    }

    await account.save();
  })
);

router.delete(
  '/:id',
  reqWrapper(async (req, res) => {

    const account = await AccountModel.findById(req.params.id);

    if (!account) {
      throw new ApiError('Account not found.', 400);
    }

    await account.remove();
  })
);


export const accountsRouter = router;
