'use strict';
import { Response, Request } from 'express';
import * as Validator from 'validatorjs';
import activateUser from '../../models/users/activateUser';
import * as logger from '../../../sharedLibs/services/logger';
import { ValidationError } from '../../../sharedLibs/Errors/ValidationError';

export default async function handler(
  req: Request, res: Response
): Promise<Response> {
  try {
    const email = req.body.email;
    const token = req.body.token;

    const validator = new Validator(
      { email, token },
      {
        email: 'required|email',
        token: 'required|string',
      }
    );
    if (validator.fails()) {
      return(res.status(400).json({ errors: validator.errors }));
    }

    const userData = await activateUser({ email, token });

    return(res.status(201).json({
      user: userData,
    }));
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