'use strict';
import { IEventDispatcher } from './events';

export interface ICacheGetValue extends IEventDispatcher {
  payload: ICacheGetValuePayload,
}

export interface ICacheGetValuePayload {
  key: string,
}

export interface ICacheStoreValue extends IEventDispatcher {
  payload: ICacheStoreValuePayload,
}

export interface ICacheStoreValuePayload {
  key: string,
  value: string,
}

export interface ICacheStoreObject extends IEventDispatcher {
  payload: ICacheStoreObjectPayload,
}

export interface ICacheStoreObjectPayload {
  key: string,
  value: Object,
}

export interface ICacheExpireKey extends IEventDispatcher {
  payload: ICacheExpireKeyPayload,
}

export interface ICacheExpireKeyPayload {
  key: string,
  value: number,
}

export interface ICacheGetObject extends IEventDispatcher {
  payload: ICacheGetObjectPayload,
}

export interface ICacheGetObjectPayload {
  key: string,
}

export interface ICacheStoreObjectIfNotExists extends IEventDispatcher {
  payload: ICacheStoreObjectIfNotExistsPayload,
}

export interface ICacheStoreObjectIfNotExistsPayload {
  key: string,
  value: Object,
}

export interface ICacheDeleteKeys extends IEventDispatcher {
  payload: ICacheDeleteKeysPayload,
}

export interface ICacheDeleteKeysPayload {
  keys: string[],
}

export interface ICacheKeysExist extends IEventDispatcher {
  payload: ICacheKeysExistPayload,
}

export interface ICacheKeysExistPayload {
  keys: string[],
}