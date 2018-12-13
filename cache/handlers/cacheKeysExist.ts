'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheKeysExistPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheKeysExistPayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "cacheKeysExist"' });

      cache.keysExist(payload.keys)
      .then(exists => {
        if (ack) { ack(null, exists); }
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