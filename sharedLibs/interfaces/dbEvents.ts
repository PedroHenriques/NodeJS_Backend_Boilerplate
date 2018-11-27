'use strict';
import { TSocket, TChannel } from '../types/events';

export interface IDbInsertOnePayload {
  collection: string,
  item: Object,
}
export interface ISocketDbInsertOne {
  socket: TSocket,
  payload: IDbInsertOnePayload,
}
export interface IMQDbInsertOne {
  mqChannel: TChannel,
  payload: IDbInsertOnePayload,
}

export interface IDbFindOnePayload {
  collection: string,
  query: Object,
}
export interface ISocketDbFindOne {
  socket: TSocket,
  payload: IDbFindOnePayload,
}

export interface IDbFindOneUpdatePayload {
  collection: string,
  filter: Object,
  update: Object,
}
export interface ISocketDbFindOneUpdate {
  socket: TSocket,
  payload: IDbFindOneUpdatePayload,
}
export interface IMQDbFindOneUpdate {
  mqChannel: TChannel,
  payload: IDbFindOneUpdatePayload,
}