'use strict';
import { Request, Response } from 'express';
import * as Validator from 'validatorjs';
import { userExists, createUserPendingActivation } from '../../models/users';
import * as logger from '../../../sharedLibs/services/logger';

export default async function handler(
  req: Request, res: Response
): Promise<Response> {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const validator = new Validator(
      { email, password, name },
      {
        email: 'required|email',
        password: 'required|string',
        name: 'required|string',
      }
    );
    if (validator.fails()) {
      return(res.status(400).json({ errors: validator.errors }));
    }

    if (await userExists({ email })) {
      return(res.status(400).json({
        error: 'The provided email is not valid.',
      }));
    }

    await createUserPendingActivation({ email, password, name });

    return(res.status(200).json({}));
  } catch (error) {
    logger.error({
      message: error.message,
      payload: error,
    });

    return(res.status(500).json({
      error: 'Could not handle the request.',
    }));
  }
}