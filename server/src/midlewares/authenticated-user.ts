import {NextFunction, Request, Response} from 'express';
import {verify} from 'jsonwebtoken';
import {CONFIG} from '../config';
import {UserModel} from '../users/user';

export function authenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {

  async function exec() {
    const {authorization} = req.headers;

    if (!authorization) {
      throw new Error('authorization header missing.');
    }

    const unpacked = verify(
      (authorization as string).replace('Bearer ', ''),
      CONFIG.user.secret
    ) as {_id: string};

    if (!unpacked || !unpacked._id) {
      throw new Error('Token invalid.');
    }

    const user = await UserModel.findById(unpacked._id, {_id: 1});

    if (!user) {
      throw new Error('Token invalid.');
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
