'use strict';
import createSocketServer from '../sharedLibs/utils/socketServer';
import dbInsertOne from './handlers/dbInsertOne';
import dbFindOne from './handlers/dbFindOne';
import dbFindOneUpdate from './handlers/dbFindOneUpdate';
import * as Events from '../sharedLibs/utils/eventTypes';

const socketHandler = (socket: SocketIO.Socket) => {
  socket.on(Events.DB_INSERT_ONE, dbInsertOne);
  socket.on(Events.DB_FIND_ONE, dbFindOne);
  socket.on(Events.DB_FIND_ONE_UPDATE, dbFindOneUpdate);
};

const socketServer = createSocketServer(
  socketHandler,
  parseInt(process.env.SOCKET_SERVER_PORT || '10000', 10),
  {
    path: '/',
    cookie: false,
  }
);