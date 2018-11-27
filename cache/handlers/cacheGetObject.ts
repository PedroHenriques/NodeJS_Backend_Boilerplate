'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as cache from '../services/cache';
import { TEventCb } from '../../sharedLibs/types/events';
import {
  ICacheGetObjectPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handler(
  payload: ICacheGetObjectPayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "cacheGetObject"' });

  cache.getObject(payload.key)
  .then(data => {
    if (ack) { ack(null, data); }
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
    if (ack) { ack(error); }
  });
}