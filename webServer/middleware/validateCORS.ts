'use strict';
import { NextFunction, Request, Response } from 'express';

export default function validateCORS(
  req: Request, res: Response, next: NextFunction
): void {
  res.header('Access-Control-Allow-Credentials', 'true');

  const allowedOrigins: string[] = [];
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:9000');
  } else if (process.env.NODE_ENV === 'production') {
    // TODO: add the production domains to be allowed in
  }

  const origin = req.headers.origin;
  if (
    origin && typeof origin === 'string' &&
    allowedOrigins.indexOf(origin) !== -1
  ) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );

  next();
}