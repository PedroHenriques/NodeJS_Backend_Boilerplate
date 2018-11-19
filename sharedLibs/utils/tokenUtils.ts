'use strict';
import { v4 } from 'uuid';

export function generateToken(blackList?: string[]): string {
  let token: string = '';

  while (token.length === 0) {
    const tempToken = v4();

    if (!blackList || blackList.indexOf(tempToken) === -1) {
      token = tempToken;
    }
  }

  return(token);
}