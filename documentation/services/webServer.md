# webServer

## Overview

This service contains the server listening for external requests and has the API end points.  
It is built with `ExpressJS` as the HTTP(S) abstraction layer.

## API endpoints

The endpoint documentation is detailed in the `README.md` file.

## Socket Connections

This service creates socket connections with the following services:

- `cache`
- `mailer`
- `db`