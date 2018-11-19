'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as cache from '../services/cache';
import {
  ICacheStoreObjectPayload, TEventCb
} from '../../sharedLibs/interfaces/events';

export default function handler(
  payload: ICacheStoreObjectPayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "cacheStoreObject"' });

  cache.setObject(payload.key, payload.value)
  .then(success => {
    if (!success) {
      throw Error(
        `Failed to store object in the cache with key "${payload.key}" ` +
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