'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const redis = require('redis');
const amqplib = require('amqplib');
const cacheFactory = require('../../../dist/cache/services/cache.js');
const handlerFactory = require('../../../dist/cache/handlers/index.js');
const socketServer = require('../../../dist/sharedLibs/utils/socketServer.js');
const queue = require('../../../dist/sharedLibs/utils/queue.js');

describe('Cache - entry point', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let testEventTypes = {};
  let proxyIndexStubs;

  beforeEach(function () {
    doubles = {
      redisStub: sandbox.stub(redis),
      amqplibStub: sandbox.stub(amqplib),
      cacheFactoryStub: sandbox.stub(cacheFactory),
      handlerFactoryStub: sandbox.stub(handlerFactory),
      socketServerStub: sandbox.stub(socketServer),
      queueStub: sandbox.stub(queue),
    };
    testEventTypes = {
      CACHE_GET_VALUE: 'cache get value test event',
      CACHE_STORE_VALUE: 'cache store value test event',
      CACHE_GET_OBJECT: 'cache get object test event',
      CACHE_STORE_OBJECT: 'cache store object test event',
      CACHE_STORE_OBJECT_IF_NX: 'cache store object in not exist test event',
      CACHE_EXPIRE_KEY: 'cache expire key test event',
      CACHE_DELETE_KEYS: 'cache delete keys test event',
      CACHE_KEYS_EXIST: 'cache keys exist test event',
    };
    proxyIndexStubs = {
      'redis': doubles.redisStub,
      'amqplib': doubles.amqplibStub,
      './services/cache': doubles.cacheFactoryStub,
      './handlers/index': doubles.handlerFactoryStub,
      '../sharedLibs/utils/socketServer': doubles.socketServerStub,
      '../sharedLibs/utils/eventTypes': testEventTypes,
      '../sharedLibs/utils/queue': doubles.queueStub,
    };
  });

  afterEach(function () {
    sandbox.restore();
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.SOCKET_SERVER_PORT;
    delete process.env.QUEUE_CON_URL;
  });

  it('should create one redis client', function () {
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.isTrue(doubles.redisStub.createClient.calledOnce);
  });

  it('should pass 1 argument to the redis client creator', function () {
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.strictEqual(doubles.redisStub.createClient.args[0].length, 1);
  });

  describe('if the "REDIS_HOST" and "REDIS_PORT" env variables are defined', function () {
    it('should provide them as "host" and "port" options to the redis client creator', function () {
      process.env.REDIS_HOST = 'test redis host';
      process.env.REDIS_PORT = '12345678901234567890';
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.deepEqual(
        doubles.redisStub.createClient.args[0][0],
        {
          host: 'test redis host',
          port: 12345678901234567890,
        }
      );
    });
  });
  
  describe('if the "REDIS_HOST" env variable is not defined', function () {
    it('should provide "redis" as the default "host" option to the redis client creator', function () {
      process.env.REDIS_PORT = '12345678901234567890';
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.deepEqual(
        doubles.redisStub.createClient.args[0][0],
        {
          host: 'redis',
          port: 12345678901234567890,
        }
      );
    });
  });

  describe('if the "REDIS_PORT" env variable is not defined', function () {
    it('should provide 6379 as the default "port" option to the redis client creator', function () {
      process.env.REDIS_HOST = 'test redis host';
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.deepEqual(
        doubles.redisStub.createClient.args[0][0],
        {
          host: 'test redis host',
          port: 6379,
        }
      );
    });
  });

  it('should call the cache service factory once', function () {
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.isTrue(doubles.cacheFactoryStub.default.calledOnce);
  });
  
  it('should call the cache service factory with one argument', function () {
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.strictEqual(doubles.cacheFactoryStub.default.args[0].length, 1);
  });

  it('should call the cache service factory with an instance of the redis client', function () {
    doubles.redisStub.createClient.returns('redis client instance');
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.strictEqual(doubles.cacheFactoryStub.default.args[0][0], 'redis client instance');
  });

  it('should call the handler factory once', function () {
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.isTrue(doubles.handlerFactoryStub.default.calledOnce);
  });

  it('should call the handler factory with one argument', function () {
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.strictEqual(doubles.handlerFactoryStub.default.args[0].length, 1);
  });

  it('should call the handler factory with an instance of the cache service', function () {
    doubles.cacheFactoryStub.default.returns('cache service instance');
    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
    assert.strictEqual(doubles.handlerFactoryStub.default.args[0][0], 'cache service instance');
  });

  describe('if the "SOCKET_SERVER_PORT" env variable is not provided', function () {
    it('should not create a socket server', function () {
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.isTrue(doubles.socketServerStub.default.notCalled);
    });
  });

  describe('if the "SOCKET_SERVER_PORT" env variable is provided', function () {
    it('should call the socket server creator once', function () {
      process.env.SOCKET_SERVER_PORT = '111111111';
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.isTrue(doubles.socketServerStub.default.calledOnce);
    });

    it('should call the socket server creator with 3 arguments', function () {
      process.env.SOCKET_SERVER_PORT = '123';
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.strictEqual(doubles.socketServerStub.default.args[0].length, 3);
    });

    describe('first argument', function () {
      let socketStub;
      let handlersStubs;
      beforeEach(function () {
        socketStub = {
          on: sandbox.stub(),
        };
        handlersStubs = {
          cacheGetValueHandler: sandbox.stub(),
          cacheStoreValueHandler: sandbox.stub(),
          cacheGetObjectHandler: sandbox.stub(),
          cacheStoreObjectHandler: sandbox.stub(),
          cacheStoreObjectIfNotExistsHandler: sandbox.stub(),
          cacheExpireKeyHandler: sandbox.stub(),
          cacheDeleteKeysHandler: sandbox.stub(),
          cacheKeysExistHandler: sandbox.stub(),
        };
        doubles.handlerFactoryStub.default.returns(handlersStubs);
      });

      it('should be a function', function () {
        process.env.SOCKET_SERVER_PORT = '2222222';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        assert.typeOf(doubles.socketServerStub.default.args[0][0], 'function');
      });

      it('should register 8 event listeners when it is executed', function () {
        process.env.SOCKET_SERVER_PORT = '22222223333';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.strictEqual(socketStub.on.callCount, 8);
      });

      it('should register an event listener for the "CACHE_GET_VALUE" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '222222233334';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_GET_VALUE, handlersStubs.cacheGetValueHandler));
      });
      
      it('should register an event listener for the "CACHE_STORE_VALUE" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '2222222333344';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_STORE_VALUE, handlersStubs.cacheStoreValueHandler));
      });
      
      it('should register an event listener for the "CACHE_GET_OBJECT" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '22222223333444';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_GET_OBJECT, handlersStubs.cacheGetObjectHandler));
      });
      
      it('should register an event listener for the "CACHE_STORE_OBJECT" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '222222233334444';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_STORE_OBJECT, handlersStubs.cacheStoreObjectHandler));
      });
      
      it('should register an event listener for the "CACHE_STORE_OBJECT_IF_NX" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '2222222333344444';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_STORE_OBJECT_IF_NX, handlersStubs.cacheStoreObjectIfNotExistsHandler));
      });
      
      it('should register an event listener for the "CACHE_EXPIRE_KEY" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '22222223333444444';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_EXPIRE_KEY, handlersStubs.cacheExpireKeyHandler));
      });
      
      it('should register an event listener for the "CACHE_DELETE_KEYS" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '222222233334444444';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_DELETE_KEYS, handlersStubs.cacheDeleteKeysHandler));
      });
      
      it('should register an event listener for the "CACHE_KEYS_EXIST" event and the respective handler', function () {
        process.env.SOCKET_SERVER_PORT = '2222222333344444444';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        doubles.socketServerStub.default.args[0][0](socketStub);
        assert.isTrue(socketStub.on.calledWithExactly(testEventTypes.CACHE_KEYS_EXIST, handlersStubs.cacheKeysExistHandler));
      });
    });

    describe('second argument', function () {
      it('should be the number representing the value of the "SOCKET_SERVER_PORT" env variable', function () {
        process.env.SOCKET_SERVER_PORT = '12';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        assert.strictEqual(doubles.socketServerStub.default.args[0][1], 12);
      });
    });
    
    describe('third argument', function () {
      it('should be an object with the socket server\'s configuration options', function () {
        process.env.SOCKET_SERVER_PORT = '1233';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        assert.deepEqual(doubles.socketServerStub.default.args[0][2], { path: '/', cookie: false, });
      });
    });
  });

  describe('if the "QUEUE_CON_URL" env variable is not provided', function () {
    it('should not create a subsciption to the message queue', function () {
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.isTrue(doubles.queueStub.connectWithRetry.notCalled);
    });
  });
  
  describe('if the "QUEUE_CON_URL" env variable is provided', function () {
    it('should subscribe to the message queue once, with retry', function () {
      process.env.QUEUE_CON_URL = 'test queue connection url';
      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
      assert.isTrue(doubles.queueStub.connectWithRetry.calledOnce);
    });

    describe('arguments to the queue subscribe function', function () {
      it('should provide the queue connection URL', function () {
        process.env.QUEUE_CON_URL = 'another test queue connection url';
        proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
        assert.strictEqual(
          doubles.queueStub.connectWithRetry.args[0][0].connectionURL,
          'another test queue connection url'
        );
      });

      describe('queues to be consumed', function () {
        it('should specify 1 queue to be consumed', function () {
          process.env.QUEUE_CON_URL = 'yet another test queue connection url';
          proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
          assert.strictEqual(doubles.queueStub.connectWithRetry.args[0][0].consumeQueues.length, 1);
        });

        it('should set the "cache" queue to be consumed', function () {
          process.env.QUEUE_CON_URL = 'yet another test queue connection url';
          proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
          assert.strictEqual(doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].queueName, 'cache');
        });

        it('should provide a handler function for the "cache" queue messages', function () {
          process.env.QUEUE_CON_URL = 'yet another test queue connection url';
          proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
          assert.typeOf(doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler, 'function');
        });

        describe('handler function for the "cache" queue messages', function () {
          describe('if the message is "null"', function () {
            it('should return void', function () {
              process.env.QUEUE_CON_URL = 'yet another test queue connection url';
              proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
              assert.isUndefined(doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(null));
            });
          });

          describe('if the message is a RabbitMQ "ConsumeMessage" object', function () {
            let handlersStubs;
            beforeEach(function () {
              handlersStubs = {
                cacheGetValueHandler: sandbox.stub(),
                cacheStoreValueHandler: sandbox.stub(),
                cacheGetObjectHandler: sandbox.stub(),
                cacheStoreObjectHandler: sandbox.stub(),
                cacheStoreObjectIfNotExistsHandler: sandbox.stub(),
                cacheExpireKeyHandler: sandbox.stub(),
                cacheDeleteKeysHandler: sandbox.stub(),
                cacheKeysExistHandler: sandbox.stub(),
              };
              doubles.handlerFactoryStub.default.returns(handlersStubs);
            });

            it('should return void', function () {
              const rawMessage = {
                content: 'raw message content',
              };

              doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

              process.env.QUEUE_CON_URL = 'yet another test queue connection url';
              proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
              assert.isUndefined(doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage));
            });

            it('should call the "queue" module\'s payload parser util function once', function () {
              const rawMessage = {
                content: 'raw message content',
              };

              doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

              process.env.QUEUE_CON_URL = 'yet another test queue connection url';
              proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
              doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
              assert.isTrue(doubles.queueStub.parsePayload.calledOnce);
            });
            
            it('should call the "queue" module\'s payload parser util function with the message content', function () {
              const rawMessage = {
                content: 'raw message content',
              };

              doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

              process.env.QUEUE_CON_URL = 'yet another test queue connection url';
              proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
              doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
              assert.deepEqual(
                doubles.queueStub.parsePayload.args[0][0],
                { data: 'raw message content' }
              );
            });
            
            it('should call the "queue" module\'s payload parser util function with the message content', function () {
              const rawMessage = {
                content: 'raw message content',
              };

              doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

              process.env.QUEUE_CON_URL = 'yet another test queue connection url';
              proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
              doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
              assert.deepEqual(
                doubles.queueStub.parsePayload.args[0][0],
                { data: 'raw message content' }
              );
            });
            
            describe('if a queue message with type "CACHE_STORE_VALUE" is received', function () {
              let rawMessage;
              beforeEach(function () {
                rawMessage = {
                  content: {
                    type: testEventTypes.CACHE_STORE_VALUE,
                    payload: 'raw test message content',
                  },
                };

                doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));
              });

              it('should call the correct handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.isTrue(handlersStubs.cacheStoreValueHandler.calledOnce);
              });

              it('should pass the parsed message\'s "payload" property as the first agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.strictEqual(handlersStubs.cacheStoreValueHandler.args[0][0], 'raw test message content');
              });
              
              it('should pass a callback as the second agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.typeOf(handlersStubs.cacheStoreValueHandler.args[0][1], 'function');
              });

              describe('callback provided to the handler function', function () {
                describe('if it is called with "null" as argument', function () {
                  it('should call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                  });

                  it('should call the queue module\'s acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1](null);
                    assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1](null);
                    assert.deepEqual(
                      doubles.queueStub.ackMessage.args[0][0],
                      { message: rawMessage }
                    );
                  });

                  it('should not call the queue module\'s not acknowledge function', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                  });
                });

                describe('if it is called with an "Error" as argument', function () {
                  it('should call the queue module\'s not acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                  });
                  
                  it('should not call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.ackMessage.notCalled);
                  });

                  it('should call the queue module\'s not acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s not acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreValueHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, rawMessage);
                  });
                  
                  describe('if the queue message content indicates the message should be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to true', function () {
                      rawMessage.content.requeue = true;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheStoreValueHandler.args[0][1]({});
                      assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                  
                  describe('if the queue message content indicates the message should not be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to false', function () {
                      rawMessage.content.requeue = false;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheStoreValueHandler.args[0][1]({});
                      assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                });
              });
            });

            describe('if a queue message with type "CACHE_STORE_OBJECT" is received', function () {
              let rawMessage;
              beforeEach(function () {
                rawMessage = {
                  content: {
                    type: testEventTypes.CACHE_STORE_OBJECT,
                    payload: 'raw test message content',
                  },
                };

                doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));
              });

              it('should call the correct handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url again';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.isTrue(handlersStubs.cacheStoreObjectHandler.calledOnce);
              });

              it('should pass the parsed message\'s "payload" property as the first agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.strictEqual(handlersStubs.cacheStoreObjectHandler.args[0][0], 'raw test message content');
              });
              
              it('should pass a callback as the second agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.typeOf(handlersStubs.cacheStoreObjectHandler.args[0][1], 'function');
              });

              describe('callback provided to the handler function', function () {
                describe('if it is called with "null" as argument', function () {
                  it('should call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                  });

                  it('should call the queue module\'s acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1](null);
                    assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1](null);
                    assert.deepEqual(
                      doubles.queueStub.ackMessage.args[0][0],
                      { message: rawMessage }
                    );
                  });

                  it('should not call the queue module\'s not acknowledge function', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                  });
                });

                describe('if it is called with an "Error" as argument', function () {
                  it('should call the queue module\'s not acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                  });
                  
                  it('should not call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.ackMessage.notCalled);
                  });

                  it('should call the queue module\'s not acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s not acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, rawMessage);
                  });
                  
                  describe('if the queue message content indicates the message should be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to true', function () {
                      rawMessage.content.requeue = true;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheStoreObjectHandler.args[0][1]({});
                      assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                  
                  describe('if the queue message content indicates the message should not be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to false', function () {
                      rawMessage.content.requeue = false;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheStoreObjectHandler.args[0][1]({});
                      assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                });
              });
            });

            describe('if a queue message with type "CACHE_STORE_OBJECT_IF_NX" is received', function () {
              let rawMessage;
              beforeEach(function () {
                rawMessage = {
                  content: {
                    type: testEventTypes.CACHE_STORE_OBJECT_IF_NX,
                    payload: 'raw test message content',
                  },
                };

                doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));
              });

              it('should call the correct handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url again';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.isTrue(handlersStubs.cacheStoreObjectIfNotExistsHandler.calledOnce);
              });

              it('should pass the parsed message\'s "payload" property as the first agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.strictEqual(handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][0], 'raw test message content');
              });
              
              it('should pass a callback as the second agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.typeOf(handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1], 'function');
              });

              describe('callback provided to the handler function', function () {
                describe('if it is called with "null" as argument', function () {
                  it('should call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                  });

                  it('should call the queue module\'s acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1](null);
                    assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1](null);
                    assert.deepEqual(
                      doubles.queueStub.ackMessage.args[0][0],
                      { message: rawMessage }
                    );
                  });

                  it('should not call the queue module\'s not acknowledge function', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                  });
                });

                describe('if it is called with an "Error" as argument', function () {
                  it('should call the queue module\'s not acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                  });
                  
                  it('should not call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.ackMessage.notCalled);
                  });

                  it('should call the queue module\'s not acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s not acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, rawMessage);
                  });
                  
                  describe('if the queue message content indicates the message should be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to true', function () {
                      rawMessage.content.requeue = true;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1]({});
                      assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                  
                  describe('if the queue message content indicates the message should not be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to false', function () {
                      rawMessage.content.requeue = false;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheStoreObjectIfNotExistsHandler.args[0][1]({});
                      assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                });
              });
            });

            describe('if a queue message with type "CACHE_EXPIRE_KEY" is received', function () {
              let rawMessage;
              beforeEach(function () {
                rawMessage = {
                  content: {
                    type: testEventTypes.CACHE_EXPIRE_KEY,
                    payload: 'raw test message content',
                  },
                };

                doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));
              });

              it('should call the correct handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url again';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.isTrue(handlersStubs.cacheExpireKeyHandler.calledOnce);
              });

              it('should pass the parsed message\'s "payload" property as the first agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.strictEqual(handlersStubs.cacheExpireKeyHandler.args[0][0], 'raw test message content');
              });
              
              it('should pass a callback as the second agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.typeOf(handlersStubs.cacheExpireKeyHandler.args[0][1], 'function');
              });

              describe('callback provided to the handler function', function () {
                describe('if it is called with "null" as argument', function () {
                  it('should call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                  });

                  it('should call the queue module\'s acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1](null);
                    assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1](null);
                    assert.deepEqual(
                      doubles.queueStub.ackMessage.args[0][0],
                      { message: rawMessage }
                    );
                  });

                  it('should not call the queue module\'s not acknowledge function', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                  });
                });

                describe('if it is called with an "Error" as argument', function () {
                  it('should call the queue module\'s not acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                  });
                  
                  it('should not call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.ackMessage.notCalled);
                  });

                  it('should call the queue module\'s not acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s not acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheExpireKeyHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, rawMessage);
                  });
                  
                  describe('if the queue message content indicates the message should be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to true', function () {
                      rawMessage.content.requeue = true;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheExpireKeyHandler.args[0][1]({});
                      assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                  
                  describe('if the queue message content indicates the message should not be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to false', function () {
                      rawMessage.content.requeue = false;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheExpireKeyHandler.args[0][1]({});
                      assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                });
              });
            });

            describe('if a queue message with type "CACHE_DELETE_KEYS" is received', function () {
              let rawMessage;
              beforeEach(function () {
                rawMessage = {
                  content: {
                    type: testEventTypes.CACHE_DELETE_KEYS,
                    payload: 'raw test message content',
                  },
                };

                doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));
              });

              it('should call the correct handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url again';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.isTrue(handlersStubs.cacheDeleteKeysHandler.calledOnce);
              });

              it('should pass the parsed message\'s "payload" property as the first agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.strictEqual(handlersStubs.cacheDeleteKeysHandler.args[0][0], 'raw test message content');
              });
              
              it('should pass a callback as the second agument to the handler function', function () {
                process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                assert.typeOf(handlersStubs.cacheDeleteKeysHandler.args[0][1], 'function');
              });

              describe('callback provided to the handler function', function () {
                describe('if it is called with "null" as argument', function () {
                  it('should call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.ackMessage.calledOnce);
                  });

                  it('should call the queue module\'s acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1](null);
                    assert.strictEqual(doubles.queueStub.ackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1](null);
                    assert.deepEqual(
                      doubles.queueStub.ackMessage.args[0][0],
                      { message: rawMessage }
                    );
                  });

                  it('should not call the queue module\'s not acknowledge function', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1](null);
                    assert.isTrue(doubles.queueStub.nackMessage.notCalled);
                  });
                });

                describe('if it is called with an "Error" as argument', function () {
                  it('should call the queue module\'s not acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.nackMessage.calledOnce);
                  });
                  
                  it('should not call the queue module\'s acknowledge function once', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1]({});
                    assert.isTrue(doubles.queueStub.ackMessage.notCalled);
                  });

                  it('should call the queue module\'s not acknowledge function with 1 argument', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0].length, 1);
                  });
                  
                  it('should call the queue module\'s not acknowledge function with an object containing the raw message', function () {
                    process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                    proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                    doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                    handlersStubs.cacheDeleteKeysHandler.args[0][1]({});
                    assert.strictEqual(doubles.queueStub.nackMessage.args[0][0].message, rawMessage);
                  });
                  
                  describe('if the queue message content indicates the message should be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to true', function () {
                      rawMessage.content.requeue = true;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheDeleteKeysHandler.args[0][1]({});
                      assert.isTrue(doubles.queueStub.nackMessage.args[0][0].requeue);
                    });
                  });
                  
                  describe('if the queue message content indicates the message should not be requeued', function () {
                    it('should call the queue module\'s not acknowledge function with an object containing the "requeue" property set to false', function () {
                      rawMessage.content.requeue = false;
                      doubles.queueStub.parsePayload.returns(JSON.stringify(rawMessage.content));

                      process.env.QUEUE_CON_URL = 'yet another test queue connection url';
                      proxyquire('../../../dist/cache/index.js', proxyIndexStubs);
                      doubles.queueStub.connectWithRetry.args[0][0].consumeQueues[0].handler(rawMessage);
                      handlersStubs.cacheDeleteKeysHandler.args[0][1]({});
                      assert.isFalse(doubles.queueStub.nackMessage.args[0][0].requeue);
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