'use strict';
import { connect } from 'mongodb';
import { ConsumeMessage } from 'amqplib';
import dbFactory from './services/db';
import handlerFactory from './handlers/index';
import createSocketServer from '../sharedLibs/utils/socketServer';
import * as logger from '../sharedLibs/services/logger';
import {
  connectWithRetry, parsePayload, ackMessage, nackMessage
} from '../sharedLibs/utils/queue';
import * as Events from '../sharedLibs/utils/eventTypes';
import { IHandlers } from './interfaces/handlers';
import { IMQEventMessage } from '../sharedLibs/interfaces/events';
import * as IEvents from '../sharedLibs/interfaces/dbEvents';

if (process.env.DB_CONNECT_URL !== undefined) {
  connect(process.env.DB_CONNECT_URL, { useNewUrlParser: true })
  .then(mongoClient => {
    logger.info({ message: 'Connected to MongoDB' });

    const mongoDb = mongoClient.db(process.env.MONGO_DB_NAME);
    const db = dbFactory(mongoDb);

    const handlers = handlerFactory(db);
    handleSocketServer(handlers);
    handleQueue(handlers);
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });
  });
}

function handleSocketServer(handlers: IHandlers): void {
  if (process.env.SOCKET_SERVER_PORT !== undefined) {
    const socketHandler = (socket: SocketIO.Socket) => {
      socket.on(Events.DB_INSERT_ONE, handlers.dbInsertOne);
      socket.on(Events.DB_FIND_ONE, handlers.dbFindOne);
      socket.on(Events.DB_FIND_ONE_UPDATE, handlers.dbFindOneUpdate);
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
}

function handleQueue(handlers: IHandlers): void {
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

      if (message.type === Events.DB_INSERT_ONE) {
        handlers.dbInsertOne(
          (message.payload as IEvents.IDbInsertOnePayload), cb
        );
      } else if (message.type === Events.DB_FIND_ONE_UPDATE) {
        handlers.dbFindOneUpdate(
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
}