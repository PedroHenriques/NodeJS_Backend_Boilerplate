'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheStoreObjectPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheStoreObjectPayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "cacheStoreObject"' });

      cache.setObject(payload.key, payload.value)
      .then(success => {
        if (!success) {
          return(Promise.reject(new Error(
            `Failed to store object in the cache with key "${payload.key}" ` +
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