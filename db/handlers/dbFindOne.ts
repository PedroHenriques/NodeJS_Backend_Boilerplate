'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { IDb } from '../interfaces/services';
import { IDbFindOnePayload } from '../../sharedLibs/interfaces/dbEvents';

export default function handlerFactory(db: IDb) {
  return(
    (payload: IDbFindOnePayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "dbFindOne"' });

      db.findOne(payload)
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