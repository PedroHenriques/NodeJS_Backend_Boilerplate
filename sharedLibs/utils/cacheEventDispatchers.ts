'use strict';
import { socketEventDispatcher, mqEventDispatcher } from './eventDispatchers';
import * as Events from '../utils/eventTypes';
import { TQueueNames } from '../types/events';
import * as IEvents from '../interfaces/cacheEvents';

const queueName: TQueueNames = 'cache';

export function socketCacheGetValue(
  args: IEvents.ISocketCacheGetValue
): Promise<string | null> {
  return(socketEventDispatcher<string | null>({
    ...args,
    type: Events.CACHE_GET_VALUE,
  }));
}

export function socketCacheStoreValue(
  args: IEvents.ISocketCacheStoreValue
): Promise<void> {
  return(socketEventDispatcher<void>({
    ...args,
    type: Events.CACHE_STORE_VALUE,
  }));
}
export function mqCacheStoreValue(
  args: IEvents.IMQCacheStoreValue
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.CACHE_STORE_VALUE,
      requeue: true,
      payload: args.payload,
    }
  }));
}

export function socketCacheGetObject(
  args: IEvents.ISocketCacheGetObject
): Promise<Object> {
  return(socketEventDispatcher<Object>({
    ...args,
    type: Events.CACHE_GET_OBJECT,
  }));
}

export function socketCacheStoreObject(
  args: IEvents.ISocketCacheStoreObject
): Promise<boolean> {
  return(socketEventDispatcher<boolean>({
    ...args,
    type: Events.CACHE_STORE_OBJECT,
  }));
}
export function mqCacheStoreObject(
  args: IEvents.IMQCacheStoreObject
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.CACHE_STORE_OBJECT,
      requeue: true,
      payload: args.payload,
    }
  }));
}

export function socketCacheStoreObjectIfNotExists(
  args: IEvents.ISocketCacheStoreObjectIfNotExists
): Promise<boolean> {
  return(socketEventDispatcher<boolean>({
    ...args,
    type: Events.CACHE_STORE_OBJECT_IF_NX,
  }));
}
export function mqCacheStoreObjectIfNotExists(
  args: IEvents.IMQCacheStoreObjectIfNotExists
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.CACHE_STORE_OBJECT_IF_NX,
      requeue: true,
      payload: args.payload,
    }
  }));
}

export function socketCacheExpireKey(
  args: IEvents.ISocketCacheExpireKey
): Promise<void> {
  return(socketEventDispatcher<void>({
    ...args,
    type: Events.CACHE_EXPIRE_KEY,
  }));
}
export function mqCacheExpireKey(
  args: IEvents.IMQCacheExpireKey
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.CACHE_EXPIRE_KEY,
      requeue: true,
      payload: args.payload,
    }
  }));
}

export function socketCacheDeleteKeys(
  args: IEvents.ISocketCacheDeleteKeys
): Promise<void> {
  return(
    socketEventDispatcher<number>({
      ...args,
      type: Events.CACHE_DELETE_KEYS,
    })
    .then(numKeysDeleted => {
      const numKeysToDelete = args.payload.keys.length;
      if (numKeysDeleted !== numKeysToDelete) {
        return(Promise.reject(
          `Deleted "${numKeysDeleted}"/${numKeysToDelete} keys`
        ));
      }
      return(Promise.resolve());
    })
  );
}
export function mqCacheDeleteKeys(
  args: IEvents.IMQCacheDeleteKeys
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.CACHE_DELETE_KEYS,
      requeue: true,
      payload: args.payload,
    }
  }));
}

export function socketCacheKeysExist(
  args: IEvents.ISocketCacheKeysExist
): Promise<boolean> {
  return(socketEventDispatcher<boolean>({
    ...args,
    type: Events.CACHE_KEYS_EXIST,
  }));
}