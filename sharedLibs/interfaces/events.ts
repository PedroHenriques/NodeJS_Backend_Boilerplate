'use strict';
import { TSocket, TChannel, TQueueNames, TPayload } from '../types/events';

export interface ISocketEventDispatcher {
  socket: TSocket,
  type: string,
  payload?: TPayload,
}

export interface IMQEventDispatcher {
  mqChannel: TChannel,
  persistent: boolean,
  queueName: TQueueNames,
  data: IMQEventMessage,
}

export interface IMQEventMessage {
  type: string,
  requeue: boolean,
  payload?: TPayload,
}