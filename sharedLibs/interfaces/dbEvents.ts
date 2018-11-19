'use strict';
import { IEventDispatcher } from './events';

export interface IDbInsertOne extends IEventDispatcher {
  payload: IDbInsertOnePayload,
}

export interface IDbInsertOnePayload {
  collection: string,
  item: Object,
}

export interface IDbFindOne extends IEventDispatcher {
  payload: IDbFindOnePayload,
}

export interface IDbFindOnePayload {
  collection: string,
  query: Object,
}

export interface IDbFindOneUpdate extends IEventDispatcher {
  payload: IDbFindOneUpdatePayload,
}

export interface IDbFindOneUpdatePayload {
  collection: string,
  filter: Object,
  update: Object,
}