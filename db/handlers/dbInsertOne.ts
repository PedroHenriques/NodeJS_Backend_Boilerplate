'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as db from '../services/db';
import { TEventCb } from '../../sharedLibs/types/events';
import { IDbInsertOnePayload } from '../../sharedLibs/interfaces/dbEvents';

export default function handler(
  payload: IDbInsertOnePayload,
  ack?: TEventCb
): void {
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