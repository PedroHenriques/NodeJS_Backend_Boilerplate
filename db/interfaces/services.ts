'use strict';

export interface IDb {
  insertOne: (args: { collection: string, item: Object }) => Promise<string>,
  findOne: (
    args: { collection: string, query: { [key: string]: any } }
  ) => Promise<Object | null>,
  findOneUpdate: (
    args: { collection: string, filter: { [key: string]: any }, update: Object }
  ) => Promise<Object>,
}