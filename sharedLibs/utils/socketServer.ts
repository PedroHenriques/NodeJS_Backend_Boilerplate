'use strict';
import * as socketIo from 'socket.io';
import * as logger from '../services/logger';

export default function createSocketServer(
  handler: (socket: socketIo.Socket) => void, port: number,
  options?: socketIo.ServerOptions
): socketIo.Server {
  const io = socketIo(port, options);

  io.on('connection', (socket) => {
    logger.info({
      message: `Received connection from socket with ID "${socket.id}"`,
      payload: socket.handshake,
    });

    socket.on('disconnect', (reason) => {
      logger.info({
        message: `Disconnected socket with ID "${socket.id}"`,
        payload: reason,
      });
    });

    socket.on('error', (error) => {
      logger.error({
        message: `An error occured with socket ID "${socket.id}"`,
        payload: error,
      });
    });

    handler(socket);
  });

  return(io);
}