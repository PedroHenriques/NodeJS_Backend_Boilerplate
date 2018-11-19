'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as cache from '../services/cache';
import {
  ICacheGetValuePayload, TEventCb
} from '../../sharedLibs/interfaces/events';

export default function handler(
  payload: ICacheGetValuePayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "cacheGetValue"' });

  cache.getValue(payload.key)
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