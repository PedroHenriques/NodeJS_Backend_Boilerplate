'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheDeleteKeysPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheDeleteKeysPayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "cacheDeleteKeys"' });

      cache.delKeys(payload.keys)
      .then(numKeysDeleted => {
        if (ack) { ack(null, numKeysDeleted); }
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