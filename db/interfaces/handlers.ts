'use strict';
import {
  IDbFindOnePayload, IDbFindOneUpdatePayload, IDbInsertOnePayload
} from '../../sharedLibs/interfaces/dbEvents';
import { TEventCb } from '../../sharedLibs/types/events';

export interface IHandlers {
  dbFindOne: (payload: IDbFindOnePayload, ack?: TEventCb) => void,
  dbFindOneUpdate: (payload: IDbFindOneUpdatePayload, ack?: TEventCb) => void,
  dbInsertOne: (payload: IDbInsertOnePayload, ack?: TEventCb) => void,
}