'use strict';
import {
  connect as queueConnect, Connection, Channel, ConsumeMessage
} from 'amqplib';
import * as Bluebird from 'bluebird';
import * as logger from '../services/logger';
import { IConsumeArgs } from '../interfaces/queue';

let connection: Connection | null = null;
export let channel: Channel | undefined;

export function connectWithRetry(
  args: { connectionURL: string, consumeQueues?: IConsumeArgs[] }
): void {
  connect({ connectionURL: args.connectionURL })
  .then(async con => {
    try {
      logger.info({
        message: 'Connected to the message queue',
      });
      connection = con;

      await createChannel();

      if (args.consumeQueues !== undefined) {
        args.consumeQueues.forEach(consumeData => {
          consumeQueue(consumeData)
          .catch(error => {
            logger.error({
              message: error.message,
              payload: error,
            });
          });
        });
      }
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });
    }
  })
  .catch(error => {
    logger.error({
      message: error.message,
      payload: error,
    });

    global.setTimeout(connectWithRetry, 1000, args);
  });
}

export function connect(args: { connectionURL: string }): Bluebird<Connection> {
  return(queueConnect(args.connectionURL));
}

export function createChannel(): Bluebird<void> {
  if (connection === null) {
    return(Bluebird.reject(new Error(
      'Make sure a connection to the queue was established before creting a ' +
      'channel'
    )));
  }

  return(
    connection.createChannel()
    .then(ch => {
      channel = ch;
      logger.info({
        message: 'Created channel with the message queue',
      });
    })
  );
}

export function consumeQueue(args: IConsumeArgs): Bluebird<void> {
  if (channel === undefined) {
    return(Bluebird.reject(new Error(
      `Trying to consume the "${args.queueName}" queue, but no channel with ` +
      'the message queue exists'
    )));
  }

  return(
    channel.consume(args.queueName, args.handler)
    .then(() => {
      logger.info({
        message: `Consuming the "${args.queueName}" queue`,
      });
    })
  );
}

export function ackMessage(
  args: { message: ConsumeMessage, allUpTo?: boolean }
): void {
  if (channel === undefined) {
    logger.error({
      message: 'Tryied to "ack" a message, but no channel to the queue exists',
      payload: args,
    });
    return;
  }

  channel.ack(args.message, args.allUpTo);
}

export function nackMessage(
  args: { message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean }
): void {
  if (channel === undefined) {
    logger.error({
      message: 'Tryied to "nack" a message, but no channel to the queue exists',
      payload: args,
    });
    return;
  }

  channel.nack(args.message, args.allUpTo, args.requeue);
}

export function preparePayload(args: { data: string }): Buffer {
  return(Buffer.from(args.data, 'utf8'));
}

export function parsePayload(args: { data: Buffer }): string {
  return(args.data.toString());
}