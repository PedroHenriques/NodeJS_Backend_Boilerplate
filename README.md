# Boilerplate for a services based backend application in NodeJS

## The core technologies used are:

- **NodeJS** (v11.*)
- **Redis** (v4.*)
- **MongoDB** (v4.*)

## In development environment these tools are also available:

- **Redis Commander**: A GUI for Redis
- **Mongo Express**: A GUI for MongoDB
- **Mailhog**: A mail catcher tool

# Setup

## Production mode

A `docker-compose` file is available with this repo, but you'll need to adjust it to your production needs and architecture.  
The following files require production environment adjustments:
- `webserver/middleware/validateCORS.ts`: If needed, add the domains you want to allow to make requests to the application, for CORS purposes.

## Development mode

1. Open a console/terminal and `cd` into the repo's root directory
2. Run the command `npm i`
3. Run the command `npm run watch`
4. Open a new console/terminal in the `docker` directory
5. Run the command `docker-compose -f ./docker-compose.dev.yml up`

**NOTES**

. A GUI for the **emails sent** is available at `http://localhost:8025`  
. A GUI for **Redis** is available at `http://localhost:8081`  
. A GUI for **MongoDB** is available at `http://localhost:8082`

# Configuration

## Environment Variables

All environment variables are defined in the `docker-compose` files and the associated `.env` file.  
These files are located in the `docker/` directory.

## Redis

The container with the redis image will receive one of the configuration files located in the `redis/` directory.  

The `docker-compose.yml` file will use the `redis/redis.conf` file and the `docker-compose.dev.yml` file will use the `redis/redis.dev.conf` file.

## MongoDB

The files in the `mongodb/scripts/` directory will be mounted into the `/docker-entrypoint-initdb.d/` directory inside the container.  

MongoDB will automatically execute any `.sh` or `.js` files located inside that directory, in alphabetical order.  
More information can be found in the [official mongoDB docker image github](https://github.com/docker-library/docs/blob/master/mongo/README.md#initializing-a-fresh-instance).

## Application Configurations

This boilerplates comes with a service that will load files into the cache.  

You are encouraged to load any configuration files needed by the application code into the cache and then access it through the `cache` service when needed.  

Further information about the `cache` service is available in the `documentation/services/cache.md` file.

# Test Client Application

A test client application is available, in the `webserver/client_app.js` file, which allows an easy way to interact with the API. You can run this client via NodeJS environment.

Here is an example use, running in the `NodeJS CLI` from the project root directory:

```js
const client = require('./webserver/client_app');

// this will create a user pending activation and send an activation email
client.createUser('test@test.com', 'my password');

// this will activate the account and create the user entity with an ID
client.activateUser('test@test.com', 'the token in the email link');

// this will log you in
client.login('test@test.com', 'my password');

// now you can call any API end point that requires being logged in

// this will log you out
client.logout();

// this will start the lost password process and send an email with a link to reset the password
client.lostPassword('test@test.com');

// this will allow you to reset your account password
client.resetPassword('test@test.com', 'the token in the email link', 'new password');

// login with the new password
client.login('test@test.com', 'new password');
```

# Services

The application is built in several services, each in a docker container.  
This makes it easier to scale bottleneck services, by creating replicas of those services and also makes the application modular and thus easier to maintain and modify over time.  

The various services communicate via `sockets` with each another, dispatching events that trigger actions in other containers.  
These socket connections support 2 way communication if needed.

Detailed information about each service is available in the `documentation/services/` directory.

# Socket Events

As mentioned above, each service is in a dedicated docker container and communication between containers is done by dispatching events via socket connections.  

## Creating a socket server

To facilitate and standardize creating socket servers, a factory function is available in the `sharedLibs/utils/socketServer.ts` file.  

This function expects the following arguments:  

- **handler function**:
```ts
(socket: socketIo.Socket) => void
```
Use this function to bind any listeners you want.

- **port**: `number` The port the socket server will use.

- **options**: `socketIo.ServerOptions` The options object, defined by the Socket.IO package, to use for this server.

The return value is a socket server of the type `socketIo.Server`.

## Creating a socket connection

To facilitate creating socket connections and manage multiple connections, the module located in the `sharedLibs/utils/socketConnection.ts` file exposes several helper functions that can create a socket connection to another service and assign them to tags.  

These tags make it easier to later get a reference to a specific socket and dispatch events to the target service.  
The valid tags are defined in the `TSocketTags` type, in the `sharedLibs/interfaces/utils.ts` file.

## Socket Event Callbacks

Some events will accept a callback with the signature:

```ts
(error: Error | null, value?: any) => void
```

It will ba called by the event handler after all processing has ended.  

In case of a success, the callback will receive `null` as the first argument and `some value` as the second argument, which will depend on the specific event.  

In case of a failure, the callback will receive an instance of `Error` as the first argument and nothing as the second argument.

# API Endpoints

Detailed documentation of the available API endpoints can be found in the `documentation/api/` directory.

# Functionality Overview

This boilerplate is ment to be a basis for building applications and not a full featured application, thus it has minimal out of the box features.  

It does come with a user account management system, which is detailed below.  

**NOTE:** all configurations for this system are located in the `config/userAccountConfig.json` file.

## User Account Registration

When a user registers an account, the user's information will be temporarily stored in the cache, until the user activates the account, via the email sent to the address provided as part of the registration data.  

An activation token will be generated and associated with the user's data.  
This token will be stored in the cache and set to automatically expire after **24 hours**.  

The amount of seconds the activation token will be valid is defined in the `accountRegistration.tokenDurationInSeconds` property of the config file.  

**NOTE:** the user's password is hashed before being stored in the cache.

## User Account Activation

After an account is registered, an activation email is sent to the user with an URL.  
This URL is built based on the `domain.*RootUrl` and `accountRegistration.activationRelUrl` properties of the config file.  

When a request is made to the relevant API endpoint with an email-token pair, the data associated with that token will be removed from the cache and an entry will be inserted into the DB, where an **ID** will be assigned to this user.  

On a successfull activation, a confirmation email will be sent to the user, with a URL to the login page.  
This URL is built based on the `domain.*RootUrl` and `accountActivation.loginRelUrl` properties of the config file.

## User Login

When a request is made to the relevant API endpoint with an email-password pair, a **session** will be created to facilitate authentication in future requests.  

The session will be stored in the **cache**, and set to automatically expire after **6 hours**.  
The amount of seconds the session will remain active is defined in the `login.sessionDurationInSeconds` property of the config file.  

The response sent to the login HTTP request will contain a **cookie** with the session ID, which should be sent in all future requests.  
The name of the cookie is defined in the `login.cookieName` property of the config file.

## Session Handling

The `session` expressJS middleware, located in the `webServer/middleware/session.ts` file, will check if a session ID was sent with the request.  

If a session ID was sent, then a check will be made to see if the user's data was changed since that session was created.  
If any of the user's data was changed since then, the session will be terminated, requiring the user to login again.

## User Account Password Recovery

When a request is made to the relevant API endpoint with an email address, a password reset token will be generated and stored in the cache, set to automatically expire after **1 hour**.  
The amount of seconds the token will remain valid is defined in the `lostPassword.tokenDurationInSeconds` property of the config file.  

An email will be sent to that address with a URL to the page where the user can insert the new password.  
This URL is built based on the `domain.*RootUrl` and `lostPassword.pwResetRelUrl` properties of the config file.  

**NOTE:** if all the code runs, the response to the HTTP request will always have a status code of `200` whether an activated user account exists for the provided email address or not.

## User Account Password Reset

When a request is made to the relevant API endpoint, the new password will be hashed and the associated user data in the DB will be updated.  

On a successfull update, a confirmation email will be sent to the user.