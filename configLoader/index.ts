'use strict';
import { join, resolve } from 'path';
import configLoaderFactory from './services/configLoader';
import { connectSocket } from '../sharedLibs/utils/socketConnection';
import { userAccountConfigKeyGen } from '../sharedLibs/utils/cacheKeyGenerator';

if (
  process.env.CACHE_HOST === undefined ||
  process.env.CACHE_PORT === undefined
) {
  throw Error('Missing "cache" container host and/or port env variables');
}

connectSocket(
  process.env.CACHE_HOST, parseInt(process.env.CACHE_PORT, 10), 'cache'
);

const configLoader = configLoaderFactory({
  filesToWatch: {
    userAccountConfig: {
      path: resolve(join('.', 'config', 'userAccountConfig.json')),
      lastModified: -1,
      persistKey: userAccountConfigKeyGen(),
    },
  },
});

configLoader.startCheckUp();