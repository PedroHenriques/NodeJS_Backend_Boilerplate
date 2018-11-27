'use strict';
import { getDomainUrl } from '../../utils/urlUtils';
import { storePendingPasswordReset } from '../../utils/userModelUtils';
import lostPWStartEmailBody from '../../templates/emails/lostPasswordStart';
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
import { IUserAccountConfig } from '../../interfaces/data';

export default async function startPwRecovery(
  args: { email: string }
): Promise<void> {
  (socketCacheGetObject({
    socket: getSocket('cache'),
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as Promise<IUserAccountConfig>)
  .then(async userAccountConfig => {
    const token = generateToken();

    await storePendingPasswordReset({
      email: args.email,
      token,
      expire: userAccountConfig.lostPassword.tokenDurationInSeconds,
    });

    const pwResetURL = await getDomainUrl() +
      userAccountConfig.lostPassword.pwResetRelUrl +
      `?email=${encodeURI(args.email)}&token=${encodeURI(token)}`;

    if (channel !== undefined) {
      await mqMailerSendEmail({
        mqChannel: channel,
        payload: {
          ...userAccountConfig.lostPassword.email,
          to: args.email,
          body: {
            ...lostPWStartEmailBody({ pwResetURL }),
          },
        },
      });
    } else {
      throw new Error(
        'Trying to queue message, but no channel to the message queue exists'
      );
    }
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });
}