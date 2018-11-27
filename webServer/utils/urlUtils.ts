'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { getSocket } from '../../sharedLibs/utils/socketConnection';
import {
  socketCacheGetObject
} from '../../sharedLibs/utils/cacheEventDispatchers';
import {
  userAccountConfigKeyGen
} from '../../sharedLibs/utils/cacheKeyGenerator';
import { IUserAccountConfig } from '../interfaces/data';

export async function getDomainUrl(
  args?: { userAccountConfig: IUserAccountConfig }
): Promise<string> {
  try {
    let userAccountConfig: IUserAccountConfig;

    if (!args) {
      const socketToCache = getSocket('cache');
      if (socketToCache === null) {
        throw Error('Could not find a socket with the tag "cache"');
      }

      userAccountConfig = await socketCacheGetObject({
        socket: socketToCache,
        payload: {
          key: userAccountConfigKeyGen(),
        }
      }) as IUserAccountConfig;
    } else {
      userAccountConfig = args.userAccountConfig;
    }

    const siteUrl = userAccountConfig
      .domain[`${process.env.DEPLOY_STAGE}RootUrl`];

    if (siteUrl === undefined) {
      throw Error(
        `Could not find the "${process.env.DEPLOY_STAGE}RootUrl" property ` +
        'in the userManager.json "domain" section.'
      );
    }

    return(siteUrl);
  } catch (error) {
    logger.error({
      message: error.message,
      payload: error,
    });

    return(Promise.reject(error.message));
  }
}