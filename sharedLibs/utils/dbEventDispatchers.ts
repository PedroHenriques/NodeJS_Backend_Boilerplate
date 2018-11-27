'use strict';
import { socketEventDispatcher, mqEventDispatcher } from './eventDispatchers';
import * as Events from '../utils/eventTypes';
import { TQueueNames } from '../types/events';
import * as IEvents from '../interfaces/dbEvents';

const queueName: TQueueNames = 'db';

export function socketDbInsertOne(
  args: IEvents.ISocketDbInsertOne
): Promise<string> {
  return(socketEventDispatcher<string>({
    ...args,
    type: Events.DB_INSERT_ONE,
  }));
}
export function mqDbInsertOne(
  args: IEvents.IMQDbInsertOne
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.DB_INSERT_ONE,
      requeue: true,
      payload: args.payload,
    }
  }));
}

export function socketDbFindOne(
  args: IEvents.ISocketDbFindOne
): Promise<Object | null> {
  return(socketEventDispatcher<Object | null>({
    ...args,
    type: Events.DB_FIND_ONE,
  }));
}

export function socketDbFindOneUpdate(
  args: IEvents.ISocketDbFindOneUpdate
): Promise<Object> {
  return(socketEventDispatcher<Object>({
    ...args,
    type: Events.DB_FIND_ONE_UPDATE,
  }));
}
export function mqDbFindOneUpdate(
  args: IEvents.IMQDbFindOneUpdate
): Promise<void> {
  return(mqEventDispatcher({
    mqChannel: args.mqChannel,
    persistent: true,
    queueName,
    data: {
      type: Events.DB_FIND_ONE_UPDATE,
      requeue: true,
      payload: args.payload,
    }
  }));
}