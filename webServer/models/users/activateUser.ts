'use strict';
import { getDomainUrl } from '../../utils/urlUtils';
import activationEmailBody from '../../templates/emails/accountActivation';
import * as logger from '../../../sharedLibs/services/logger';
import {
  usersPendingActivationKeyGen, userAccountConfigKeyGen,
} from '../../../sharedLibs/utils/cacheKeyGenerator';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import { channel } from '../../../sharedLibs/utils/queue';
import {
  socketCacheGetObject, mqCacheDeleteKeys
} from '../../../sharedLibs/utils/cacheEventDispatchers';
import {
  socketDbInsertOne
} from '../../../sharedLibs/utils/dbEventDispatchers';
import {
  mqMailerSendEmail
} from '../../../sharedLibs/utils/mailerEventDispatchers';
import { ValidationError } from '../../../sharedLibs/Errors/ValidationError';
import {
  IUsersPendingActivation, IUserAccountConfig
} from '../../interfaces/data';
import { IUserEntity } from '../../interfaces/dbSchema';
import { IUserEntityResponse } from '../../interfaces/data';

export default async function activateUser(
  args: { email: string, token: string }
): Promise<IUserEntityResponse> {
  const socketToCache = getSocket('cache');

  const userActivationKey = usersPendingActivationKeyGen({
    email: args.email,
  });

  const userActivationData = await socketCacheGetObject({
    socket: socketToCache,
    payload: {
      key: userActivationKey,
    }
  }) as IUsersPendingActivation;

  if (
    Object.getOwnPropertyNames(userActivationData).length === 0 ||
    userActivationData.token !== args.token
  ) {
    return(Promise.reject(
      new ValidationError('The provided email and token pair is not valid.')
    ));
  }

  const userData: IUserEntity = {
    email: args.email,
    name: userActivationData.name,
    password: userActivationData.pwHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userId = await socketDbInsertOne({
    socket: getSocket('db'),
    payload: {
      collection: 'users',
      item: userData,
    },
  });

  if (channel !== undefined) {
    mqCacheDeleteKeys({
      mqChannel: channel,
      payload: { keys: [ userActivationKey ] }
    })
    .catch(error => {
      logger.error({
        message: 'Failed to delete the user pending activation data for the ' +
          `email address ${args.email}, with message "${error.message}"`,
        payload: error,
      });
    });
  } else {
    logger.error({
      message: 'Failed to delete the user pending activation data for the ' +
        `email address ${args.email}`,
    });
  }

  (socketCacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as Promise<IUserAccountConfig>)
  .then(async userAccountConfig => {
    try {
      const loginURL = await getDomainUrl({ userAccountConfig }) +
        userAccountConfig.accountActivation.loginRelUrl;

      if (channel !== undefined) {
        await mqMailerSendEmail({
          mqChannel: channel,
          payload: {
            ...userAccountConfig.accountActivation.email,
            to: args.email,
            body: {
              ...activationEmailBody({ loginURL }),
            },
          },
        });
      } else {
        throw new Error(
          'Trying to queue message, but no channel to the message queue exists'
        );
      }
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });
    }
  });

  return({
    id: userId,
    email: userData.email,
    name: userData.name,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
  });
}