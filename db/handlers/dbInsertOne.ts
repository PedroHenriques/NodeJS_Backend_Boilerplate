'use strict';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import { IDb } from '../interfaces/services';
import { IDbInsertOnePayload } from '../../sharedLibs/interfaces/dbEvents';

export default function handlerFactory(db: IDb) {
  return(
    (payload: IDbInsertOnePayload, ack?: TEventCb): void => {
      logger.debug({ message: 'Received event "dbInsertOne"' });

      db.insertOne(payload)
      .then(insertedId => {
        if (ack) { ack(null, insertedId); }
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