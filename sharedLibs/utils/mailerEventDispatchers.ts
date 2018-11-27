'use strict';
import { socketEventDispatcher, mqEventDispatcher } from './eventDispatchers';
import * as Events from '../utils/eventTypes';
import { TQueueNames } from '../types/events';
import * as IEvents from '../interfaces/mailerEvents';

const queueName: TQueueNames = 'mailer';

export function socketMailerSendEmail(
  args: IEvents.ISocketMailerSendEmail
): Promise<any> {
  return(socketEventDispatcher<any>({
    ...args,
    type: Events.MAILER_SEND_EMAIL,
  }));
}
export function mqMailerSendEmail(
  args: IEvents.IMQMailerSendEmail
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.MAILER_SEND_EMAIL,
      requeue: true,
      payload: args.payload,
    }
  }));
}