'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const mongodb = require('mongodb');
const db = require('../../../dist/db/services/db');
const handlerIndex = require('../../../dist/db/handlers/index');
const socketServer = require('../../../dist/sharedLibs/utils/socketServer');
const logger = require('../../../dist/sharedLibs/services/logger');
const queue = require('../../../dist/sharedLibs/utils/queue');

describe('DB - index', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyStubs;

  beforeEach(function () {
    doubles = {
      mongodbStub: {
        connect: sandbox.stub(mongodb,'connect'),
      },
      dbStub: sandbox.stub(db),
      handlerIndexStub: sandbox.stub(handlerIndex),
      socketServerStub: sandbox.stub(socketServer),
      loggerStub: sandbox.stub(logger),
      queueStub: sandbox.stub(queue),
      eventTypes: {
        DB_INSERT_ONE: 'test db insert one constant',
        DB_FIND_ONE: 'test db find one constant',
        DB_FIND_ONE_UPDATE: 'test find one and update constant',
      },
      mongoClientStub: {
        db: sandbox.stub(),
      }
    };
    proxyStubs = {
      'mongodb': doubles.mongodbStub,
      './services/db': doubles.dbStub,
      './handlers/index': doubles.handlerIndexStub,
      '../sharedLibs/utils/socketServer': doubles.socketServerStub,
      '../sharedLibs/services/logger': doubles.loggerStub,
      '../sharedLibs/utils/queue': doubles.queueStub,
      '../sharedLibs/utils/eventTypes': doubles.eventTypes,
    };
  });

  afterEach(function () {
    sandbox.restore();
    delete process.env.DB_CONNECT_URL;
    delete process.env.MONGO_DB_NAME;
    delete process.env.SOCKET_SERVER_PORT;
    delete process.env.QUEUE_CON_URL;
  });

  describe('if the DB_CONNECT_URL env variable is set', function () {
    beforeEach(function () {
      process.env.DB_CONNECT_URL = 'test db connect URL';
    });

    it('should call connect() of the mongodb module once', function () {
      doubles.mongodbStub.connect.returns(Promise.resolve());
      proxyquire('../../../dist/db/index', proxyStubs);
      assert.isTrue(doubles.mongodbStub.connect.calledOnce);
    });
    
    it('should call connect() of the mongodb module with 2 arguments', function () {
      doubles.mongodbStub.connect.returns(Promise.resolve());
      proxyquire('../../../dist/db/index', proxyStubs);
      assert.strictEqual(doubles.mongodbStub.connect.args[0].length, 2);
    });

    describe('first argument', function () {
      it('should be the value of the DB_CONNECT_URL env variable', function () {
        doubles.mongodbStub.connect.returns(Promise.resolve());
        proxyquire('../../../dist/db/index', proxyStubs);
        assert.strictEqual(doubles.mongodbStub.connect.args[0][0], 'test db connect URL');
      });
    });
    
    describe('second argument', function () {
      it('should be an object with the correct options', function () {
        doubles.mongodbStub.connect.returns(Promise.resolve());
        proxyquire('../../../dist/db/index', proxyStubs);
        assert.deepEqual(
          doubles.mongodbStub.connect.args[0][1],
          { useNewUrlParser: true }
        );
      });
    });

    describe('if the call to connect() of the mongodb module returns a promise that rejects', function () {
      it('should call the error() function of the logger module once', function () {
        const testError = new Error('test error message');
        doubles.mongodbStub.connect.returns(Promise.reject(testError));
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger module with 1 argument', function () {
        const testError = new Error('test error message');
        doubles.mongodbStub.connect.returns(Promise.reject(testError));
        proxyquire('../../../dist/db/index', proxyStubs);
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
      
      it('should call the error() function of the logger module with the error message in the "message" property', function () {
        const testError = new Error('test error message');
        doubles.mongodbStub.connect.returns(Promise.reject(testError));
        proxyquire('../../../dist/db/index', proxyStubs);
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
      
      it('should call the error() function of the logger module with the Error object in the "payload" property', function () {
        const testError = new Error('test error message');
        doubles.mongodbStub.connect.returns(Promise.reject(testError));
        proxyquire('../../../dist/db/index', proxyStubs);
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
    })

    describe('if the call to connect() of the mongodb module returns a promise that resolves', function () {
      it('should call the info() function of the logger once', function () {
        const returnedPromise = Promise.resolve();
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.isTrue(doubles.loggerStub.info.calledOnce);
          })
        );
      });
      
      it('should call the info() function of the logger with 1 argument', function () {
        const returnedPromise = Promise.resolve();
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.loggerStub.info.args[0].length, 1);
          })
        );
      });
      
      it('should call the info() function of the logger with a custom message in the "message" property', function () {
        const returnedPromise = Promise.resolve();
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.loggerStub.info.args[0][0].message, 'Connected to MongoDB');
          })
        );
      });

      it('should call the db() function of the object of the resolved promise once', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.isTrue(doubles.mongoClientStub.db.calledOnce);
          })
        );
      });
      
      it('should call the db() function of the object of the resolved promise with 1 argument', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.mongoClientStub.db.args[0].length, 1);
          })
        );
      });
      
      it('should call the db() function of the object of the resolved promise with the value of the MONGO_DB_NAME env variable', function () {
        process.env.MONGO_DB_NAME = 'test mongo db name';
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.mongoClientStub.db.args[0][0], 'test mongo db name');
          })
        );
      });

      it('should call the default export of the db module once', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.isTrue(doubles.dbStub.default.calledOnce);
          })
        );
      });
      
      it('should call the default export of the db module with 1 argument', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.dbStub.default.args[0].length, 1);
          })
        );
      });
      
      it('should call the default export of the db module with the return value of the db() function', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        const testMongoClient = {};
        doubles.mongoClientStub.db.returns(testMongoClient);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.dbStub.default.args[0][0], testMongoClient);
          })
        );
      });
      
      it('should call the default export of the handlers/index module once', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        const testDbService = {};
        doubles.dbStub.default.returns(testDbService);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.isTrue(doubles.handlerIndexStub.default.calledOnce);
          })
        );
      });
      
      it('should call the default export of the handlers/index module with 1 argument', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        const testDbService = {};
        doubles.dbStub.default.returns(testDbService);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.handlerIndexStub.default.args[0].length, 1);
          })
        );
      });
      
      it('should call the default export of the handlers/index module with the return value of the default export of the db module', function () {
        const returnedPromise = Promise.resolve(doubles.mongoClientStub);
        doubles.mongodbStub.connect.returns(returnedPromise);
        const testDbService = {};
        doubles.dbStub.default.returns(testDbService);
        proxyquire('../../../dist/db/index', proxyStubs);
        return(
          returnedPromise
          .then(function () {
            assert.strictEqual(doubles.handlerIndexStub.default.args[0][0], testDbService);
          })
        );
      });

      describe('if the SOCKET_SERVER_PORT env variable is set', function () {
        beforeEach(function () {
          process.env.SOCKET_SERVER_PORT = '23746897';
        });

        it('should call the default export of the socketServer module once', function () {
          const returnedPromise = Promise.resolve(doubles.mongoClientStub);
          doubles.mongodbStub.connect.returns(returnedPromise);
          const testHandlers = {};
          doubles.handlerIndexStub.default.returns(testHandlers);
          proxyquire('../../../dist/db/index', proxyStubs);
          return(
            returnedPromise
            .then(function () {
              assert.isTrue(doubles.socketServerStub.default.calledOnce);
            })
          );
        });
        
        it('should call the default export of the socketServer module with 3 arguments', function () {
          const returnedPromise = Promise.resolve(doubles.mongoClientStub);
          doubles.mongodbStub.connect.returns(returnedPromise);
          const testHandlers = {};
          doubles.handlerIndexStub.default.returns(testHandlers);
          proxyquire('../../../dist/db/index', proxyStubs);
          return(
            returnedPromise
            .then(function () {
              assert.strictEqual(doubles.socketServerStub.default.args[0].length, 3);
            })
          );
        });
        
        describe('first argument', function () {
          it('should be a function', function () {
            const returnedPromise = Promise.resolve(doubles.mongoClientStub);
            doubles.mongodbStub.connect.returns(returnedPromise);
            const testHandlers = {};
            doubles.handlerIndexStub.default.returns(testHandlers);
            proxyquire('../../../dist/db/index', proxyStubs);
            return(
              returnedPromise
              .then(function () {
                assert.typeOf(doubles.socketServerStub.default.args[0][0], 'function');
              })
            );
          });

          describe('if called with a Socket object', function () {
            let socketStub;
            beforeEach(function () {
              socketStub = {
                on: sandbox.stub(),
              };
            });

            it('should call its on() function 3 times', function () {
              const returnedPromise = Promise.resolve(doubles.mongoClientStub);
              doubles.mongodbStub.connect.returns(returnedPromise);
              const testHandlers = {};
              doubles.handlerIndexStub.default.returns(testHandlers);
              proxyquire('../../../dist/db/index', proxyStubs);
              return(
                returnedPromise
                .then(function () {
                  doubles.socketServerStub.default.args[0][0](socketStub);
                  assert.strictEqual(socketStub.on.callCount, 3);
                })
              );
            });

            describe('first call', function () {
              it('should call it with 2 arguments', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {};
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[0].length, 2);
                  })
                );
              });
              
              it('should call it with the DB_INSERT_ONE event constant as the first argument', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {};
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[0][0], doubles.eventTypes.DB_INSERT_ONE);
                  })
                );
              });
              
              it('should call it with the dbInsertOne() function of the handlers as the second argument', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {
                  dbInsertOne: sandbox.stub(),
                };
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[0][1], testHandlers.dbInsertOne);
                  })
                );
              });
            });

            describe('second call', function () {
              it('should call it with 2 arguments', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {};
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[1].length, 2);
                  })
                );
              });
              
              it('should call it with the DB_FIND_ONE event constant as the first argument', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {};
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[1][0], doubles.eventTypes.DB_FIND_ONE);
                  })
                );
              });
              
              it('should call it with the dbFindOne() function of the handlers as the second argument', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {
                  dbFindOne: sandbox.stub(),
                };
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[1][1], testHandlers.dbFindOne);
                  })
                );
              });
            });
            
            describe('third call', function () {
              it('should call it with 2 arguments', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {};
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[2].length, 2);
                  })
                );
              });
              
              it('should call it with the DB_FIND_ONE_UPDATE event constant as the first argument', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {};
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[2][0], doubles.eventTypes.DB_FIND_ONE_UPDATE);
                  })
                );
              });
              
              it('should call it with the dbFindOneUpdate() function of the handlers as the second argument', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                const testHandlers = {
                  dbFindOneUpdate: sandbox.stub(),
                };
                doubles.handlerIndexStub.default.returns(testHandlers);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.socketServerStub.default.args[0][0](socketStub);
                    assert.strictEqual(socketStub.on.args[2][1], testHandlers.dbFindOneUpdate);
                  })
                );
              });
            });
          });
        });

        describe('second argument', function () {
          it('should be the numeric value of the SOCKET_SERVER_PORT env variable', function () {
            const returnedPromise = Promise.resolve(doubles.mongoClientStub);
            doubles.mongodbStub.connect.returns(returnedPromise);
            const testHandlers = {};
            doubles.handlerIndexStub.default.returns(testHandlers);
            proxyquire('../../../dist/db/index', proxyStubs);
            return(
              returnedPromise
              .then(function () {
                assert.strictEqual(doubles.socketServerStub.default.args[0][1], 23746897);
              })
            );
          });
        });
        
        describe('third argument', function () {
          it('should be an object with the correct options', function () {
            const returnedPromise = Promise.resolve(doubles.mongoClientStub);
            doubles.mongodbStub.connect.returns(returnedPromise);
            const testHandlers = {};
            doubles.handlerIndexStub.default.returns(testHandlers);
            proxyquire('../../../dist/db/index', proxyStubs);
            return(
              returnedPromise
              .then(function () {
                assert.deepEqual(
                  doubles.socketServerStub.default.args[0][2],
                  {
                    path: '/',
                    cookie: false,
                  }
                );
              })
            );
          });
        });
      });

      describe('if the QUEUE_CON_URL env variable is set', function () {
        beforeEach(function () {
          process.env.QUEUE_CON_URL = 'test queue connection URL';
        });

        it('should call the connectWithRetry() function of the queue module once', function () {
          const returnedPromise = Promise.resolve(doubles.mongoClientStub);
          doubles.mongodbStub.connect.returns(returnedPromise);
          proxyquire('../../../dist/db/index', proxyStubs);
          return(
            returnedPromise
            .then(function () {
              assert.isTrue(doubles.queueStub.connectWithRetry.calledOnce);
            })
          );
        });
        
        it('should call the connectWithRetry() function of the queue module with 1 argument', function () {
          const returnedPromise = Promise.resolve(doubles.mongoClientStub);
          doubles.mongodbStub.connect.returns(returnedPromise);
          proxyquire('../../../dist/db/index', proxyStubs);
          return(
            returnedPromise
            .then(function () {
              assert.strictEqual(doubles.queueStub.connectWithRetry.args[0].length, 1);
            })
          );
        });

        it('should call the connectWithRetry() function of the queue module with QUEUE_CON_URL env variable in the "connectionURL" property', function () {
          const returnedPromise = Promise.resolve(doubles.mongoClientStub);
          doubles.mongodbStub.connect.returns(returnedPromise);
          proxyquire('../../../dist/db/index', proxyStubs);
          return(
            returnedPromise
            .then(function () {
              assert.strictEqual(
                doubles.queueStub.connectWithRetry.args[0][0].connectionURL,
                'test queue connection URL'
              );
            })
          );
        });
        
        it('should call the connectWithRetry() function of the queue module with an array of 1 element in the "consumeQueues" property', function () {
          const returnedPromise = Promise.resolve(doubles.mongoClientStub);
          doubles.mongodbStub.connect.returns(returnedPromise);
          proxyquire('../../../dist/db/index', proxyStubs);
          return(
            returnedPromise
            .then(function () {
              assert.strictEqual(
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues.length,
                1
              );
            })
          );
        });

        describe('first element of the array', function () {
          it('should have the "db" queueName', function () {
            const returnedPromise = Promise.resolve(doubles.mongoClientStub);
            doubles.mongodbStub.connect.returns(returnedPromise);
            proxyquire('../../../dist/db/index', proxyStubs);
            return(
              returnedPromise
              .then(function () {
                assert.strictEqual(
                  doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].queueName,
                  'db'
                );
              })
            );
          });
          
          it('should have "db" in the "queueName" property', function () {
            const returnedPromise = Promise.resolve(doubles.mongoClientStub);
            doubles.mongodbStub.connect.returns(returnedPromise);
            proxyquire('../../../dist/db/index', proxyStubs);
            return(
              returnedPromise
              .then(function () {
                assert.strictEqual(
                  doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].queueName,
                  'db'
                );
              })
            );
          });
          
          it('should have a function in the "handler" property', function () {
            const returnedPromise = Promise.resolve(doubles.mongoClientStub);
            doubles.mongodbStub.connect.returns(returnedPromise);
            proxyquire('../../../dist/db/index', proxyStubs);
            return(
              returnedPromise
              .then(function () {
                assert.typeOf(
                  doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler,
                  'function'
                );
              })
            );
          });

          describe('function provided in the "handler" property', function () {
            beforeEach(function () {
              doubles.queueStub.parsePayload.returns(JSON.stringify({ key1: 'value1' }));
              doubles.handlerIndexStub.default.returns({
                dbInsertOne: sandbox.stub(),
              });
            });

            it('should call the parsePayload() function of the queue module once', function () {
              const returnedPromise = Promise.resolve(doubles.mongoClientStub);
              doubles.mongodbStub.connect.returns(returnedPromise);
              proxyquire('../../../dist/db/index', proxyStubs);
              return(
                returnedPromise
                .then(function () {
                  doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                  assert.isTrue(doubles.queueStub.parsePayload.calledOnce);
                })
              );
            });
            
            it('should call the parsePayload() function of the queue module with 1 argument', function () {
              const returnedPromise = Promise.resolve(doubles.mongoClientStub);
              doubles.mongodbStub.connect.returns(returnedPromise);
              proxyquire('../../../dist/db/index', proxyStubs);
              return(
                returnedPromise
                .then(function () {
                  doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                  assert.strictEqual(doubles.queueStub.parsePayload.args[0].length, 1);
                })
              );
            });
            
            it('should call the parsePayload() function of the queue module with the value of the "content" property of the provided object in the "data" property', function () {
              const returnedPromise = Promise.resolve(doubles.mongoClientStub);
              doubles.mongodbStub.connect.returns(returnedPromise);
              proxyquire('../../../dist/db/index', proxyStubs);
              return(
                returnedPromise
                .then(function () {
                  const testRawMessage = { content: {} };
                  doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(testRawMessage);
                  assert.strictEqual(doubles.queueStub.parsePayload.args[0][0].data, testRawMessage.content);
                })
              );
            });

            describe('if the JSON parsed version of the parsePayload() result has the DB_INSERT_ONE constant in the "type" property', function () {
              let testHandlers;
              beforeEach(function () {
                doubles.queueStub.parsePayload.returns(JSON.stringify({
                  type: doubles.eventTypes.DB_INSERT_ONE,
                  requeue: true,
                  payload: 'test event payload',
                }));
                testHandlers = {
                  dbInsertOne: sandbox.stub(),
                };
                doubles.handlerIndexStub.default.returns(testHandlers);
              });

              it('should call the dbInsertOne() function of the handlers once', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                    assert.isTrue(testHandlers.dbInsertOne.calledOnce);
                  })
                );
              });
              
              it('should call the dbInsertOne() function of the handlers with 2 arguments', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                    assert.strictEqual(testHandlers.dbInsertOne.args[0].length, 2);
                  })
                );
              });

              describe('first argument', function () {
                it('should be the "payload" property of the JSON parsed version parsePayload() return value', function () {
                  const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                  doubles.mongodbStub.connect.returns(returnedPromise);
                  proxyquire('../../../dist/db/index', proxyStubs);
                  return(
                    returnedPromise
                    .then(function () {
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                      assert.strictEqual(testHandlers.dbInsertOne.args[0][0], 'test event payload');
                    })
                  );
                });
              });
              
              describe('second argument', function () {
                it('should be a function', function () {
                  const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                  doubles.mongodbStub.connect.returns(returnedPromise);
                  proxyquire('../../../dist/db/index', proxyStubs);
                  return(
                    returnedPromise
                    .then(function () {
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                      assert.typeOf(testHandlers.dbInsertOne.args[0][1], 'function');
                    })
                  );
                });

                describe('if it is called with null', function () {
                  it('should call the ackMessage() function of the queue module once', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbInsertOne.args[0][1](null);
                        assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                      })
                    );
                  });
                  
                  it('should call the ackMessage() function of the queue module with 1 argument', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbInsertOne.args[0][1](null);
                        assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                      })
                    );
                  });
                  
                  it('should call the ackMessage() function of the queue module with the object provided to the consueQueues "handler" callback in the "message" property', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        const testRawMessage = { content: '' };
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(testRawMessage);
                        testHandlers.dbInsertOne.args[0][1](null);
                        assert.strictEqual(doubles.queueStub.ackMessage.args[0][0].message, testRawMessage);
                      })
                    );
                  });

                  it('should not call the nackMessage() function of the queue module', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbInsertOne.args[0][1](null);
                        assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                      })
                    );
                  });
                });

                describe('if it is called with an Error object', function () {
                  it('should call the nackMessage() function of the queue module once', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbInsertOne.args[0][1](new Error('test error message'));
                        assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                      })
                    );
                  });
                  
                  it('should call the nackMessage() function of the queue module with 1 argument', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbInsertOne.args[0][1](new Error('test error message'));
                        assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                      })
                    );
                  });
                  
                  it('should call the nackMessage() function of the queue module with the object provided to the consueQueues "handler" callback in the "message" property', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        const testRawMessage = { content: '' };
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(testRawMessage);
                        testHandlers.dbInsertOne.args[0][1](new Error('test error message'));
                        assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, testRawMessage);
                      })
                    );
                  });
                  
                  describe('if the "requeue" property of the raw message content is TRUE', function () {
                    it('should call the nackMessage() function of the queue module with TRUE in the "requeue" property', function () {
                      doubles.queueStub.parsePayload.returns(JSON.stringify({
                        type: doubles.eventTypes.DB_INSERT_ONE,
                        requeue: true,
                        payload: 'test event payload',
                      }));
                      const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                      doubles.mongodbStub.connect.returns(returnedPromise);
                      proxyquire('../../../dist/db/index', proxyStubs);
                      return(
                        returnedPromise
                        .then(function () {
                          doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                          testHandlers.dbInsertOne.args[0][1](new Error('test error message'));
                          assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                        })
                      );
                    });
                  });
                  
                  describe('if the "requeue" property of the raw message content is FALSE', function () {
                    it('should call the nackMessage() function of the queue module with FALSE in the "requeue" property', function () {
                      doubles.queueStub.parsePayload.returns(JSON.stringify({
                        type: doubles.eventTypes.DB_INSERT_ONE,
                        requeue: false,
                        payload: 'test event payload',
                      }));
                      const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                      doubles.mongodbStub.connect.returns(returnedPromise);
                      proxyquire('../../../dist/db/index', proxyStubs);
                      return(
                        returnedPromise
                        .then(function () {
                          doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                          testHandlers.dbInsertOne.args[0][1](new Error('test error message'));
                          assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
                        })
                      );
                    });
                  });
                });
              });
            });

            describe('if the JSON parsed version of the parsePayload() result has the DB_FIND_ONE_UPDATE constant in the "type" property', function () {
              let testHandlers;
              beforeEach(function () {
                doubles.queueStub.parsePayload.returns(JSON.stringify({
                  type: doubles.eventTypes.DB_FIND_ONE_UPDATE,
                  requeue: true,
                  payload: 'test event payload',
                }));
                testHandlers = {
                  dbFindOneUpdate: sandbox.stub(),
                };
                doubles.handlerIndexStub.default.returns(testHandlers);
              });

              it('should call the dbFindOneUpdate() function of the handlers once', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                    assert.isTrue(testHandlers.dbFindOneUpdate.calledOnce);
                  })
                );
              });
              
              it('should call the dbFindOneUpdate() function of the handlers with 2 arguments', function () {
                const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                doubles.mongodbStub.connect.returns(returnedPromise);
                proxyquire('../../../dist/db/index', proxyStubs);
                return(
                  returnedPromise
                  .then(function () {
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                    assert.strictEqual(testHandlers.dbFindOneUpdate.args[0].length, 2);
                  })
                );
              });

              describe('first argument', function () {
                beforeEach(function () {
                  doubles.queueStub.parsePayload.returns(JSON.stringify({
                    type: doubles.eventTypes.DB_FIND_ONE_UPDATE,
                    requeue: true,
                    payload: 'test event payload',
                  }));
                });

                it('should be the "payload" property of the JSON parsed version of the return value from the call to parsePayload() of the queue module', function () {
                  const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                  doubles.mongodbStub.connect.returns(returnedPromise);
                  proxyquire('../../../dist/db/index', proxyStubs);
                  return(
                    returnedPromise
                    .then(function () {
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                      assert.strictEqual(testHandlers.dbFindOneUpdate.args[0][0], 'test event payload');
                    })
                  );
                });
              });

              describe('second argument', function () {
                beforeEach(function () {
                  doubles.queueStub.parsePayload.returns(JSON.stringify({
                    type: doubles.eventTypes.DB_FIND_ONE_UPDATE,
                    requeue: true,
                    payload: 'test event payload',
                  }));
                });

                it('should be a function', function () {
                  const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                  doubles.mongodbStub.connect.returns(returnedPromise);
                  proxyquire('../../../dist/db/index', proxyStubs);
                  return(
                    returnedPromise
                    .then(function () {
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                      assert.typeOf(testHandlers.dbFindOneUpdate.args[0][1], 'function');
                    })
                  );
                });

                describe('if it is called with null', function () {
                  it('should call the ackMessage() function of the queue module once', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbFindOneUpdate.args[0][1](null);
                        assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                      })
                    );
                  });
                  
                  it('should call the ackMessage() function of the queue module with 1 argument', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbFindOneUpdate.args[0][1](null);
                        assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                      })
                    );
                  });
                  
                  it('should call the ackMessage() function of the queue module with the object provided to the consueQueues "handler" callback in the "message" property', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        const testRawMessage = { content: '' };
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(testRawMessage);
                        testHandlers.dbFindOneUpdate.args[0][1](null);
                        assert.strictEqual(doubles.queueStub.ackMessage.args[0][0].message, testRawMessage);
                      })
                    );
                  });

                  it('should not call the nackMessage() function of the queue module', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbFindOneUpdate.args[0][1](null);
                        assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                      })
                    );
                  });
                });

                describe('if it is called with an Error object', function () {
                  it('should call the nackMessage() function of the queue module once', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbFindOneUpdate.args[0][1](new Error('test error message'));
                        assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                      })
                    );
                  });
                  
                  it('should call the nackMessage() function of the queue module with 1 argument', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                        testHandlers.dbFindOneUpdate.args[0][1](new Error('test error message'));
                        assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                      })
                    );
                  });
                  
                  it('should call the nackMessage() function of the queue module with the object provided to the consueQueues "handler" callback in the "message" property', function () {
                    const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                    doubles.mongodbStub.connect.returns(returnedPromise);
                    proxyquire('../../../dist/db/index', proxyStubs);
                    return(
                      returnedPromise
                      .then(function () {
                        const testRawMessage = { content: '' };
                        doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(testRawMessage);
                        testHandlers.dbFindOneUpdate.args[0][1](new Error('test error message'));
                        assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, testRawMessage);
                      })
                    );
                  });
                  
                  describe('if the "requeue" property of the raw message content is TRUE', function () {
                    it('should call the nackMessage() function of the queue module with TRUE in the "requeue" property', function () {
                      doubles.queueStub.parsePayload.returns(JSON.stringify({
                        type: doubles.eventTypes.DB_FIND_ONE_UPDATE,
                        requeue: true,
                        payload: 'test event payload',
                      }));
                      const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                      doubles.mongodbStub.connect.returns(returnedPromise);
                      proxyquire('../../../dist/db/index', proxyStubs);
                      return(
                        returnedPromise
                        .then(function () {
                          doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                          testHandlers.dbFindOneUpdate.args[0][1](new Error('test error message'));
                          assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                        })
                      );
                    });
                  });
                  
                  describe('if the "requeue" property of the raw message content is FALSE', function () {
                    it('should call the nackMessage() function of the queue module with FALSE in the "requeue" property', function () {
                      doubles.queueStub.parsePayload.returns(JSON.stringify({
                        type: doubles.eventTypes.DB_FIND_ONE_UPDATE,
                        requeue: false,
                        payload: 'test event payload',
                      }));
                      const returnedPromise = Promise.resolve(doubles.mongoClientStub);
                      doubles.mongodbStub.connect.returns(returnedPromise);
                      proxyquire('../../../dist/db/index', proxyStubs);
                      return(
                        returnedPromise
                        .then(function () {
                          doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler({ content: '' });
                          testHandlers.dbFindOneUpdate.args[0][1](new Error('test error message'));
                          assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
                        })
                      );
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});