'use strict';
import { connect } from 'socket.io-client';
import * as logger from '../services/logger';
import { TSocketTags } from '../types/events';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

export function getSocket(tag: TSocketTags): SocketIOClient.Socket {
  if (!sockets[tag]) {
    throw Error(`Could not find socket with tag "${tag}"`);
  }
  return(sockets[tag]);
}

export function socketExists(tag: TSocketTags): boolean {
  return(sockets[tag] !== undefined);
}

export function connectSocket(
  host: string, port: number, tag: TSocketTags
): SocketIOClient.Socket {
  if (Object.getOwnPropertyNames(sockets).includes(tag)) {
    throw Error(`A socket already exists for the tag "${tag}"`);
  }

  const socket = connect(`http://${host}:${port}`);

  socket.on('connect', () => {
    logger.info({ message: `Connected to socket server with tag "${tag}"` });
  });
  socket.on('connect_error', (error: any) => {
    logger.error({
      message: `Failed to connect to the socket server with tag "${tag}"`,
      payload: error,
    });
  });
  socket.on('connect_timeout', (timeout: any) => {
    logger.error({
      message: `Timeout when connecting to the socket server with tag "${tag}"`,
      payload: timeout,
    });
  });
  socket.on('error', (error: any) => {
    logger.error({
      message: `Error with the socket connection with tag "${tag}"`,
      payload: error,
    });
  });

  sockets[tag] = socket;

  return(socket);
}