'use strict';
import cacheGetValueFactory from './cacheGetValue';
import cacheStoreValueFactory from './cacheStoreValue';
import cacheGetObjectFactory from './cacheGetObject';
import cacheStoreObjectFactory from './cacheStoreObject';
import cacheStoreObjectIfNotExistsFactory from './cacheStoreObjectIfNotExists';
import cacheExpireKeyFactory from './cacheExpireKey';
import cacheDeleteKeysFactory from './cacheDeleteKeys';
import cacheKeysExistFactory from './cacheKeysExist';
import { ICache } from '../interfaces/services';

export default function handlerFactory(cache: ICache) {
  return({
    cacheGetValueHandler: cacheGetValueFactory(cache),
    cacheStoreValueHandler: cacheStoreValueFactory(cache),
    cacheGetObjectHandler: cacheGetObjectFactory(cache),
    cacheStoreObjectHandler: cacheStoreObjectFactory(cache),
    cacheStoreObjectIfNotExistsHandler:
      cacheStoreObjectIfNotExistsFactory(cache),
    cacheExpireKeyHandler: cacheExpireKeyFactory(cache),
    cacheDeleteKeysHandler: cacheDeleteKeysFactory(cache),
    cacheKeysExistHandler: cacheKeysExistFactory(cache),
  });
}