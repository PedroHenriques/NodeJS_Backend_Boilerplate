'use strict';
import * as express from 'express';
import requestLogger from './middleware/requestLogger';
import validateCORS from './middleware/validateCORS';
import serverErrorHandler from './middleware/serverErrorHandler';
import v1Router from './routers/v1';
import { connectSocket } from '../sharedLibs/utils/socketConnection';
import * as logger from '../sharedLibs/services/logger';

if (
  process.env.CACHE_HOST === undefined ||
  process.env.CACHE_PORT === undefined
) {
  throw Error('Missing "cache" container host and/or port env variables');
}
connectSocket(
  process.env.CACHE_HOST, parseInt(process.env.CACHE_PORT, 10), 'cache'
);

if (
  process.env.MAILER_HOST === undefined ||
  process.env.MAILER_PORT === undefined
) {
  throw Error('Missing "mailer" container host and/or port env variables');
}
connectSocket(
  process.env.MAILER_HOST, parseInt(process.env.MAILER_PORT, 10), 'mailer'
);

if (
  process.env.DB_HOST === undefined ||
  process.env.DB_PORT === undefined
) {
  throw Error('Missing "db" container host and/or port env variables');
}
connectSocket(
  process.env.DB_HOST, parseInt(process.env.DB_PORT, 10), 'db'
);

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'production';
}

const app = express();

// General Middleware
app.use([ express.json(), requestLogger, validateCORS ]);

// Routers
app.use('/api/v1', v1Router);

// General Error Handling Middleware
app.use([ serverErrorHandler ]);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info({
    message: `The server is running in "${process.env.NODE_ENV}" mode`
  });
  logger.info({ message: `Listening on localhost:${PORT}` });
});