'use strict';
import { Request } from 'express';
import * as logger from '../../sharedLibs/services/logger';
import { getSocket } from '../../sharedLibs/utils/socketConnection';
import { generateToken } from '../../sharedLibs/utils/tokenUtils';
import {
  sessionTokensKeyGen, userAccountConfigKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import {
  mqCacheStoreObjectIfNotExists, socketCacheGetObject, mqCacheExpireKey,
  mqCacheDeleteKeys
} from '../../sharedLibs/utils/cacheEventDispatchers';
import { getCookie } from '../../sharedLibs/utils/cookieUtils';
import { channel } from '../../sharedLibs/utils/queue';
import { ISessionData, IUserAccountConfig } from '../interfaces/data';
import { IUserEntity } from '../interfaces/dbSchema';

export async function startSession(
  args: { userEntity: IUserEntity }
): Promise<string> {
  if (args.userEntity.id === undefined) {
    return(Promise.reject(new Error(
      'Trying to start a session, but no user ID was provided in the ' +
      `user entity ${JSON.stringify(args.userEntity)}`
    )));
  }
  if (channel === undefined) {
    return(Promise.reject(new Error(
      'Trying to dispatch event to queue but no channel with the ' +
      'message queue is created'
    )));
  }

  const socketToCache = getSocket('cache');

  logger.debug({ message: 'Generating session token' });

  const sessionToken = generateToken();
  const sessionTokenPersistKey = sessionTokensKeyGen({ token: sessionToken });

  logger.debug({ message: 'Storing session token in cache' });

  const sessionData: ISessionData = {
    userID: `${args.userEntity.id}`,
    createdAt: new Date(),
  };

  await mqCacheStoreObjectIfNotExists({
    mqChannel: channel,
    payload: {
      key: sessionTokenPersistKey,
      value: sessionData,
    }
  });

  const userAccountConfig = await socketCacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as IUserAccountConfig;

  logger.debug({ message: 'Setting expire to session token' });

  mqCacheExpireKey({
    mqChannel: channel,
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

  const userAccountConfig = await socketCacheGetObject({
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

  if (channel !== undefined) {
    mqCacheDeleteKeys({
      mqChannel: channel,
      payload: { keys: [ sessionTokenCacheKey ] }
    })
    .catch(error => {
      logger.error({
        message: `Failed to delete the session token "${token}", with ` +
          `message "${error.message}"`,
        payload: error,
      });
    });
  } else {
    logger.error({
      message: `Failed to delete the session token "${token}"`,
    });
  }
}