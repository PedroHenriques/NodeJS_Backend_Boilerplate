'use strict';
import { getDomainUrl } from '../utils/urlUtils';
import {
  storePendingActivationUser, storePendingPasswordReset
} from '../utils/userModelUtils';
import activationEmailBody from '../templates/emails/accountActivation';
import registrationEmailBody from '../templates/emails/accountRegistration';
import lostPWStartEmailBody from '../templates/emails/lostPasswordStart';
import lostPWEndEmailBody from '../templates/emails/lostPasswordEnd';
import * as logger from '../../sharedLibs/services/logger';
import {
  usersPendingActivationKeyGen, userAccountConfigKeyGen,
  passwordsPendingResetKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import { getSocket } from '../../sharedLibs/utils/socketConnection';
import {
  cacheGetObject, cacheDeleteKeys
} from '../../sharedLibs/utils/cacheEventDispatchers';
import {
  dbInsertOne, dbFindOne, dbFindOneUpdate
} from '../../sharedLibs/utils/dbEventDispatchers';
import { mailerSendEmail } from '../../sharedLibs/utils/mailerEventDispatchers';
import { ValidationError } from '../../sharedLibs/Errors/ValidationError';
import { generateToken } from '../../sharedLibs/utils/tokenUtils';
import { createHash } from '../../sharedLibs/utils/passwordUtils';
import {
  IUsersPendingActivation, IUserAccountConfig, IPasswordsPendingReset
} from '../interfaces/data';
import { IUserEntity, IUserEntityUpdate } from '../interfaces/dbSchema';

export async function activateUser(
  args: { email: string, token: string }
): Promise<IUserEntity> {
  const socketToCache = getSocket('cache');

  const userActivationKey = usersPendingActivationKeyGen({
    email: args.email,
  });

  const userActivationData = await cacheGetObject({
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

  const userEntity = await createUser(userData);

  cacheDeleteKeys({
    socket: socketToCache,
    payload: { keys: [ userActivationKey ] }
  })
  .catch(error => {
    logger.error({
      message: 'Failed to delete the user pending activation data for the ' +
        `email address ${args.email}, with message "${error.message}"`,
      payload: error,
    });
  });

  (cacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as Promise<IUserAccountConfig>)
  .then(async userAccountConfig => {
    try {
      const socketToMailer = getSocket('mailer');
      const loginURL = await getDomainUrl({ userAccountConfig }) +
        userAccountConfig.accountActivation.loginRelUrl;

      await mailerSendEmail({
        socket: socketToMailer,
        payload: {
          ...userAccountConfig.accountActivation.email,
          to: args.email,
          body: {
            ...activationEmailBody({ loginURL }),
          },
        },
      });
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });
    }
  });

  return(userEntity);
}

export async function createUserPendingActivation(
  args: { email: string, password: string, name: string }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const userAccountConfig = await cacheGetObject({
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
    const socketToMailer = getSocket('mailer');
    const activationURL = domainUrl +
      userAccountConfig.accountRegistration.activationRelUrl +
      `?email=${encodeURI(args.email)}&token=${encodeURI(token)}`;

    return(mailerSendEmail({
      socket: socketToMailer,
      payload: {
        ...userAccountConfig.accountRegistration.email,
        to: args.email,
        body: {
          ...registrationEmailBody({ activationURL }),
        },
      },
    }));
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });
}

export function userExists(args: { email: string }): Promise<boolean> {
  return(
    dbFindOne({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        query: { email: args.email },
      },
    })
  );
}

export function getUserByEmail(args: { email: string }): Promise<IUserEntity> {
  return(
    dbFindOne({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        query: { email: args.email },
      },
    })
    .then(data => {
      if (Object.getOwnPropertyNames(data).length === 0) {
        return(Promise.reject('Could not find the user.'));
      }
      return(Promise.resolve(data));
    })
  );
}

export function createUser(args: IUserEntity): Promise<IUserEntity> {
  return(
    dbInsertOne({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        item: args,
      },
    })
    .then(insertedId => {
      return(Promise.resolve({ id: insertedId, ...args }));
    })
  );
}

export function updateUser(
  args: { email: string, data: IUserEntityUpdate }
): Promise<IUserEntity> {
  return(dbFindOneUpdate({
    socket: getSocket('db'),
    payload: {
      collection: 'users',
      filter: { email: args.email },
      update: { $set: { ...args.data } },
    }
  }));
}

export async function startPwRecovery(args: { email: string }): Promise<void> {
  (cacheGetObject({
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

    await mailerSendEmail({
      socket: getSocket('mailer'),
      payload: {
        ...userAccountConfig.lostPassword.email,
        to: args.email,
        body: {
          ...lostPWStartEmailBody({ pwResetURL }),
        },
      },
    });
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });
}

export async function endPwRecovery(
  args: { email: string, token: string, newPassword: string }
): Promise<void> {
  const socketToCache = getSocket('cache');

  const pwResetKey = passwordsPendingResetKeyGen({ email: args.email });

  const pwResetData = await cacheGetObject({
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

  cacheDeleteKeys({
    socket: socketToCache,
    payload: { keys: [ pwResetKey ] }
  })
  .catch(error => {
    logger.error({
      message: 'Failed to delete the password pending reset data for the ' +
        `email address ${args.email}, with message "${error.message}"`,
      payload: error,
    });
  });

  (cacheGetObject({
    socket: socketToCache,
    payload: {
      key: userAccountConfigKeyGen(),
    }
  }) as Promise<IUserAccountConfig>)
  .then(userAccountConfig => {
    return(mailerSendEmail({
      socket: getSocket('mailer'),
      payload: {
        ...userAccountConfig.resetPassword.email,
        to: args.email,
        body: {
          ...lostPWEndEmailBody(),
        },
      },
    }));
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });
}