import { Router, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { CONFIG } from '../config';
import { authenticatedUser } from '../midlewares/authenticated-user';
import { ApiError } from '../utils/api-error';
import { reqWrapper } from '../utils/req-wrapper';
import { UserModel } from './user';
import { sendPasswordResetEmail } from '../midlewares/mailer';

const router = Router();

router.post(
  '/signup',
  reqWrapper(async (req, res) => {
    const {
      email,
      password
    } = req.body;

    const user = await UserModel.findOne({email}, {password: 1});

    if (user) {
      throw new ApiError('User already exists', 400);
    }

    const newUser = new UserModel({
      email,
      password
    });

    await newUser.save();

    return {
      token: sign(
        {_id: newUser._id, type: 'user'},
        CONFIG.user.secret,
        {
          expiresIn: '1d'
        }
      ),
      email: email
    }
  })
);

router.post(
  '/login',
  reqWrapper(async (req, res) => {
    const {
      email,
      password
    } = req.body;

    const user = await UserModel.findOne({email}, {password: 1});

    if (!user || !user.validatePassword(password)) {
      throw new ApiError('Invalid email and password combination', 403);
    }

    const userString = JSON.stringify(user);
    res.setHeader('Set-Cookie', userString);

    return {
      token: sign(
        {_id: user._id, type: 'user'},
        CONFIG.user.secret,
        {
          expiresIn: '1d'
        }
      ),
      email: email
    }
  })
);

router.post (
  '/verify',
  reqWrapper(async (req, res) => {
    const token = req.body.token;

    try {
      verify(token, CONFIG.user.secret);

      return true;
    } catch (e) {
      // @ts-ignore
      if (e.name === 'TokenExpiredError') {
        throw new ApiError('Token expired', 403);
      }

      throw new ApiError('Invalid token', 403);
    }
  }));

router.post(
  '/reset-password',
  reqWrapper(async (req, res) => {
    try {
      const { email } = req.body;

      const user = await UserModel.findOne({ email });

      if (!user) {
        return {
          successMessage: 'Reset link sent',
          message: 'Reset link sent'
        };
      }

      const hash = user.generatePasswordResetHash();
      await user.save();

      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?hash=${hash}`;

      // Send the reset link via email
      await sendPasswordResetEmail(email, resetLink);

      return {
        successMessage: 'Reset link sent',
        message: 'Reset link sent'
      };
    } catch (e) {
      console.log(e);
      throw new ApiError('Internal Server Error', 500);
    }
  })
);


router.get('/reset-password', async (req, res) => {
  try {
    const { hash } = req.query;

    if (typeof hash !== 'string') {
      return res.status(400).json({
        message: 'Invalid hash',
      });
    }

    const user = await UserModel.findOne({ passwordResetHash: hash });

    if (user) {
      res.redirect(`http://localhost:3000/login?hash=${hash}`);
    } else {
      res.status(400).json({
        message: 'Invalid hash',
      });
    }
  } catch (e) {
    console.log('Error in reset-password route:', e);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});




router.post(
  '/update-password',
  reqWrapper(async (req, res) => {
    try {
      const { hash, newPassword } = req.body;

      const user = await UserModel.findOne({ passwordResetHash: hash });

      if (!user) {
        return {
          message: 'Invalid or expired reset hash'
        };
      }

      user.password = newPassword;
      user.passwordResetHash = null;
      await user.save();

      return {
        message: 'Password updated successfully'
      };
    } catch (e) {
      console.log(e);
      return {
        message: 'Internal Server Error'
      };
    }
  })
);




router.get(
  '/',
  authenticatedUser,
  reqWrapper(async (req, res) => {
    return UserModel.find(
      {},
      {
        email: 1
      }
    )
  })
);

router.post(
  '/',
  authenticatedUser,
  reqWrapper(async req => {
    const {_id} = await new UserModel(req.body).save();
    return {_id};
  })
);

router.put(
  '/:id',
  authenticatedUser,
  reqWrapper(async req => {

    const user = await UserModel.findById(req.params.id);

    if (!user) {
      throw new ApiError('User not found.', 400);
    }

    for (const key in req.body) {
      // @ts-ignore
      user[key] = req.body[key];
    }

    await user.save();
  })
);

router.delete(
  '/:id',
  authenticatedUser,
  reqWrapper(async req => {

    const user = await UserModel.findById(req.params.id);

    if (!user) {
      throw new ApiError('User not found.', 400);
    }

    await user.remove();
  })
);

export const usersRouter = router;
