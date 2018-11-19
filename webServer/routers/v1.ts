'use strict';
import { Router } from 'express';
import * as cookieParser from 'cookie-parser';
import session from '../middleware/session';
import requiredAuthStatus from '../middleware/requiredAuthStatus';
import activateUserHandler from '../handlers/user/activate';
import createUserHandler from '../handlers/user/create';
import loginUserHandler from '../handlers/user/login';
import logoutUserHandler from '../handlers/user/logout';
import lostPasswordHandler from '../handlers/user/lostPassword';
import passwordResetHandler from '../handlers/user/passwordReset';

const router = Router();

// Router Middleware
router.use([ cookieParser(), session ]);

router.post(
  '/users',
  [ requiredAuthStatus('notLoggedIn'), createUserHandler ]
);
router.post(
  '/login',
  [ requiredAuthStatus('notLoggedIn'), loginUserHandler ]
);
router.get(
  '/logout',
  [ requiredAuthStatus('loggedIn'), logoutUserHandler ]
);
router.post(
  '/users/activate',
  [ requiredAuthStatus('notLoggedIn'), activateUserHandler ]
);
router.post(
  '/users/lostPw',
  [ requiredAuthStatus('notLoggedIn'), lostPasswordHandler ]
);
router.post(
  '/users/pwReset',
  [ requiredAuthStatus('notLoggedIn'), passwordResetHandler ]
);

export default router;