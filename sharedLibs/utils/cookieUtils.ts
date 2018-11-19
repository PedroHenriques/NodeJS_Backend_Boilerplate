'use strict';
import { Request, CookieOptions, Response } from 'express';

export const getCookie = (
  args: { req: Request, name: string }
): string | null => {
  if (
    args.req.cookies === undefined ||
    args.req.cookies[args.name] === undefined
  ) {
    return(null);
  }

  return(args.req.cookies[args.name]);
};

const cookieOptions = (): CookieOptions => {
  const options: CookieOptions = {
    httpOnly: false,
  };

  if (process.env.NODE_ENV !== 'development') {
    options.secure = true;
  }

  return(options);
};

export const setCookie = (
  args: { res: Response, name: string, value: string }
): Response => args.res.cookie(args.name, args.value, cookieOptions());

export const clearCookie = (
  args: { res: Response, name: string }
): Response => args.res.clearCookie(args.name, cookieOptions());