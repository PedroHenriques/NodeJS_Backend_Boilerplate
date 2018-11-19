'use strict';
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

const socketServer = createSocketServer(
  socketHandler,
  parseInt(process.env.SOCKET_SERVER_PORT || '10000', 10),
  {
    path: '/',
    cookie: false,
  }
);