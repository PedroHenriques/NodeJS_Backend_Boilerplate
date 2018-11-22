'use strict';
import { IEmailBody } from '../../interfaces/templates';

export default function emailBody(
  args: { loginURL: string }
): IEmailBody {
  /* tslint:disable:max-line-length */
  return({
    plain: `
    Your account is now activate and you are ready to start using our application.

    To login please visit the following link ${args.loginURL}.

    Project Node Express Boilerplate.
    `,

    html: `
    <html>
      <head></head>
      <body>
        <p>Your account is now activate and you are ready to start using our application.</p>
        <p>To login please visit the following link <a href='${args.loginURL}' target='_blank'>${args.loginURL}</a>.</p>
        <p>Project Node Express Boilerplate.</p>
      </body>
    <html>
    `,
  });
  /* tslint:enable:max-line-length */
}