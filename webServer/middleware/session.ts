'use strict';
import { Request, Response, NextFunction } from 'express';
import { closeSession } from '../utils/sessionUtils';
import { getSocket } from '../../sharedLibs/utils/socketConnection';
import {
  socketCacheGetObject
} from '../../sharedLibs/utils/cacheEventDispatchers';
import {
  userAccountConfigKeyGen, sessionTokensKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import * as logger from '../../sharedLibs/services/logger';
import getUserById from '../models/users/getUserById';
import { getCookie, clearCookie } from '../../sharedLibs/utils/cookieUtils';
import { IUserAccountConfig, ISessionData } from '../interfaces/data';

export default async function session(
  req: Request, res: Response, next: NextFunction
): Promise<void | Response> {
  logger.debug({ message: 'Starting session handling' });

  const socketToCache = getSocket('cache');

  const userAccountConfig = await socketCacheGetObject({
    socket: socketToCache,
    payload: { key: userAccountConfigKeyGen() }
  }) as IUserAccountConfig;

  const token = getCookie({ req, name: userAccountConfig.login.cookieName });

  if (token === null) {
    logger.debug({
      message: 'No Authentication cookie present in the request'
    });
  } else {
    const sessionTokenCacheKey = sessionTokensKeyGen({ token });
    const sessionData = await socketCacheGetObject({
      socket: socketToCache,
      payload: { key: sessionTokenCacheKey }
    }) as ISessionData;

    if (Object.getOwnPropertyNames(sessionData).length > 0) {
      const userData = await getUserById({ id: sessionData.userID });

      if (
        Object.getOwnPropertyNames(userData).length === 0 ||
        userData.updatedAt > sessionData.createdAt
      ) {
        logger.debug({
          message: 'Expiring session due to user not existing or data modified'
        });

        await closeSession({ req });

        return(
          clearCookie({ res, name: userAccountConfig.login.cookieName })
          .status(401)
          .json({ error: 'Invalid credentials' })
        );
      } else {
        req.session = { userID: sessionData.userID };

        logger.debug({ message: 'Added session data to Request' });
      }
    } else {
      logger.debug({
        message: 'Authentication failed due to incorrect credentials'
      });

      return(
        clearCookie({ res, name: userAccountConfig.login.cookieName })
        .status(401)
        .json({ error: 'Invalid credentials' })
      );
    }
  }

  next();
}