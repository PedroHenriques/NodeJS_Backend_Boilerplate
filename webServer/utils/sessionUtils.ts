'use strict';
import { Request } from 'express';
import * as logger from '../../sharedLibs/services/logger';
import { getSocket } from '../../sharedLibs/utils/socketConnection';
import { generateToken } from '../../sharedLibs/utils/tokenUtils';
import {
  sessionTokensKeyGen, userAccountConfigKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import {
  cacheStoreObjectIfNotExists, cacheGetObject, cacheExpireKey, cacheDeleteKeys
} from '../../sharedLibs/utils/cacheEventDispatchers';
import { getCookie } from '../../sharedLibs/utils/cookieUtils';
import { ISessionData, IUserAccountConfig } from '../interfaces/data';
import { IUserEntity } from '../interfaces/dbSchema';

export async function startSession(
  args: { userEntity: IUserEntity }
): Promise<string> {
  const socketToCache = getSocket('cache');

  logger.debug({ message: 'Generating session token' });

  const sessionToken = generateToken();
  const sessionTokenPersistKey = sessionTokensKeyGen({ token: sessionToken });

  logger.debug({ message: 'Storing session token in cache' });

  const sessionData: ISessionData = {
    userEmail: `${args.userEntity.email}`,
    createdAt: new Date(),
  };

  if (! await cacheStoreObjectIfNotExists({
    socket: socketToCache,
    payload: {
      key: sessionTokenPersistKey,
      value: sessionData,
    }
  })) {
    return(Promise.reject(Error(
      'Failed to store the session token for the email ' +
      `"${args.userEntity.email}"`
    )));
  }

  const userAccountConfig = await cacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as IUserAccountConfig;

  logger.debug({ message: 'Setting expire to session token' });

  cacheExpireKey({
    socket: socketToCache,
    payload: {
      key: sessionTokenPersistKey,
      value: userAccountConfig.login.sessionDurationInSeconds
    },
  })
  .then(() => {
    logger.debug({ message: 'Session token is set to expire' });
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });

  return(sessionToken);
}

export async function closeSession(
  args: { req: Request }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const userAccountConfig = await cacheGetObject({
    socket: socketToCache,
    payload: { key: userAccountConfigKeyGen() }
  }) as IUserAccountConfig;

  const token = getCookie({
    req: args.req,
    name: userAccountConfig.login.cookieName
  });
  if (token === null) {
    return(Promise.reject(Error(
      'Could not find the session token in the request cookies'
    )));
  }

  const sessionTokenCacheKey = sessionTokensKeyGen({ token });

  cacheDeleteKeys({
    socket: socketToCache,
    payload: { keys: [ sessionTokenCacheKey ] }
  })
  .catch(error => {
    logger.error({
      message: `Failed to delete the session token "${token}", with ` +
        `message "${error.message}"`,
      payload: error,
    });
  });
}