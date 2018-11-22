'use strict';
import { IEmailBody } from '../../interfaces/templates';

export default function emailBody(
  args: { activationURL: string }
): IEmailBody {
  /* tslint:disable:max-line-length */
  return({
    plain: `
    Thank you for registering an account on our platform.

    You are 1 step away from being able to start using our application.

    To activate your account please click on the link below:

    ${args.activationURL}

    Project Node Express Boilerplate.
    `,

    html: `
    <html>
      <head></head>
      <body>
        <p>Thank you for registering an account on our platform.</p>
        <p>You are 1 step away from being able to start using our application.</p>
        <p>To activate your account please click on the link below:</p>
        <p><a href='${args.activationURL}' target='_blank'>${args.activationURL}</a></p>
        <p>Project Node Express Boilerplate.</p>
      </body>
    <html>
    `,
  });
  /* tslint:enable:max-line-length */
}