'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { ICache } from '../interfaces/services';
import {
  ICacheGetObjectPayload
} from '../../sharedLibs/interfaces/cacheEvents';

export default function handlerFactory(cache: ICache) {
  return(
    (payload: ICacheGetObjectPayload, ack?: TEventCb): void => {
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
  );
}