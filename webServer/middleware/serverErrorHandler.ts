'use strict';
import { Response, Request, NextFunction } from 'express';
import * as logger from '../../sharedLibs/services/logger';

export default function serverErrorHandler(
  err: Error , req: Request, res: Response, next: NextFunction
): Response | void {
  logger.error({
    message: err.message,
    payload: err,
  });

  if (res.headersSent) {
    return(next(err));
  }

  return(res.status(500).json({ error: 'Could not handle the request.' }));
}