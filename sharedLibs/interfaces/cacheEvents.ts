'use strict';
import { TSocket, TChannel } from '../types/events';

export interface ICacheGetValuePayload {
  key: string,
}
export interface ISocketCacheGetValue {
  socket: TSocket,
  payload: ICacheGetValuePayload,
}

export interface ICacheStoreValuePayload {
  key: string,
  value: string,
}
export interface ISocketCacheStoreValue {
  socket: TSocket,
  payload: ICacheStoreValuePayload,
}
export interface IMQCacheStoreValue {
  mqChannel: TChannel,
  payload: ICacheStoreValuePayload,
}

export interface ICacheGetObjectPayload {
  key: string,
}
export interface ISocketCacheGetObject {
  socket: TSocket,
  payload: ICacheGetObjectPayload,
}

export interface ICacheStoreObjectPayload {
  key: string,
  value: Object,
}
export interface ISocketCacheStoreObject {
  socket: TSocket,
  payload: ICacheStoreObjectPayload,
}
export interface IMQCacheStoreObject {
  mqChannel: TChannel,
  payload: ICacheStoreObjectPayload,
}

export interface ICacheStoreObjectIfNotExistsPayload {
  key: string,
  value: Object,
}
export interface ISocketCacheStoreObjectIfNotExists {
  socket: TSocket,
  payload: ICacheStoreObjectIfNotExistsPayload,
}
export interface IMQCacheStoreObjectIfNotExists {
  mqChannel: TChannel,
  payload: ICacheStoreObjectIfNotExistsPayload,
}

export interface ICacheExpireKeyPayload {
  key: string,
  value: number,
}
export interface ISocketCacheExpireKey {
  socket: TSocket,
  payload: ICacheExpireKeyPayload,
}
export interface IMQCacheExpireKey {
  mqChannel: TChannel,
  payload: ICacheExpireKeyPayload,
}

export interface ICacheDeleteKeysPayload {
  keys: string[],
}
export interface ISocketCacheDeleteKeys {
  socket: TSocket,
  payload: ICacheDeleteKeysPayload,
}
export interface IMQCacheDeleteKeys {
  mqChannel: TChannel,
  payload: ICacheDeleteKeysPayload,
}

export interface ICacheKeysExistPayload {
  keys: string[],
}
export interface ISocketCacheKeysExist {
  socket: TSocket,
  payload: ICacheKeysExistPayload,
}