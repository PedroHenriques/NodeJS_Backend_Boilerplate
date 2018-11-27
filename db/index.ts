'use strict';
import { ConsumeMessage } from 'amqplib';
import createSocketServer from '../sharedLibs/utils/socketServer';
import dbInsertOne from './handlers/dbInsertOne';
import dbFindOne from './handlers/dbFindOne';
import dbFindOneUpdate from './handlers/dbFindOneUpdate';
import {
  connectWithRetry, parsePayload, ackMessage, nackMessage
} from '../sharedLibs/utils/queue';
import * as Events from '../sharedLibs/utils/eventTypes';
import { IMQEventMessage } from '../sharedLibs/interfaces/events';
import * as IEvents from '../sharedLibs/interfaces/dbEvents';

if (process.env.SOCKET_SERVER_PORT !== undefined) {
  const socketHandler = (socket: SocketIO.Socket) => {
    socket.on(Events.DB_INSERT_ONE, dbInsertOne);
    socket.on(Events.DB_FIND_ONE, dbFindOne);
    socket.on(Events.DB_FIND_ONE_UPDATE, dbFindOneUpdate);
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

    if (message.type === Events.DB_INSERT_ONE) {
      dbInsertOne(
        (message.payload as IEvents.IDbInsertOnePayload), cb
      );
    } else if (message.type === Events.DB_FIND_ONE_UPDATE) {
      dbFindOneUpdate(
        (message.payload as IEvents.IDbFindOneUpdatePayload), cb
      );
    }
  };

  connectWithRetry({
    connectionURL: process.env.QUEUE_CON_URL,
    consumeQueues: [
      { queueName: 'db', handler: mqHandler },
    ],
  });
}