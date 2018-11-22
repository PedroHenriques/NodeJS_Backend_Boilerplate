'use strict';
import { IEmailBody } from '../../interfaces/templates';

export default function emailBody(
  args: { pwResetURL: string }
): IEmailBody {
  /* tslint:disable:max-line-length */
  return({
    plain: `
    This email was sent because a password recovery was requested for your account.

    If you did not make that request then no further action is required.

    To set a new password for your account please visit the link below:

    ${args.pwResetURL}

    Project Node Express Boilerplate.
    `,

    html: `
    <html>
      <head></head>
      <body>
        <p>This email was sent because a password recovery was requested for your account.</p>
        <p>If you did not make that request then no further action is required.</p>
        <p>To set a new password for your account please visit the link below:</p>
        <p><a href='${args.pwResetURL}' target='_blank'>${args.pwResetURL}</a></p>
        <p>Project Node Express Boilerplate.</p>
      </body>
    <html>
    `,
  });
  /* tslint:enable:max-line-length */
}