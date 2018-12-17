'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const fileHandlers = require('../../../../dist/sharedLibs/utils/fileHandlers');
const logger = require('../../../../dist/sharedLibs/services/logger');
const cacheEventDispatchers = require('../../../../dist/sharedLibs/utils/cacheEventDispatchers');
const queue = require('../../../../dist/sharedLibs/utils/queue');

describe('ConfigLoader - configLoader service', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyConfigLoader;

  beforeEach(function () {
    sandbox.useFakeTimers({
      toFake: [ 'setInterval', 'clearInterval' ]
    });
    doubles = {
      fileHandlersStub: sandbox.stub(fileHandlers),
      loggerStub: sandbox.stub(logger),
      cacheEventDispatchersStub: sandbox.stub(cacheEventDispatchers),
      queueStub: sandbox.stub(queue),
    };
    proxyConfigLoader = proxyquire('../../../../dist/configLoader/services/configLoader.js', {
      '../../sharedLibs/utils/fileHandlers': doubles.fileHandlersStub,
      '../../sharedLibs/services/logger': doubles.loggerStub,
      '../../sharedLibs/utils/cacheEventDispatchers': doubles.cacheEventDispatchersStub,
      '../../sharedLibs/utils/queue': doubles.queueStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
    delete process.env.SLEEP_MS;
  });

  describe('configLoader()', function () {
    it('should return an object', function () {
      assert.typeOf(proxyConfigLoader.default({}), 'Object');
    });

    describe('returned object', function () {
      it('should have an "endCheckUp" property', function () {
        assert.property(proxyConfigLoader.default({}), 'endCheckUp');
      });

      it('should have an "startCheckUp" property', function () {
        assert.property(proxyConfigLoader.default({}), 'startCheckUp');
      });

      describe('"startCheckUp" property', function () {
        it('should be a function', function () {
          assert.typeOf(proxyConfigLoader.default({}).startCheckUp, 'function');
        });

        it('should return void', function () {
          const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
          assert.isUndefined(configLoader.startCheckUp());
        });

        it('should call the debug() function of the logger once', function () {
          const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
          configLoader.startCheckUp();
          assert.isTrue(doubles.loggerStub.debug.calledOnce);
        });

        it('should call the debug() function of the logger with 1 argument', function () {
          const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
          configLoader.startCheckUp();
          assert.strictEqual(doubles.loggerStub.debug.args[0].length, 1);
        });

        it('should call the debug() function of the logger with a custom message', function () {
          const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
          configLoader.startCheckUp();
          assert.deepEqual(doubles.loggerStub.debug.args[0][0], { message: 'Starting file checkup' });
        });

        it('should set 1 interval', function () {
          const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
          configLoader.startCheckUp();
          assert.strictEqual(Object.getOwnPropertyNames(sandbox.clock.timers).length, 1);
        });

        describe('if the "SLEEP_MS" env variable is set', function () {
          it('should set 1 interval with that env variable value as the interval', function () {
            process.env.SLEEP_MS = 9999999;
            const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
            configLoader.startCheckUp();
            const timerKeys = Object.getOwnPropertyNames(sandbox.clock.timers);
            assert.strictEqual(
              sandbox.clock.timers[timerKeys[0]].interval,
              9999999
            );
          });
        });
        
        describe('if the "SLEEP_MS" env variable is not set', function () {
          it('should set 1 interval with 30000 as the interval', function () {
            const configLoader = proxyConfigLoader.default({ filesToWatch: {} });
            configLoader.startCheckUp();
            const timerKeys = Object.getOwnPropertyNames(sandbox.clock.timers);
            assert.strictEqual(
              sandbox.clock.timers[timerKeys[0]].interval,
              30000
            );
          });
        });

        describe('if 1 file to be watched was provided', function () {
          let channelObject;
          beforeEach(function () {
            channelObject = {};
            doubles.queueStub.channel = channelObject;
          });
          
          it('should call the getFileStats() function of the fileHandlers module once', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.isTrue(doubles.fileHandlersStub.getFileStats.calledOnce));
                }, 1);
              })
            );
          });
          
          it('should call the getFileStats() function of the fileHandlers module with 1 argument', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(doubles.fileHandlersStub.getFileStats.args[0].length, 1));
                }, 1);
              })
            );
          });
          
          it('should call the getFileStats() function of the fileHandlers module with the path of the file to watch', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            
            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(doubles.fileHandlersStub.getFileStats.args[0][0], 'path/to/file1.json'));
                }, 1);
              })
            );
          });
          
          it('should call the info() function of the logger twice', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(
                    doubles.loggerStub.info.callCount,
                    2
                  ));
                }, 1);
              })
            );
          });
          
          describe('first call', function () {
            it('should call the info() function of the logger with 1 argument', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.info.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the info() function of the logger with a custom message', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.deepEqual(
                      doubles.loggerStub.info.args[0][0],
                      { message: 'File path/to/file1.json change detected.' }
                    ));
                  }, 1);
                })
              );
            });
          });
          
          describe('second call', function () {
            it('should call the info() function of the logger with 1 argument', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.deepEqual(
                      doubles.loggerStub.info.args[1].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the info() function of the logger with a custom message', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.deepEqual(
                      doubles.loggerStub.info.args[1][0],
                      { message: 'File path/to/file1.json updated in cache.' }
                    ));
                  }, 1);
                })
              );
            });
          });
          
          it('should change the "lastModified" property of the file being watched to the file\'s modified time', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(filesToWatch.key1.lastModified, 1234567890));
                }, 1);
              })
            );
          });
          
          describe('if the file path points to a JSON file', function () {
            it('should call the parseJsonFile() function of the fileHandlers module once', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.fileHandlersStub.parseJsonFile.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the parseJsonFile() function of the fileHandlers module with 1 argument', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.fileHandlersStub.parseJsonFile.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the parseJsonFile() function of the fileHandlers module with the path of the file being watched', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.fileHandlersStub.parseJsonFile.args[0][0],
                      'path/to/file1.json'
                    ));
                  }, 1);
                })
              );
            });
          });

          it('should call the mqCacheStoreObject() function of the cache event dispatchers module once', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.isTrue(doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce));
                }, 1);
              })
            );
          });
          
          it('should call the mqCacheStoreObject() function of the cache event dispatchers module with 1 argument', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(
                    doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[0].length,
                    1
                  ));
                }, 1);
              })
            );
          });
          
          it('should call the mqCacheStoreObject() function of the cache event dispatchers module with the queue "channel" object in the "mqChannel" property', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(
                    doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[0][0].mqChannel,
                    channelObject
                  ));
                }, 1);
              })
            );
          });
          
          it('should call the mqCacheStoreObject() function of the cache event dispatchers module with the correct payload object in the "payload" property', function () {
            const parsedFileContent = {};

            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            doubles.fileHandlersStub.parseJsonFile.returns(parsedFileContent);

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.deepEqual(
                    doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[0][0].payload,
                    {
                      key: 'persistKey1',
                      value: parsedFileContent,
                    }
                  ));
                }, 1);
              })
            );
          });
          
          describe('if the queue "channel" object is undefined', function () {
            beforeEach(function () {
              doubles.queueStub.channel = undefined;
            });

            it('should call the error() function of the logger once', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 argument', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with the error message in the "message" property', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].message,
                      'Trying to dispatch event to queue but no channel with the message queue is created'
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with an Error object in the "payload" property', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.typeOf(
                      doubles.loggerStub.error.args[0][0].payload,
                      'Error'
                    ));
                  }, 1);
                })
              );
            });
            
            it('should not call the getFileStats() function of the fileHandlers module', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(
                      doubles.fileHandlersStub.getFileStats.calledOnce
                    ));
                  }, 1);
                })
              );
            });
            
            it('should not call the mqCacheStoreObject() function of the cache event dispatchers module', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce
                    ));
                  }, 1);
                })
              );
            });
          });

          describe('if the file being watched modified time is not greater than the value of the "lastModified" property for that file', function () {
            let filesToWatch;
            beforeEach(function () {
              filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: 7162347812364,
                  persistKey: 'persistKey1',
                },
              };

              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified,
              });
            });

            it('should not call the mqCacheStoreObject() function of the cache event dispatchers module', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce
                    ));
                  }, 1);
                })
              );
            });
          });

          describe('if the path of the file being watched points to a file with no extension', function () {
            let filesToWatch;
            beforeEach(function () {
              filesToWatch = {
                key1: {
                  path: 'path/to/file1',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
            });

            it('should call the error() function of the logger once', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 argument', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with the error message in the "message" property', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].message,
                      'The file type for "path/to/file1" could not be determined.'
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with an Error object in the "payload" property', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.typeOf(
                      doubles.loggerStub.error.args[0][0].payload,
                      'Error'
                    ));
                  }, 1);
                })
              );
            });

            it('should not call the mqCacheStoreObject() function of the cache event dispatchers module', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce
                    ));
                  }, 1);
                })
              );
            });
          });

          describe('if the path of the file being watched points to a file with an extension that is not supported', function () {
            let filesToWatch;
            beforeEach(function () {
              filesToWatch = {
                key1: {
                  path: 'path/to/file1.notSupportedExtension',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
            });

            it('should call the error() function of the logger once', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 argument', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with an error message in the "message" property', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].message,
                      'The file type "notSupportedExtension" is not an expected file type.'
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with an Error object in the "payload" property', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.typeOf(
                      doubles.loggerStub.error.args[0][0].payload,
                      'Error'
                    ));
                  }, 1);
                })
              );
            });

            it('should not call the mqCacheStoreObject() function of the cache event dispatchers module', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce
                    ));
                  }, 1);
                })
              );
            });
          });

          describe('if the file parser function returns void', function () {
            let filesToWatch;
            beforeEach(function () {
              filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve());
            });

            it('should not call the mqCacheStoreObject() function of the cache event dispatchers module', function () {
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce
                    ));
                  }, 1);
                })
              );
            });
          });

          describe('if the "getFileStats" function of the fileHandlers module returns a promise that rejects', function () {
            it('should call the error() function of the logger once', function () {
              const testError = new Error('test error message');
              doubles.fileHandlersStub.getFileStats.returns(Promise.reject(testError));
  
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 argument', function () {
              const testError = new Error('test error message');
              doubles.fileHandlersStub.getFileStats.returns(Promise.reject(testError));
  
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with the error message in the "message" property', function () {
              const testError = new Error('test error message');
              doubles.fileHandlersStub.getFileStats.returns(Promise.reject(testError));
  
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].message,
                      testError.message
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with the Error object in the "payload" property', function () {
              const testError = new Error('test error message');
              doubles.fileHandlersStub.getFileStats.returns(Promise.reject(testError));
  
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].payload,
                      testError
                    ));
                  }, 1);
                })
              );
            });

            it('should not call the "mqCacheStoreObject" function of the cacheEventDispatchers module', function () {
              const testError = new Error('test error message');
              doubles.fileHandlersStub.getFileStats.returns(Promise.reject(testError));
  
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce));
                  }, 1);
                })
              );
            });
          });

          describe('if the "parseJsonFile" function of the fileHandlers module returns a promise that rejects', function () {
            it('should call the error() function of the logger once', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');
              
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.reject(testError));
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 argument', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');

              doubles.fileHandlersStub.parseJsonFile.returns(Promise.reject(testError));
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with the error message in the "message" property', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');

              doubles.fileHandlersStub.parseJsonFile.returns(Promise.reject(testError));
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].message,
                      testError.message
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with the Error object in the "payload" property', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');

              doubles.fileHandlersStub.parseJsonFile.returns(Promise.reject(testError));
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].payload,
                      testError
                    ));
                  }, 1);
                })
              );
            });

            it('should not call the "mqCacheStoreObject" function of the cacheEventDispatchers module', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');

              doubles.fileHandlersStub.parseJsonFile.returns(Promise.reject(testError));
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isFalse(doubles.cacheEventDispatchersStub.mqCacheStoreObject.calledOnce));
                  }, 1);
                })
              );
            });
          });

          describe('if the "mqCacheStoreObject" function of the cacheEventDispatchers module returns a promise that rejects', function () {
            it('should call the error() function of the logger once', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');
              
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));
              doubles.cacheEventDispatchersStub.mqCacheStoreObject.returns(Promise.reject(testError));
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 argument', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');
              
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));
              doubles.cacheEventDispatchersStub.mqCacheStoreObject.returns(Promise.reject(testError));
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 the error message in the "message" property', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');
              
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));
              doubles.cacheEventDispatchersStub.mqCacheStoreObject.returns(Promise.reject(testError));
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].message,
                      testError.message
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call the error() function of the logger with 1 the Error object in the "payload" property', function () {
              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
              };
              const testError = new Error('test error message');
              
              doubles.fileHandlersStub.getFileStats.returns({
                mtimeMs: filesToWatch.key1.lastModified + 10,
              });
              doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));
              doubles.cacheEventDispatchersStub.mqCacheStoreObject.returns(Promise.reject(testError));
  
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.loggerStub.error.args[0][0].payload,
                      testError
                    ));
                  }, 1);
                })
              );
            });
          });
        });

        describe('if 2 files to be watched was provided', function () {
          let channelObject;
          beforeEach(function () {
            channelObject = {};
            doubles.queueStub.channel = channelObject;
          });
          
          it('should call the mqCacheStoreObject() function of the cacheEventDispatchers module twice', function () {
            doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
              mtimeMs: 1234567890
            }));
            doubles.fileHandlersStub.parseJsonFile.returns(Promise.resolve({}));

            const filesToWatch = {
              key1: {
                path: 'path/to/file1.json',
                lastModified: -1,
                persistKey: 'persistKey1',
              },
              key2: {
                path: 'path/to/file2.json',
                lastModified: -1,
                persistKey: 'persistKey2',
              },
            };
            const configLoader = proxyConfigLoader.default({ filesToWatch });
            configLoader.startCheckUp();
            return(
              new Promise(function (resolve, reject) {
                global.setTimeout(function () {
                  resolve(assert.strictEqual(
                    doubles.cacheEventDispatchersStub.mqCacheStoreObject.callCount,
                    2
                  ));
                }, 1);
              })
            );
          });
          
          describe('first call', function () {
            it('should call it with 1 argument', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              const parsedFile1 = { key1: 'file 1 content' };
              const parsedFile2 = { key2: 'file 2 content' };
              doubles.fileHandlersStub.parseJsonFile.onCall(0).returns(Promise.resolve(parsedFile1));
              doubles.fileHandlersStub.parseJsonFile.onCall(1).returns(Promise.resolve(parsedFile2));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
                key2: {
                  path: 'path/to/file2.json',
                  lastModified: -1,
                  persistKey: 'persistKey2',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[0].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call it with the imported "channel" object in the "mqChannel" property', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              const parsedFile1 = { key1: 'file 1 content' };
              const parsedFile2 = { key2: 'file 2 content' };
              doubles.fileHandlersStub.parseJsonFile.onCall(0).returns(Promise.resolve(parsedFile1));
              doubles.fileHandlersStub.parseJsonFile.onCall(1).returns(Promise.resolve(parsedFile2));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
                key2: {
                  path: 'path/to/file2.json',
                  lastModified: -1,
                  persistKey: 'persistKey2',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[0][0].mqChannel,
                      channelObject
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call it with the correct data in the "payload" property', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              const parsedFile1 = { key1: 'file 1 content' };
              const parsedFile2 = { key2: 'file 2 content' };
              doubles.fileHandlersStub.parseJsonFile.onCall(0).returns(Promise.resolve(parsedFile1));
              doubles.fileHandlersStub.parseJsonFile.onCall(1).returns(Promise.resolve(parsedFile2));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
                key2: {
                  path: 'path/to/file2.json',
                  lastModified: -1,
                  persistKey: 'persistKey2',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.deepEqual(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[0][0].payload,
                      {
                        key: 'persistKey1',
                        value: parsedFile1,
                      }
                    ));
                  }, 1);
                })
              );
            });
          });

          describe('second call', function () {
            it('should call it with 1 argument', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              const parsedFile1 = { key1: 'file 1 content' };
              const parsedFile2 = { key2: 'file 2 content' };
              doubles.fileHandlersStub.parseJsonFile.onCall(0).returns(Promise.resolve(parsedFile1));
              doubles.fileHandlersStub.parseJsonFile.onCall(1).returns(Promise.resolve(parsedFile2));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
                key2: {
                  path: 'path/to/file2.json',
                  lastModified: -1,
                  persistKey: 'persistKey2',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[1].length,
                      1
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call it with the imported "channel" object in the "mqChannel" property', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              const parsedFile1 = { key1: 'file 1 content' };
              const parsedFile2 = { key2: 'file 2 content' };
              doubles.fileHandlersStub.parseJsonFile.onCall(0).returns(Promise.resolve(parsedFile1));
              doubles.fileHandlersStub.parseJsonFile.onCall(1).returns(Promise.resolve(parsedFile2));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
                key2: {
                  path: 'path/to/file2.json',
                  lastModified: -1,
                  persistKey: 'persistKey2',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[1][0].mqChannel,
                      channelObject
                    ));
                  }, 1);
                })
              );
            });
            
            it('should call it with the correct data in the "payload" property', function () {
              doubles.fileHandlersStub.getFileStats.returns(Promise.resolve({
                mtimeMs: 1234567890
              }));
              const parsedFile1 = { key1: 'file 1 content' };
              const parsedFile2 = { key2: 'file 2 content' };
              doubles.fileHandlersStub.parseJsonFile.onCall(0).returns(Promise.resolve(parsedFile1));
              doubles.fileHandlersStub.parseJsonFile.onCall(1).returns(Promise.resolve(parsedFile2));

              const filesToWatch = {
                key1: {
                  path: 'path/to/file1.json',
                  lastModified: -1,
                  persistKey: 'persistKey1',
                },
                key2: {
                  path: 'path/to/file2.json',
                  lastModified: -1,
                  persistKey: 'persistKey2',
                },
              };
              const configLoader = proxyConfigLoader.default({ filesToWatch });
              configLoader.startCheckUp();
              return(
                new Promise(function (resolve, reject) {
                  global.setTimeout(function () {
                    resolve(assert.deepEqual(
                      doubles.cacheEventDispatchersStub.mqCacheStoreObject.args[1][0].payload,
                      {
                        key: 'persistKey2',
                        value: parsedFile2,
                      }
                    ));
                  }, 1);
                })
              );
            });
          });
        });
      });

      describe('"endCheckUp" property', function () {
        it('should be a function', function () {
          assert.typeOf(proxyConfigLoader.default({}).endCheckUp, 'function');
        });

        it('should return void', function () {
          assert.isUndefined(proxyConfigLoader.default({}).endCheckUp());
        });

        describe('if it is called when no interval is set', function () {
          it('should not call clearInterval()', function () {
            sandbox.clock.clearInterval = sandbox.stub();
            proxyConfigLoader.default({}).endCheckUp();
            assert.isTrue(sandbox.clock.clearInterval.notCalled);
          });
        });
        
        describe('if it is called when an interval is set', function () {
          let configLoader;
          let intervalId;
          beforeEach(function () {
            intervalId = { id: 12234 };
            sandbox.clock.setInterval = sandbox.stub();
            sandbox.clock.setInterval.returns(intervalId);

            configLoader = proxyConfigLoader.default({ filesToWatch: {} });
            configLoader.startCheckUp();
          });

          it('should call clearInterval() once', function () {
            sandbox.clock.clearInterval = sandbox.stub();
            configLoader.endCheckUp();
            assert.isTrue(sandbox.clock.clearInterval.calledOnce);
          });
          
          it('should call clearInterval() with 1 argument', function () {
            sandbox.clock.clearInterval = sandbox.stub();
            configLoader.endCheckUp();
            assert.strictEqual(sandbox.clock.clearInterval.args[0].length, 1);
          });
          
          it('should call clearInterval() with the intervalId', function () {
            sandbox.clock.clearInterval = sandbox.stub();
            configLoader.endCheckUp();
            assert.strictEqual(
              sandbox.clock.clearInterval.args[0][0],
              intervalId
            );
          });
          
          it('should call clear the reference to the old intervalId', function () {
            sandbox.clock.clearInterval = sandbox.stub();
            configLoader.endCheckUp();
            configLoader.endCheckUp();
            assert.strictEqual(sandbox.clock.clearInterval.callCount, 1);
          });
        });
      });
    });
  });
});