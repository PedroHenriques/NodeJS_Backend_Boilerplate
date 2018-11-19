'use strict';
import * as Events from '../utils/eventTypes';
import * as IEvents from '../interfaces/events';

export function dbInsertOne(
  args: IEvents.IDbInsertOne
): Promise<string> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, data: string) => {
      if (error) { reject(error); }
      else { resolve(data); }
    };
    args.socket.emit(Events.DB_INSERT_ONE, args.payload, cb);
  }));
}

export function dbFindOne(
  args: IEvents.IDbFindOne
): Promise<any> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, data: Object) => {
      if (error) { reject(error); }
      else { resolve(data); }
    };
    args.socket.emit(Events.DB_FIND_ONE, args.payload, cb);
  }));
}

export function dbFindOneUpdate(
  args: IEvents.IDbFindOneUpdate
): Promise<any> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, data: Object) => {
      if (error) { reject(error); }
      else { resolve(data); }
    };
    args.socket.emit(Events.DB_FIND_ONE_UPDATE, args.payload, cb);
  }));
}