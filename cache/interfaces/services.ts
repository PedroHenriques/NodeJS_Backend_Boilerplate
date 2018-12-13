'use strict';

export interface ICache {
  delKeys: (keys: string[]) => Promise<number>,
  keysExist: (keys: string[]) => Promise<boolean>,
  getValue: (key: string) => Promise<string|null>,
  storeValue: (key: string, value: string) => Promise<boolean>,
  setObject: (key: string, value: Object) => Promise<boolean>,
  setObjectIfNotExists: (key: string, value: Object) => Promise<boolean>,
  getObject: (key: string) => Promise<Object>,
  expireKey: (key: string, numSec: number) => Promise<boolean>,
}