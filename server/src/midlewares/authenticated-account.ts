import {NextFunction, Request, Response} from 'express';
import {verify} from 'jsonwebtoken';
import {AccountModel} from '../accounts/account';
import {CONFIG} from '../config';
import {UserModel} from '../users/user';

export function authenticatedAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {

  async function exec() {
    const {authorization} = req.headers;

    if (!authorization) {
      throw new Error('authorization header missing.');
    }

    if ((authorization as string).startsWith('Bearer ')) {
      const unpacked = verify(
        (authorization as string).replace('Bearer ', ''),
        CONFIG.user.secret
      ) as {
        _id: string;
        type: string;
      };

      if (!unpacked || !unpacked._id) {
        throw new Error('Token invalid.');
      }

      const user = await UserModel.findById(unpacked._id, {_id: 1});

      if (!user) {
        throw new Error('Token invalid.');
      }
    } else {
      const account = await AccountModel.findApiKey(
        req.query.account as string,
        (authorization as string).replace('Basic ', '')
      );

      if (!account) {
        throw new Error('ApiKey invalid.')
      }

      // @ts-ignore
      res['account'] = account._id;
    }

  }

  exec()
    .then(() =>
      next()
    )
    .catch(error => {
      res
        .status(403)
        .send({
          error: error.toString()
        })
    });
}
