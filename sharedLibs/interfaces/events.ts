'use strict';

export type TEventCb = (error: Error | null, value?: any) => void;

export interface IEventDispatcher {
  socket: SocketIOClient.Socket,
  payload?: Object | string | number,
}

export * from './cacheEvents';
export * from './mailerEvents';
export * from './dbEvents';