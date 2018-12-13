'use strict';
import { join, resolve } from 'path';
import configLoaderFactory from './services/configLoader';
import { connectSocket } from '../sharedLibs/utils/socketConnection';
import { connectWithRetry } from '../sharedLibs/utils/queue';
import { userAccountConfigKeyGen } from '../sharedLibs/utils/cacheKeyGenerator';

if (
  process.env.CACHE_HOST !== undefined &&
  process.env.CACHE_PORT !== undefined
) {
  connectSocket(
    process.env.CACHE_HOST, parseInt(process.env.CACHE_PORT, 10), 'cache'
  );
}

if (process.env.QUEUE_CON_URL !== undefined) {
  connectWithRetry({ connectionURL: process.env.QUEUE_CON_URL });
}

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