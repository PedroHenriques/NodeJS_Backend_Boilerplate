'use strict';
import * as logger from '../../sharedLibs/services/logger';
import {
  usersPendingActivationKeyGen, passwordsPendingResetKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import {
  mqCacheStoreObject, mqCacheExpireKey
} from '../../sharedLibs/utils/cacheEventDispatchers';
import { channel } from '../../sharedLibs/utils/queue';
import { IUsersPendingActivation } from '../interfaces/data';

export async function storePendingActivationUser(
  args: {
    email: string, token: string, expire: number, pwHash: string, name: string
  }
): Promise<void> {
  if (channel === undefined) {
    return(Promise.reject(new Error(
      'Trying to dispatch event to queue but no channel with the ' +
      'message queue is created'
    )));
  }

  const persistKey = usersPendingActivationKeyGen({ email: args.email });

  const data: IUsersPendingActivation = {
    token: args.token,
    pwHash: args.pwHash,
    name: args.name,
  };

  await mqCacheStoreObject({
    mqChannel: channel,
    payload: {
      key: persistKey,
      value: data,
    },
  });

  mqCacheExpireKey({
    mqChannel: channel,
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
  if (channel === undefined) {
    return(Promise.reject(new Error(
      'Trying to dispatch event to queue but no channel with the ' +
      'message queue is created'
    )));
  }

  const persistKey = passwordsPendingResetKeyGen({ email: args.email });

  await mqCacheStoreObject({
    mqChannel: channel,
    payload: {
      key: persistKey,
      value: { token: args.token },
    },
  });

  mqCacheExpireKey({
    mqChannel: channel,
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