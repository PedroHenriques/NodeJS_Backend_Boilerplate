'use strict';
import { preparePayload } from './queue';
import { TEventCb } from '../types/events';
import {
  ISocketEventDispatcher, IMQEventDispatcher
} from '../interfaces/events';

export function socketEventDispatcher<T>(
  args: ISocketEventDispatcher
): Promise<T> {
  return(new Promise((resolve, reject) => {
    const cb: TEventCb = (error: Error | null, data: T) => {
      if (error) { reject(error); }
      else { resolve(data); }
    };
    args.socket.emit(args.type, args.payload, cb);
  }));
}

export function mqEventDispatcher(args: IMQEventDispatcher): Promise<void> {
  return(new Promise((resolve, reject) => {
    const queued = args.mqChannel.sendToQueue(
      args.queueName,
      preparePayload({ data: JSON.stringify(args.data) }),
      { persistent: args.persistent }
    );
    if (queued) {
      resolve();
    } else {
      reject(new Error(
        `Failed to queue the event ${args.data.type} with ` +
        `payload ${args.data.payload}`
      ));
    }
  }));
}