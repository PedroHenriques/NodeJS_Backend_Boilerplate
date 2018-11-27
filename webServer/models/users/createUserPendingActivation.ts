'use strict';
import { getDomainUrl } from '../../utils/urlUtils';
import { storePendingActivationUser } from '../../utils/userModelUtils';
import registrationEmailBody from '../../templates/emails/accountRegistration';
import * as logger from '../../../sharedLibs/services/logger';
import {
  userAccountConfigKeyGen
} from '../../../sharedLibs/utils/cacheKeyGenerator';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import { channel } from '../../../sharedLibs/utils/queue';
import {
  socketCacheGetObject
} from '../../../sharedLibs/utils/cacheEventDispatchers';
import {
  mqMailerSendEmail
} from '../../../sharedLibs/utils/mailerEventDispatchers';
import { generateToken } from '../../../sharedLibs/utils/tokenUtils';
import { createHash } from '../../../sharedLibs/utils/passwordUtils';
import { IUserAccountConfig } from '../../interfaces/data';

export default async function createUserPendingActivation(
  args: { email: string, password: string, name: string }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const userAccountConfig = await socketCacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as IUserAccountConfig;

  const token = generateToken();
  const pwHash = await createHash(args.password);
  await storePendingActivationUser({
    email: args.email,
    token,
    pwHash,
    name: args.name,
    expire: userAccountConfig.accountRegistration.tokenDurationInSeconds,
  });

  getDomainUrl()
  .then(domainUrl => {
    const activationURL = domainUrl +
      userAccountConfig.accountRegistration.activationRelUrl +
      `?email=${encodeURI(args.email)}&token=${encodeURI(token)}`;

    if (channel !== undefined) {
      return(mqMailerSendEmail({
        mqChannel: channel,
        payload: {
          ...userAccountConfig.accountRegistration.email,
          to: args.email,
          body: {
            ...registrationEmailBody({ activationURL }),
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