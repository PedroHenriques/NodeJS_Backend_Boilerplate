'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as cache from '../services/cache';
import { TEventCb } from '../../sharedLibs/types/events';
import {
  ICacheKeysExistPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handler(
  payload: ICacheKeysExistPayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "cacheKeysExist"' });

  cache.keysExist(payload.keys)
  .then(exists => {
    if (ack) { ack(null, exists); }
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
    if (ack) { ack(error); }
  });
}