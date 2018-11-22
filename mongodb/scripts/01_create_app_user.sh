#!/bin/bash

mongo -u"$MONGO_INITDB_ROOT_USERNAME" -p"$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin \
  --eval "db.getSiblingDB('$MONGO_INITDB_DATABASE').runCommand({ createUser: '$MONGO_APP_USER', pwd: '$MONGO_APP_PW', roles: [ 'readWrite' ], digestPassword: true, mechanisms: [ '$MONGO_APP_USER_AUTH_METHOD' ] })"