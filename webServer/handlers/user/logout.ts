'use strict';
import { Request, Response } from 'express';
import { closeSession } from '../../utils/sessionUtils';
import * as logger from '../../../sharedLibs/services/logger';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import {
  userAccountConfigKeyGen
} from '../../../sharedLibs/utils/cacheKeyGenerator';
import {
  socketCacheGetObject
} from '../../../sharedLibs/utils/cacheEventDispatchers';
import { clearCookie } from '../../../sharedLibs/utils/cookieUtils';
import { IUserAccountConfig } from '../../interfaces/data';

export default async function handler(
  req: Request, res: Response
): Promise<Response> {
  try {
    const userAccountConfig = await socketCacheGetObject({
      socket: getSocket('cache'),
      payload: {
        key: userAccountConfigKeyGen(),
      }
    }) as IUserAccountConfig;

    await closeSession({ req });

    return(
      clearCookie({ res, name: userAccountConfig.login.cookieName })
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