'use strict';
import { ConsumeMessage } from 'amqplib';
import cacheGetValueHandler from './handlers/cacheGetValue';
import cacheStoreValueHandler from './handlers/cacheStoreValue';
import cacheGetObjectHandler from './handlers/cacheGetObject';
import cacheStoreObjectHandler from './handlers/cacheStoreObject';
import cacheStoreObjectIfNotExistsHandler from
  './handlers/cacheStoreObjectIfNotExists';
import cacheExpireKeyHandler from './handlers/cacheExpireKey';
import cacheDeleteKeysHandler from './handlers/cacheDeleteKeys';
import cacheKeysExistHandler from './handlers/cacheKeysExist';
import createSocketServer from '../sharedLibs/utils/socketServer';
import * as Events from '../sharedLibs/utils/eventTypes';
import {
  connectWithRetry, parsePayload, ackMessage, nackMessage
} from '../sharedLibs/utils/queue';
import { IMQEventMessage } from '../sharedLibs/interfaces/events';
import * as IEvents from '../sharedLibs/interfaces/cacheEvents';

if (process.env.SOCKET_SERVER_PORT !== undefined) {
  const socketHandler = (socket: SocketIO.Socket) => {
    socket.on(Events.CACHE_GET_VALUE, cacheGetValueHandler);
    socket.on(Events.CACHE_STORE_VALUE, cacheStoreValueHandler);
    socket.on(Events.CACHE_GET_OBJECT, cacheGetObjectHandler);
    socket.on(Events.CACHE_STORE_OBJECT, cacheStoreObjectHandler);
    socket.on(
      Events.CACHE_STORE_OBJECT_IF_NX,
      cacheStoreObjectIfNotExistsHandler
    );
    socket.on(Events.CACHE_EXPIRE_KEY, cacheExpireKeyHandler);
    socket.on(Events.CACHE_DELETE_KEYS, cacheDeleteKeysHandler);
    socket.on(Events.CACHE_KEYS_EXIST, cacheKeysExistHandler);
  };

  createSocketServer(
    socketHandler,
    parseInt(process.env.SOCKET_SERVER_PORT, 10),
    {
      path: '/',
      cookie: false,
    }
  );
}

if (process.env.QUEUE_CON_URL !== undefined) {
  const mqHandler = (rawMessage: ConsumeMessage | null) => {
    if (rawMessage === null) { return; }

    const message = JSON.parse(
      parsePayload({ data: rawMessage.content })
    ) as IMQEventMessage;
    if (typeof message.payload !== 'object') { return; }

    const cb = (error: Error | null) => {
      if (error) {
        nackMessage({ message: rawMessage, requeue: message.requeue });
      } else {
        ackMessage({ message: rawMessage });
      }
    };

    if (message.type === Events.CACHE_STORE_VALUE) {
      cacheStoreValueHandler(
        (message.payload as IEvents.ICacheStoreValuePayload), cb
      );
    } else if (message.type === Events.CACHE_STORE_OBJECT) {
      cacheStoreObjectHandler(
        (message.payload as IEvents.ICacheStoreObjectPayload), cb
      );
    } else if (message.type === Events.CACHE_STORE_OBJECT_IF_NX) {
      cacheStoreObjectIfNotExistsHandler(
        (message.payload as IEvents.ICacheStoreObjectIfNotExistsPayload), cb
      );
    } else if (message.type === Events.CACHE_EXPIRE_KEY) {
      cacheExpireKeyHandler(
        (message.payload as IEvents.ICacheExpireKeyPayload), cb
      );
    } else if (message.type === Events.CACHE_DELETE_KEYS) {
      cacheDeleteKeysHandler(
        (message.payload as IEvents.ICacheDeleteKeysPayload), cb
      );
    }
  };

  connectWithRetry({
    connectionURL: process.env.QUEUE_CON_URL,
    consumeQueues: [
      { queueName: 'cache', handler: mqHandler },
    ],
  });
}