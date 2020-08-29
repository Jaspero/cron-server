import {Router} from 'express';
import {authenticatedUser} from '../midlewares/authenticated-user';
import {reqWrapper} from '../utils/req-wrapper';
import {AccountModel} from './account';

const router = Router();

router.use(authenticatedUser);


router.get(
  '/',
  reqWrapper(async (req, res) => {
    return AccountModel.find(
      {},
      {
        name: 1
      }
    )
  })
);

router.put(
  '/:id',
  reqWrapper(async (req, res) => {
    await AccountModel.updateOne({_id: req.params.id}, req.body);
  })
);

router.delete(
  '/:id',
  reqWrapper(async (req, res) => {
    await AccountModel.deleteOne({_id: req.params.id});
  })
);


export const accountsRouter = router;
