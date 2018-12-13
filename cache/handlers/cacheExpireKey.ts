'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheExpireKeyPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheExpireKeyPayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "cacheExpireKey"' });

      cache.expireKey(payload.key, payload.value)
      .then(success => {
        if (!success) {
          return(Promise.reject(new Error(
            `Failed to set expiration in the cache key "${payload.key}" ` +
            `and value "${payload.value}"`
          )));
        }
        if (ack) { ack(null); }
        return(Promise.resolve());
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
        if (ack) { ack(error); }
      });
    }
  );
}