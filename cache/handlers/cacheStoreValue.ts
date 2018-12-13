'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheStoreValuePayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheStoreValuePayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "cacheStoreObject"' });

      cache.storeValue(payload.key, payload.value)
      .then(success => {
        if (!success) {
          return(Promise.reject(new Error(
            `Failed to store value in the cache with key "${payload.key}" ` +
            `and value ${JSON.stringify(payload.value)}`
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