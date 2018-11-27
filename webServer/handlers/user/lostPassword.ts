'use strict';
import { Request, Response } from 'express';
import * as Validator from 'validatorjs';
import userExists from '../../models/users/userExists';
import startPwRecovery from '../../models/users/startPwRecovery';
import * as logger from '../../../sharedLibs/services/logger';

export default async function handler(
  req: Request, res: Response
): Promise<Response> {
  try {
    const email = req.body.email;

    const validator = new Validator(
      { email },
      {
        email: 'required|email',
      }
    );
    if (validator.fails()) {
      return(res.status(400).json({ errors: validator.errors }));
    }

    if (await userExists({ email })) {
      await startPwRecovery({ email });
    }

    // Don't give away the information of whether an account exists
    // for an email address or not
    return(res.status(200).json({}));
  } catch (error) {
    logger.error({
      message: error.message,
      payload: error,
    });

    return(res.status(500).json({
      errors: 'Could not handle the request.',
    }));
  }
}