'use strict';
import { createTransport } from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as logger from '../../sharedLibs/services/logger';
import { TEventCb } from '../../sharedLibs/types/events';
import {
  IMailerSendEmailPayload
} from '../../sharedLibs/interfaces/mailerEvents';

const host: string = process.env.MAIL_HOST || '127.0.0.0';
const port: number = parseInt(process.env.MAIL_PORT || '1025', 10);

const smtpConfig: smtpTransport.SmtpOptions = {
  host,
  port,
  secure: false,
  ignoreTLS: true,
  connectionTimeout: 60000,
};

const transporter = createTransport(smtpTransport(smtpConfig));

export function send(payload: IMailerSendEmailPayload, ack?: TEventCb): void {
  logger.debug({ message: 'Received event "mailerSendEmail"' });

  const message = {
    from: {
      name: payload.from.name,
      address: payload.from.address,
    },
    to: payload.to,
    subject: payload.subject,
    text: payload.body.plain,
    html: payload.body.html,
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      logger.error({
        message: error.message,
        payload: error,
      });
      if (ack) { ack(error); }
    } else {
      if (ack) { ack(null, info); }
    }
  });
}