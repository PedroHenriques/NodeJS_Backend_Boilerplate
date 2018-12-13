'use strict';
import { promisify } from 'util';
import { RedisClient } from 'redis';
import { ICache } from '../interfaces/services';

export default function cacheFactory(redisClient: RedisClient): ICache {
  const redisAsync = {
    del: promisify(redisClient.del).bind(redisClient),
    exists: promisify(redisClient.exists).bind(redisClient),
    get: promisify(redisClient.get).bind(redisClient),
    set: promisify(redisClient.set).bind(redisClient),
    setnx: promisify(redisClient.setnx).bind(redisClient),
    expire: promisify(redisClient.expire).bind(redisClient),
  };
  return({
    delKeys: function fn(keys: string[]): Promise<number> {
      return(redisAsync.del(keys));
    },

    keysExist: function fn(keys: string[]): Promise<boolean> {
      return(
        redisAsync.exists(keys)
        .then((numKeysFound: number) => keys.length === numKeysFound)
      );
    },

    getValue: function fn(key: string): Promise<string|null> {
      return(redisAsync.get(key));
    },

    storeValue: function fn(key: string, value: string): Promise<boolean> {
      return(
        redisAsync.set(key, value)
        .then((reply: string) => reply === 'OK')
      );
    },

    setObject: function fn(key: string, value: Object): Promise<boolean> {
      return(this.storeValue(key, JSON.stringify(value)));
    },

    setObjectIfNotExists: function fn(
      key: string, value: Object
    ): Promise<boolean> {
      return(redisAsync.setnx(key, JSON.stringify(value)));
    },

    getObject: function fn(key: string): Promise<Object> {
      return(
        this.getValue(key)
        .then(value => {
          if (value === null) { return({}); }
          return(JSON.parse(value));
        })
      );
    },

    expireKey: function fn(key: string, numSec: number): Promise<boolean> {
      return(redisAsync.expire(key, numSec));
    },
  });
}