'use strict';
import { Request, Response } from 'express';
import * as Validator from 'validatorjs';
import { getUserByEmail } from '../../models/users';
import { startSession } from '../../utils/sessionUtils';
import * as logger from '../../../sharedLibs/services/logger';
import { setCookie } from '../../../sharedLibs/utils/cookieUtils';
import { matchHash } from '../../../sharedLibs/utils/passwordUtils';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import {
  cacheGetObject
} from '../../../sharedLibs/utils/cacheEventDispatchers';
import {
  userAccountConfigKeyGen
} from '../../../sharedLibs/utils/cacheKeyGenerator';
import { IUserAccountConfig } from '../../interfaces/data';

export default async function handler(
  req: Request, res: Response
): Promise<Response> {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const validator = new Validator(
      { email, password },
      {
        email: 'required|email',
        password: 'required|string',
      }
    );
    if (validator.fails()) {
      return(res.status(400).json({ errors: validator.errors }));
    }

    const userEntity = await getUserByEmail({ email: email });

    if (! await matchHash(password, userEntity.password)) {
      return(res.status(401).json({
        error: 'The provided credentials are not valid.',
      }));
    }

    const sessionToken = await startSession({ userEntity });

    const userAccountConfig = await cacheGetObject({
      socket: getSocket('cache'),
      payload: {
        key: userAccountConfigKeyGen(),
      }
    }) as IUserAccountConfig;

    return(
      setCookie({
        res,
        name: userAccountConfig.login.cookieName,
        value: sessionToken,
      })
      .status(200)
      .json({})
    );
  } catch (error) {
    logger.error({
      message: error.message,
      payload: error,
    });

    return(res.status(500).json({
      errors: 'Could not handle the request.',
    }));
  }
}