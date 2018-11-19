'use strict';
import { connect, MongoClient, Db } from 'mongodb';
import * as logger from '../../sharedLibs/services/logger';

let connectURL: string = 'YOUR PRODUCTION CONNECTION URL';
if (process.env.NODE_ENV === 'development') {
  connectURL = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;
}

let client: MongoClient;
let db: Db;

connect(connectURL, { useNewUrlParser: true })
.then(mongoClient => {
  logger.info({ message: 'Connected to MongoDB' });

  client = mongoClient;
  db = client.db(process.env.MONGO_DB_NAME);
});

export async function insertOne(
  args: { collection: string, item: Object }
): Promise<string> {
  const collection = db.collection(args.collection);
  const insertResult = await collection.insertOne(args.item);
  return(insertResult.insertedId.toHexString());
}

export async function findOne(
  args: { collection: string, query: Object }
): Promise<any> {
  const collection = db.collection(args.collection);
  const findResult = await collection.findOne(args.query);
  return(findResult);
}

export async function findOneUpdate(
  args: { collection: string, filter: Object, update: Object }
): Promise<any> {
  const collection = db.collection(args.collection);
  const modifyResult = await collection.findOneAndUpdate(
    args.filter, args.update, { returnOriginal: false }
  );
  if (modifyResult.ok !== 1) {
    return(Promise.reject(modifyResult.lastErrorObject));
  }

  return(modifyResult.value);
}