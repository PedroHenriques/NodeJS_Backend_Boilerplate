# Changelog

## [1.1.0] - 2018-11-22
### Added
- Added migrations for the MongoDB database
- Added schema validation to the users collection in MongoDB
- Added authentication to the MongoDB docker container
- Added setup script to the MongoDB container that creates the user used by the application, on container bootup

### Changed
- Moved the typescript interfaces defining the DB schema for the users collection into a dedicated file
- Cleaned up docker containers directory structure, in development environment
- Updated docker-compose and Dockerfiles to match new container directory structure

### Fixed
- Fixed typo in an interface file, in the webServer service

## [1.0.1] - 2018-11-19
### Fixed
- Fixed typo in environment variable use in the code

## [1.0.0] - 2018-11-19
### Added
- First version of the code