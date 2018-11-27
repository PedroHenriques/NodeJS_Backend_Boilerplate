'use strict';
import * as logger from '../../sharedLibs/services/logger';
import * as db from '../services/db';
import { TEventCb } from '../../sharedLibs/types/events';
import { IDbFindOneUpdatePayload } from '../../sharedLibs/interfaces/dbEvents';

export default function handler(
  payload: IDbFindOneUpdatePayload,
  ack?: TEventCb
): void {
  logger.debug({ message: 'Received event "dbFindOneUpdate"' });

  db.findOneUpdate(payload)
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