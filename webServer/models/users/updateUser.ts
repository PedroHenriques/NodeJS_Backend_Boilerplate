'use strict';
import { getSocket } from '../../../sharedLibs/utils/socketConnection';
import {
  socketDbFindOneUpdate
} from '../../../sharedLibs/utils/dbEventDispatchers';
import { IUserEntity, IUserEntityUpdate } from '../../interfaces/dbSchema';

export default function updateUser(
  args: { email: string, data: IUserEntityUpdate }
): Promise<IUserEntity> {
  return(
    socketDbFindOneUpdate({
      socket: getSocket('db'),
      payload: {
        collection: 'users',
        filter: { email: args.email },
        update: { $set: { ...args.data } },
      }
    }) as Promise<IUserEntity>
  );
}