'use strict';
import { IEmailBody } from '../../interfaces/templates';

export default function emailBody(): IEmailBody {
  /* tslint:disable:max-line-length */
  return({
    plain: `
    The password for your account has been successfully changed, following a lost password request.

    If you did not make this password change and would like to reset the password, please use the \"lost password\" functionality, available from the login screen.

    Project Node Express Boilerplate.
    `,

    html: `
    <html>
      <head></head>
      <body>
        <p>The password for your account has been successfully changed, following a lost password request.</p>
        <p>If you did not make this password change and would like to reset the password, please use the \"lost password\" functionality, available from the login screen.</p>
        <p>Project Node Express Boilerplate.</p>
      </body>
    <html>
    `,
  });
  /* tslint:enable:max-line-length */
}