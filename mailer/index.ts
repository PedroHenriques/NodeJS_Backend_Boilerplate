'use strict';
import { ConsumeMessage } from 'amqplib';
import { send } from './handlers/mailer';
import createSocketServer from '../sharedLibs/utils/socketServer';
import {
  connectWithRetry, parsePayload, ackMessage, nackMessage
} from '../sharedLibs/utils/queue';
import * as Events from '../sharedLibs/utils/eventTypes';
import { IMQEventMessage } from '../sharedLibs/interfaces/events';
import * as IEvents from '../sharedLibs/interfaces/mailerEvents';

if (process.env.SOCKET_SERVER_PORT !== undefined) {
  const socketHandler = (socket: SocketIO.Socket) => {
    socket.on(Events.MAILER_SEND_EMAIL, send);
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

    if (message.type === Events.MAILER_SEND_EMAIL) {
      send((message.payload as IEvents.IMailerSendEmailPayload), cb);
    }
  };

  connectWithRetry({
    connectionURL: process.env.QUEUE_CON_URL,
    consumeQueues: [
      { queueName: 'mailer', handler: mqHandler },
    ],
  });
}