'use strict';
import { send } from './handlers/mailer';
import createSocketServer from '../sharedLibs/utils/socketServer';
import * as Events from '../sharedLibs/utils/eventTypes';

const socketHandler = (socket: SocketIO.Socket) => {
  socket.on(Events.MAILER_SEND_EMAIL, send);
};

const socketServer = createSocketServer(
  socketHandler,
  parseInt(process.env.SOCKET_SERVER_PORT || '10000', 10),
  {
    path: '/',
    cookie: false,
  }
);