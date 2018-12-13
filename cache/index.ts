'use strict';
import { createClient } from 'redis';
import { ConsumeMessage } from 'amqplib';
import cacheFactory from './services/cache';
import handlerFactory from './handlers/index';
import createSocketServer from '../sharedLibs/utils/socketServer';
import * as Events from '../sharedLibs/utils/eventTypes';
import {
  connectWithRetry, parsePayload, ackMessage, nackMessage
} from '../sharedLibs/utils/queue';
import { IMQEventMessage } from '../sharedLibs/interfaces/events';
import * as IEvents from '../sharedLibs/interfaces/cacheEvents';

const redisConOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};
const redisClient = createClient(redisConOptions);

const cache = cacheFactory(redisClient);
const handlers = handlerFactory(cache);

if (process.env.SOCKET_SERVER_PORT !== undefined) {
  const socketHandler = (socket: SocketIO.Socket) => {
    socket.on(Events.CACHE_GET_VALUE, handlers.cacheGetValueHandler);
    socket.on(Events.CACHE_STORE_VALUE, handlers.cacheStoreValueHandler);
    socket.on(Events.CACHE_GET_OBJECT, handlers.cacheGetObjectHandler);
    socket.on(Events.CACHE_STORE_OBJECT, handlers.cacheStoreObjectHandler);
    socket.on(
      Events.CACHE_STORE_OBJECT_IF_NX,
      handlers.cacheStoreObjectIfNotExistsHandler
    );
    socket.on(Events.CACHE_EXPIRE_KEY, handlers.cacheExpireKeyHandler);
    socket.on(Events.CACHE_DELETE_KEYS, handlers.cacheDeleteKeysHandler);
    socket.on(Events.CACHE_KEYS_EXIST, handlers.cacheKeysExistHandler);
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

    const cb = (error: Error | null) => {
      if (error) {
        nackMessage({ message: rawMessage, requeue: message.requeue });
      } else {
        ackMessage({ message: rawMessage });
      }
    };

    if (message.type === Events.CACHE_STORE_VALUE) {
      handlers.cacheStoreValueHandler(
        (message.payload as IEvents.ICacheStoreValuePayload), cb
      );
    } else if (message.type === Events.CACHE_STORE_OBJECT) {
      handlers.cacheStoreObjectHandler(
        (message.payload as IEvents.ICacheStoreObjectPayload), cb
      );
    } else if (message.type === Events.CACHE_STORE_OBJECT_IF_NX) {
      handlers.cacheStoreObjectIfNotExistsHandler(
        (message.payload as IEvents.ICacheStoreObjectIfNotExistsPayload), cb
      );
    } else if (message.type === Events.CACHE_EXPIRE_KEY) {
      handlers.cacheExpireKeyHandler(
        (message.payload as IEvents.ICacheExpireKeyPayload), cb
      );
    } else if (message.type === Events.CACHE_DELETE_KEYS) {
      handlers.cacheDeleteKeysHandler(
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