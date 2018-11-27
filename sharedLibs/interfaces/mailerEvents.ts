'use strict';
import { TSocket, TChannel } from '../types/events';

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
export interface ISocketMailerSendEmail {
  socket: TSocket,
  payload: IMailerSendEmailPayload,
}
export interface IMQMailerSendEmail {
  mqChannel: TChannel,
  payload: IMailerSendEmailPayload,
}