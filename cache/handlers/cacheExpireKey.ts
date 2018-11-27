'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as cache from '../services/cache';
import { TEventCb } from '../../sharedLibs/types/events';
import {
  ICacheExpireKeyPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handler(
  payload: ICacheExpireKeyPayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "cacheExpireKey"' });

  cache.expireKey(payload.key, payload.value)
  .then(success => {
    if (!success) {
      throw Error(
        `Failed to set expiration in the cache for the key "${payload.key}" ` +
        `and value ${payload.value}`
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