# db

## Overview

This service creates an abstraction layer between the application and the database solution used, which in this case is `MongoDB`.

## Migrations

Even though MongoDB is schemaless, this boilerplate configures the collections used to have schema validation and the necessary indexes.  

To setup the DB migration files are used.  
These files are located in the `db/migrations/` directory.  

To run the CLI commands for the migration manager follow these steps:  

1. Make sure the `mongodb` container is running
2. `cd` into the `docker/` directory
3. Enter the `mongodb` container by running the command:  
    Development: `docker-compose -f docker-compose.dev.yml exec db sh`  
    Production: `docker-compose exec db sh`  
4. Run the command `npm run migrate -- [YOUR COMMAND]`

For a list of available commands please consult the documentation for the [migrate-mongo](https://github.com/seppevs/migrate-mongo) package.

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

## Syntax Adjustments

MongoDB has a syntax with a few specific properties, that differ it from other databases, specifically from MySQL based implementations.  

For example, MongoDB's default `ID` property in documents is called `_id`, while in MySQL databases it is `id`.  

In order to isolate the application code from these specific database implementations, this service has a utilitary module that will adjust the objects received from the application and sent to the application into MySQL like standards.  
The utilitary functions are stored in the `db/utils/mongo.ts` file, and are used by the `db/services/db.ts` module.