'use strict';
import { Channel } from 'amqplib';

export type TSocketTags = 'cache' | 'mailer' | 'db';
export type TQueueNames = TSocketTags;

export type TSocket = SocketIOClient.Socket;
export type TChannel = Channel;

export type TEventCb = (error: Error | null, value?: any) => void;
export type TPayload = Object | string | number;