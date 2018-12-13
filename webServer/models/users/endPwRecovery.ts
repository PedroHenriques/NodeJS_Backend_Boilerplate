'use strict';
import updateUser from './updateUser';
import lostPWEndEmailBody from '../../templates/emails/lostPasswordEnd';
import * as logger from '../../../sharedLibs/services/logger';
import {
  userAccountConfigKeyGen, passwordsPendingResetKeyGen
} from '../../../sharedLibs/utils/cacheKeyGenerator';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import { channel } from '../../../sharedLibs/utils/queue';
import {
  socketCacheGetObject, mqCacheDeleteKeys
} from '../../../sharedLibs/utils/cacheEventDispatchers';
import {
  mqMailerSendEmail
} from '../../../sharedLibs/utils/mailerEventDispatchers';
import { ValidationError } from '../../../sharedLibs/Errors/ValidationError';
import { createHash } from '../../../sharedLibs/utils/passwordUtils';
import {
  IUserAccountConfig, IPasswordsPendingReset
} from '../../interfaces/data';

export default async function endPwRecovery(
  args: { email: string, token: string, newPassword: string }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const pwResetKey = passwordsPendingResetKeyGen({ email: args.email });

  const pwResetData = await socketCacheGetObject({
    socket: socketToCache,
    payload: {
      key: pwResetKey,
    }
  }) as IPasswordsPendingReset;

  if (
    Object.getOwnPropertyNames(pwResetData).length === 0 ||
    pwResetData.token !== args.token
  ) {
    return(Promise.reject(new ValidationError(
      'The provided email and token pair is not valid.'
    )));
  }

  await updateUser({
    email: args.email,
    data: {
      password: await createHash(args.newPassword),
      updatedAt: new Date(),
    }
  });

  if (channel !== undefined) {
    mqCacheDeleteKeys({
      mqChannel: channel,
      payload: { keys: [ pwResetKey ] }
    })
    .catch(error => {
      logger.error({
        message: 'Failed to delete the password pending reset data for the ' +
          `email address ${args.email}, with message "${error.message}"`,
        payload: error,
      });
    });
  } else {
    logger.error({
      message: 'Failed to delete the password pending reset data for the ' +
        `email address ${args.email}`,
    });
  }

  (socketCacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as Promise<IUserAccountConfig>)
  .then(userAccountConfig => {
    if (channel !== undefined) {
      return(mqMailerSendEmail({
        mqChannel: channel,
        payload: {
          ...userAccountConfig.resetPassword.email,
          to: args.email,
          body: {
            ...lostPWEndEmailBody(),
          },
        },
      }));
    } else {
      return(Promise.reject(new Error(
        'Trying to queue message, but no channel to the message queue exists'
      )));
    }
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });
}