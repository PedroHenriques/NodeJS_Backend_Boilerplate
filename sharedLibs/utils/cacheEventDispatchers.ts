'use strict';
import * as Events from '../utils/eventTypes';
import * as IEvents from '../interfaces/events';

export function cacheGetObject(
  args: IEvents.ICacheGetObject
): Promise<Object> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, data: Object) => {
      if (error) { reject(error); }
      else { resolve(data); }
    };
    args.socket.emit(Events.CACHE_GET_OBJECT, args.payload, cb);
  }));
}

export function cacheStoreObject(
  args: IEvents.ICacheStoreObject
): Promise<void> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null) => {
      if (error) { reject(error); }
      else { resolve(); }
    };
    args.socket.emit(Events.CACHE_STORE_OBJECT, args.payload, cb);
  }));
}

export function cacheStoreObjectIfNotExists(
  args: IEvents.ICacheStoreObjectIfNotExists
): Promise<boolean> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, stored: boolean) => {
      if (error) { reject(error); }
      else { resolve(stored); }
    };
    args.socket.emit(Events.CACHE_STORE_OBJECT_IF_NX, args.payload, cb);
  }));
}

export function cacheExpireKey(args: IEvents.ICacheExpireKey): Promise<void> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null) => {
      if (error) { reject(error); }
      else { resolve(); }
    };
    args.socket.emit(Events.CACHE_EXPIRE_KEY, args.payload, cb);
  }));
}

export function cacheDeleteKeys(args: IEvents.ICacheDeleteKeys): Promise<void> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (
      error: Error | null, numKeysDeleted: number
    ) => {
      if (error) { return(reject(error)); }
      const numKeysToDelete = args.payload.keys.length;
      if (numKeysDeleted !== numKeysToDelete) {
        return(reject(`Deleted "${numKeysDeleted}"/${numKeysToDelete} keys`));
      }
      resolve();
    };
    args.socket.emit(Events.CACHE_DELETE_KEYS, args.payload, cb);
  }));
}

export function cacheKeysExist(
  args: IEvents.ICacheKeysExist
): Promise<boolean> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, exists: boolean) => {
      if (error) { reject(error); }
      else { resolve(exists); }
    };
    args.socket.emit(Events.CACHE_KEYS_EXIST, args.payload, cb);
  }));
}