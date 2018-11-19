# configLoader

## Overview

This service is responsible for reading application config files, load their contents into the cache and keep watch over those files for any changes.  
When any watched file is changed, the new content will be stored in the cache, replacing the old content.  

## Configuration

### Files to watch

The files to be loaded into the cache are defined in the `configLoader/index.ts` file, where the relevant file paths and their cache keys need to be defined.  

### File handlers

The files will need to be parsed, based on their extension and the associated fileHandler mapped to it.  

The mapping of file extension to handler is done in the `configLoader/services/configLoader.ts` file in the `fileTypeHandlers` constant.  

The file handlers are available in the `sharedLibs/utils/fileHandlers.ts` file.

This boilerplate comes with file handlers for the following extensions:  

- `JSON`

## Configuration files location

The Dockerfile for this service will run the command `COPY ./config/:./dist/config/`, which means that by default this boilerplate expects the configuration files to be in the `config` directory, at the project's root, and the paths for the files to watch should point to the `/src/dist/config` directory inside the container.

## Socket Connections

This service creates socket connections with the following service:  

- `cache`