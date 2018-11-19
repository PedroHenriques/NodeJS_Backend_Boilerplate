'use strict';
import { Request, Response } from 'express';
import * as Validator from 'validatorjs';
import { endPwRecovery } from '../../models/users';
import * as logger from '../../../sharedLibs/services/logger';
import { ValidationError } from '../../../sharedLibs/Errors/ValidationError';

export default async function handler(
  req: Request, res: Response
): Promise<Response> {
  try {
    const email = req.body.email;
    const token = req.body.token;
    const newPassword = req.body.password;

    const validator = new Validator(
      { email, token, newPassword },
      {
        email: 'required|email',
        token: 'required|string',
        newPassword: 'required|string',
      }
    );
    if (validator.fails()) {
      return(res.status(400).json({ errors: validator.errors }));
    }

    await endPwRecovery({ email, token, newPassword });

    return(res.status(200).json({}));
  } catch (error) {
    logger.error({
      message: error.message,
      payload: error,
    });

    if (error instanceof ValidationError) {
      return(res.status(400).json({ errors: error.message }));
    }

    return(res.status(500).json({
      errors: 'Could not handle the request.',
    }));
  }
}