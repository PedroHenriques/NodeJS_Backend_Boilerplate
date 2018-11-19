'use strict';
import { join } from 'path';
import { createLogger, LoggerOptions, transports, format } from 'winston';
import { IMessage, ILogMessage } from '../interfaces/services';

const transportInstances = {
  console: new transports.Console({
    stderrLevels: [ 'error' ],
    format: format.combine(
      format.timestamp(),
      format.colorize(),
      format.simple()
    ),
  }),
  errorFile: new transports.File({
    level: 'error',
    filename: join('.', 'logs', 'server_errors.log'),
  }),
  exceptionFile: new transports.File({
    filename: join('.', 'logs', 'exceptions.log'),
  }),
};

const loggerOptions: LoggerOptions = {
  level: (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports: [ transportInstances.console, transportInstances.errorFile ],
  exceptionHandlers: [ transportInstances.exceptionFile ],
  format: format.combine(
    format.timestamp(),
    format.simple()
  ),
  exitOnError: false,
};
const logger = createLogger(loggerOptions);

export function log(args: ILogMessage): void {
  logger.log(args);
}

export function error(args: IMessage): void {
  log({ level: 'error', ...args });
}

export function warn(args: IMessage): void {
  log({ level: 'warn', ...args });
}

export function info(args: IMessage): void {
  log({ level: 'info', ...args });
}

export function debug(args: IMessage): void {
  log({ level: 'debug', ...args });
}