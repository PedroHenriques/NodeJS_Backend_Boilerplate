'use strict';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import {
  socketDbFindOne
} from '../../../sharedLibs/utils/dbEventDispatchers';
import { IUserEntity } from '../../interfaces/dbSchema';

export default function getUserById(
  args: { id: string }
): Promise<IUserEntity> {
  return(
    socketDbFindOne({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        query: { id: args.id },
      },
    })
    .then(data => {
      if (data === null) {
        return(Promise.reject(
          `Could not find the user with ID "${args.id}"`
        ));
      }
      return(Promise.resolve(data as IUserEntity));
    })
  );
}