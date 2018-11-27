'use strict';
import { ConsumeMessage } from 'amqplib';
import { TQueueNames } from '../types/events';

export interface IConsumeArgs {
  queueName: TQueueNames,
  handler: (rawMessage: ConsumeMessage | null) => void
}