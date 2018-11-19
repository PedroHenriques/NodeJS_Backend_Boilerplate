'use strict';
import * as Events from '../utils/eventTypes';
import * as IEvents from '../interfaces/events';

export function mailerSendEmail(
  args: IEvents.IMailerSendEmail
): Promise<any> {
  return(new Promise((resolve, reject) => {
    const cb: IEvents.TEventCb = (error: Error | null, data: any) => {
      if (error) { reject(error); }
      else { resolve(data); }
    };
    args.socket.emit(Events.MAILER_SEND_EMAIL, args.payload, cb);
  }));
}