# cache

## Overview

This service creates an abstraction layer between the application and the caching solution used, which in this case is `Redis`.

## Socket Server

This service creates a socket server, listening to the following events:

### `cacheGetValue`

Request to the cache the value associated with a certain key.  
Expects a payload in the format:

```js
{
  key: string,
}
```

If a callback is provided, it will be called with the value stored in the cache for the requested key, as the `value` argument.

### `cacheStoreValue`

Request the cache to store a value in a certain key.  
Expects a payload in the format:

```js
{
  key: string,
  value: string,
}
```

If a callback is provided, it will be called with `undefined`, as the `value` argument.

### `cacheGetObject`

Request the cache to retrieve the object associated with a certain key.  
Expects a payload in the format:

```js
{
  key: string,
}
```

If a callback is provided, it will be called with the retrieved value, as the `value` argument.

### `cacheStoreObject`

Request the cache to store an object in a certain key.  
The object will be converted into a **JSON string** before being stored.  
Expects a payload in the format:

```js
{
  key: string,
  value: Object,
}
```

If a callback is provided, it will be called with `undefined`, as the `value` argument.

### `cacheStoreObjectIfNotExists`

Similar to the event `cacheStoreObject`, but the object will only be stored if a key with the same name doesn not already exist.  
If a key with the same name already exists the stored value will not be overwritten.  
Expects a payload in the format:

```js
{
  key: string,
  value: Object,
}
```

If a callback is provided, it will be called with a `boolean`, as the `value` argument.  
The boolean will be `true` if the object was stored or `false` if it was not stored.

### `cacheExpireKey`

Request the cache to set an expire date on a certain key.  
The expire date will be the current time plus the number of seconds provided in the event payload.  
Expects a payload in the format:

```js
{
  key: string,
  value: number,
}
```

Where `value` is the number of seconds left until `key` expires.  

If a callback is provided, it will be called with a `boolean`, as the `value` argument.  
The boolean will be `true` if the the key was set to expire or `false` if it was not set to expire.

### `cacheDeleteKey`

Request the cache to delete a key, if it exists.  
Expects a payload in the format:

```js
{
  key: string,
}
```

If a callback is provided, it will be called with the number of keys deleted, as the `value` argument.

### `cacheKeysExist`

Request the cache to check if a set of keys exist.  
Expects a payload in the format:

```js
{
  keys: string[],
}
```

If a callback is provided, it will be called with a `boolean`, as the `value` argument.  
If the boolean is `true` then all keys exist, if it is `false` then at least one of the keys does not exist.

## Event Dispatchers

The recommended way to dispatch events to this service is to use the available **event dispatchers** for the cache related events.  

Theses functions are located in the `sharedLibs/utils/cacheEventDispatchers.ts` file, which should be available to all services.