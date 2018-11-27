'use strict';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import {
  socketDbFindOne
} from '../../../sharedLibs/utils/dbEventDispatchers';

export default function userExists(args: { email: string }): Promise<boolean> {
  return(
    socketDbFindOne({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        query: { email: args.email },
      },
    })
    .then((data) => {
      return(data !== null);
    })
  );
}