'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheStoreObjectIfNotExistsPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheStoreObjectIfNotExistsPayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "cacheStoreObjectIfNotExists"' });

      cache.setObjectIfNotExists(payload.key, payload.value)
      .then(stored => {
        if (ack) { ack(null, stored); }
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