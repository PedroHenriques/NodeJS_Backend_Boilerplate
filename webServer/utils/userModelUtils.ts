'use strict';
import { getSocket } from '../../sharedLibs/utils/socketConnection';
import * as logger from '../../sharedLibs/services/logger';
import {
  usersPendingActivationKeyGen, passwordsPendingResetKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import {
  cacheStoreObject, cacheExpireKey
} from '../../sharedLibs/utils/cacheEventDispatchers';
import { IUsersPendingActivation } from '../interfaces/data';

export async function storePendingActivationUser(
  args: {
    email: string, token: string, expire: number, pwHash: string, name: string
  }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const persistKey = usersPendingActivationKeyGen({ email: args.email });

  const data: IUsersPendingActivation = {
    token: args.token,
    pwHash: args.pwHash,
    name: args.name,
  };

  await cacheStoreObject({
    socket: socketToCache,
    payload: {
      key: persistKey,
      value: data,
    },
  });

  cacheExpireKey({
    socket: socketToCache,
    payload: {
      key: persistKey,
      value: args.expire,
    },
  })
  .catch(error => {
    logger.error({
      message: 'Could not set the expiration timer on the activation token ' +
        `for the email "${args.email}"`,
      payload: error,
    });
  });
}

export async function storePendingPasswordReset(
  args: { email: string, token: string, expire: number }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const persistKey = passwordsPendingResetKeyGen({ email: args.email });

  await cacheStoreObject({
    socket: socketToCache,
    payload: {
      key: persistKey,
      value: { token: args.token },
    },
  });

  cacheExpireKey({
    socket: socketToCache,
    payload: {
      key: persistKey,
      value: args.expire,
    },
  })
  .catch(error => {
    logger.error({
      message: 'Could not set the expiration timer on the pw reset token ' +
        `for the email "${args.email}"`,
      payload: error,
    });
  });
}