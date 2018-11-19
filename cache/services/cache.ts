'use strict';
import { promisify } from 'util';
import { createClient } from 'redis';

const redisConOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

const redisClient = createClient(redisConOptions);
const redisAsync = {
  del: promisify(redisClient.del).bind(redisClient),
  exists: promisify(redisClient.exists).bind(redisClient),
  get: promisify(redisClient.get).bind(redisClient),
  set: promisify(redisClient.set).bind(redisClient),
  setnx: promisify(redisClient.setnx).bind(redisClient),
  expire: promisify(redisClient.expire).bind(redisClient),
};

export function delKeys(keys: string[]): Promise<number> {
  return(redisAsync.del(keys));
}

export function keysExist(keys: string[]): Promise<boolean> {
  return(
    redisAsync.exists(keys)
    .then((numKeysFound: number) => keys.length === numKeysFound)
  );
}

export function getValue(key: string): Promise<string|null> {
  return(redisAsync.get(key));
}

export function storeValue(key: string, value: string): Promise<boolean> {
  return(
    redisAsync.set(key, value)
    .then((reply: string) => reply === 'OK')
  );
}

export function setObject(key: string, value: Object): Promise<boolean> {
  return(storeValue(key, JSON.stringify(value)));
}

export function setObjectIfNotExists(
    key: string, value: Object
): Promise<boolean> {
  return(redisAsync.setnx(key, JSON.stringify(value)));
}

export function getObject(key: string): Promise<Object> {
  return(
    getValue(key)
    .then(value => {
      if (value === null) { return({}); }
      return(JSON.parse(value));
    })
  );
}

export function expireKey(key: string, numSec: number): Promise<boolean> {
  return(redisAsync.expire(key, numSec));
}