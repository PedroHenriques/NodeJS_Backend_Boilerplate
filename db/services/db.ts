'use strict';
import { Db } from 'mongodb';
import * as mongoUtils from '../utils/mongo';
import { IDb } from '../interfaces/services';

export default function dbFactory(db: Db): IDb {
  return({
    insertOne: async function fn(
      args: { collection: string, item: Object }
    ): Promise<string> {
      const collection = db.collection(args.collection);
      const insertResult = await collection.insertOne(args.item);
      return(insertResult.insertedId.toHexString());
    },

    findOne: async function fn(
      args: { collection: string, query: { [key: string]: any } }
    ): Promise<Object | null> {
      const query = mongoUtils.prepareQuery(args.query);

      const collection = db.collection(args.collection);
      const findResult = await collection.findOne(query);
      return(mongoUtils.prepareResult(findResult));
    },

    findOneUpdate: async function fn(
      args: {
        collection: string, filter: { [key: string]: any }, update: Object
      }
    ): Promise<Object> {
      const filter = mongoUtils.prepareQuery(args.filter);

      const collection = db.collection(args.collection);
      const modifyResult = await collection.findOneAndUpdate(
        filter, args.update, { returnOriginal: false }
      );
      if (modifyResult.ok !== 1) {
        return(Promise.reject(modifyResult.lastErrorObject));
      }

      const returnValue = mongoUtils.prepareResult(modifyResult.value);
      if (returnValue === null) {
        return({});
      } else {
        return(returnValue);
      }
    }
  });
}