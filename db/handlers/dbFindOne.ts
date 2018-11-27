'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as db from '../services/db';
import { TEventCb } from '../../sharedLibs/types/events';
import { IDbFindOnePayload } from '../../sharedLibs/interfaces/dbEvents';

export default function handler(
  payload: IDbFindOnePayload,
  ack?: TEventCb
): void {
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