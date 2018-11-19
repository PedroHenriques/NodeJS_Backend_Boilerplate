'use strict';
import { IEventDispatcher } from './events';

export interface IMailerSendEmail extends IEventDispatcher {
  payload: IMailerSendEmailPayload,
}

export interface IMailerSendEmailPayload {
  from: {
    name: string,
    address: string,
  },
  to: string,
  subject: string,
  body: {
    plain?: string,
    html: string,
  },
}