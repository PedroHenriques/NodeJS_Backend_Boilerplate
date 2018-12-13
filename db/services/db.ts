'use strict';
import { connect, MongoClient, Db } from 'mongodb';
import * as mongoUtils from '../utils/mongo';
import * as logger from '../../sharedLibs/services/logger';

const connectURL: string = process.env.DB_CONNECT_URL || '';

let client: MongoClient;
let db: Db;

connect(connectURL, { useNewUrlParser: true })
.then(mongoClient => {
  logger.info({ message: 'Connected to MongoDB' });

  client = mongoClient;
  db = client.db(process.env.MONGO_DB_NAME);
})
.catch(error => {
  logger.error({
    message: error.message,
    payload: error,
  });
});

export async function insertOne(
  args: { collection: string, item: Object }
): Promise<string> {
  const collection = db.collection(args.collection);
  const insertResult = await collection.insertOne(args.item);
  return(insertResult.insertedId.toHexString());
}

export async function findOne(
  args: { collection: string, query: { [key: string]: any } }
): Promise<Object | null> {
  const query = mongoUtils.prepareQuery(args.query);

  const collection = db.collection(args.collection);
  const findResult = await collection.findOne(query);
  return(mongoUtils.prepareResult(findResult));
}

export async function findOneUpdate(
  args: { collection: string, filter: { [key: string]: any }, update: Object }
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