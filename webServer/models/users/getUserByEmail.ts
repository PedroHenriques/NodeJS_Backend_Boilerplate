'use strict';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import {
  socketDbFindOne
} from '../../../sharedLibs/utils/dbEventDispatchers';
import { IUserEntity } from '../../interfaces/dbSchema';

export default function getUserByEmail(
  args: { email: string }
): Promise<IUserEntity> {
  return(
    socketDbFindOne({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        query: { email: args.email },
      },
    })
    .then(data => {
      if (data === null) {
        return(Promise.reject(
          `Could not find the user with email ${args.email}`
        ));
      }
      return(Promise.resolve(data as IUserEntity));
    })
  );
}