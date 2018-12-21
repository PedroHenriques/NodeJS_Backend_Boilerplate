'use srict';
import dbFindOneFactory from './dbFindOne';
import dbFindOneUpdateFactory from './dbFindOneUpdate';
import dbInsertOneFactory from './dbInsertOne';
import { IHandlers } from '../interfaces/handlers';
import { IDb } from '../interfaces/services';

export default function handlerFactory(db: IDb): IHandlers {
  return({
    dbFindOne: dbFindOneFactory(db),
    dbFindOneUpdate: dbFindOneUpdateFactory(db),
    dbInsertOne: dbInsertOneFactory(db),
  });
}