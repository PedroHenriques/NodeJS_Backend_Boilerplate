'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as cache from '../services/cache';
import { TEventCb } from '../../sharedLibs/types/events';
import {
  ICacheStoreValuePayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handler(
  payload: ICacheStoreValuePayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "cacheStoreObject"' });

  cache.storeValue(payload.key, payload.value)
  .then(success => {
    if (!success) {
      throw Error(
        `Failed to store value in the cache with key "${payload.key}" ` +
        `and value ${JSON.stringify(payload.value)}`
      );
    }
    if (ack) { ack(null); }
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
    if (ack) { ack(error); }
  });
}