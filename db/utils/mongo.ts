'use strict';
import { ObjectID } from 'mongodb';

export function prepareQuery(
  query: { [key: string]: any }
): { [key: string]: any } {
  const preparedQuery = { ...query };

  if (preparedQuery.hasOwnProperty('id')) {
    Object.defineProperty(preparedQuery, '_id', {
      value: new ObjectID(preparedQuery['id']),
      enumerable: true,
      writable: false,
    });
    delete preparedQuery.id;
  }

  return(preparedQuery);
}

export function prepareResult(
  result: { [key: string]: any } | null
): { [key: string]: any } | null {
  if (result === null) { return(null); }

  const preparedResult = { ...result };

  if (preparedResult.hasOwnProperty('_id')) {
    Object.defineProperty(preparedResult, 'id', {
      value: preparedResult['_id'],
      enumerable: true,
      writable: true,
    });
    delete preparedResult['_id'];
  }

  return(preparedResult);
}