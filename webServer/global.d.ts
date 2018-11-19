import { ISessionRequest } from './interfaces/data';

declare global {
  namespace Express {
    interface Request {
      session?: ISessionRequest,
    }
  }
}

export {};