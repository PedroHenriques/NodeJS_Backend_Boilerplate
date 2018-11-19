# db

## Overview

This service creates an abstraction layer between the application and the database solution used, which in this case is `MongoDB`.

## Socket Server

This service creates a socket server, listening to the following events:

### `dbInsertOne`

Request the DB to insert a document in a certain collection.  
Expects a payload in the format:

```js
{
  collection: string,
  item: Object,
}
```

If a callback is provided, it will be called with the `ID` of the stored document as the `value` argument.

### `dbFindOne`

Request the DB to find a document in a certain collection that match certain criterias.
Expects a payload in the format:

```js
{
  collection: string,
  query: Object,
}
```

Where `query` is the object with the criteria to match against the documents.  

If a callback is provided, it will be called with the document(s) found as the `value` argument.

### `dbFindOneUpdate`

Request the DB to find a document, in a certain collection and matching certain criterias, and update all or part of that document.  
Expects a payload in the format:

```js
{
  collection: string,
  filter: Object,
  update: Object,
}
```

Where `filter` is an object with the criteria used to search for a document and `update` is an object with the new property-value pairs to update on that document.  

If a callback is provided, it will be called with the document, in its state after the update, as the `value` argument.

## Event Dispatchers

The recommended way to dispatch events to this service is to use the available **event dispatchers** for the DB related events.  

Theses functions are located in the `sharedLibs/utils/dbEventDispatchers.ts` file, which should be available to all services.