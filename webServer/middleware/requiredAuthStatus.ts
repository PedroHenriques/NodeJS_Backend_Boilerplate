'use strict';
import { NextFunction, Request, Response } from 'express';
import * as logger from '../../sharedLibs/services/logger';

export default function requiredAuthStatus(
  grantAccessIf: 'loggedIn' | 'notLoggedIn'
) {
  return(
    (req: Request, res: Response, next: NextFunction): void | Response => {
      logger.debug({ message: 'Starting logged in verification' });

      const isLoggedIn: boolean = req.session !== undefined;
      if (isLoggedIn && grantAccessIf === 'notLoggedIn') {
        logger.debug({ message: 'Denied because is logged in' });

        return(res.status(403).json({
          error: 'The request is only valid for non authenticated users',
        }));
      }
      if (!isLoggedIn && grantAccessIf === 'loggedIn') {
        logger.debug({ message: 'Denied because is not logged in' });

        return(res.status(401).json({
          error: 'Invalid credentials',
        }));
      }

      logger.debug({ message: 'Logged in status valid' });

      next();
    }
  );
}