'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const logger = require('../../../../dist/sharedLibs/services/logger');

describe('Cache - Handlers - cacheExpireKey', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyHandler;

  beforeEach(function () {
    doubles = {
      loggerStub: sandbox.stub(logger),
      cacheModuleStub: {
        expireKey: sandbox.stub()
      },
    };
    proxyHandler = proxyquire('../../../../dist/cache/handlers/cacheExpireKey.js', {
      '../../sharedLibs/services/logger': doubles.loggerStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should return a function', function () {
    assert.typeOf(proxyHandler.default(doubles.cacheModuleStub), 'function');
  });

  describe('the returned function', function () {
    let handler;
    beforeEach(function () {
      doubles.cacheModuleStub.expireKey.returns(Promise.resolve(true));

      handler = proxyHandler.default(doubles.cacheModuleStub);
    });

    it('should return void', function () {
      assert.isUndefined(handler({}));
    });

    it('should call the debug() function of the logger once', function () {
      handler({});
      assert.isTrue(doubles.loggerStub.debug.calledOnce);
    });

    it('should call the debug() function of the logger with 1 argument', function () {
      handler({});
      assert.strictEqual(doubles.loggerStub.debug.args[0].length, 1);
    });

    it('should call the debug() function of the logger with the custom message', function () {
      handler({});
      assert.deepEqual(doubles.loggerStub.debug.args[0][0], { message: 'Received event "cacheExpireKey"' });
    });

    it('should call the "expireKey" property of the supplied cache object once', function () {
      handler({});
      assert.isTrue(doubles.cacheModuleStub.expireKey.calledOnce);
    });

    it('should call the "expireKey" property of the supplied cache object with 2 arguments', function () {
      handler({});
      assert.strictEqual(doubles.cacheModuleStub.expireKey.args[0].length, 2);
    });

    describe('call to the "expireKey" property of the supplied cache object - first argument', function () {
      it('should be the "key" property of the first argument provided to this function', function () {
        const key = 'myKey';
        handler({ key });
        assert.strictEqual(doubles.cacheModuleStub.expireKey.args[0][0], key);
      });
    });
    
    describe('call to the "expireKey" property of the supplied cache object - second argument', function () {
      it('should be the "value" property of the first argument provided to this function', function () {
        const value = 'myValue';
        handler({ value });
        assert.strictEqual(doubles.cacheModuleStub.expireKey.args[0][1], value);
      });
    });

    describe('if the "expireKey" property of the supplied cache object returns a promise that resolves', function () {
      describe('if the promise resolves with TRUE', function () {
        let returnPromise;
        beforeEach(function () {
          returnPromise = Promise.resolve(true);
          doubles.cacheModuleStub.expireKey.returns(returnPromise);
        });

        describe('if an "ack" function was provided', function () {
          it('should call it once', function () {
            const ack = sandbox.stub();
            handler({}, ack);
            return(
              returnPromise
              .then(function () {
                assert.isTrue(ack.calledOnce);
              })
            );
          });
          
          it('should call it with 1 argument', function () {
            const ack = sandbox.stub();
            handler({}, ack);
            return(
              returnPromise
              .then(function () {
                assert.strictEqual(ack.args[0].length, 1);
              })
            );
          });
          
          it('should call it with "null"', function () {
            const ack = sandbox.stub();
            handler({}, ack);
            return(
              returnPromise
              .then(function () {
                assert.isNull(ack.args[0][0]);
              })
            );
          });
        });
      });

      describe('if the promise resolves with FALSE', function () {
        let returnPromise;
        beforeEach(function () {
          returnPromise = Promise.resolve(false);
          doubles.cacheModuleStub.expireKey.returns(returnPromise);
        });

        it('should call the error() function of the logger once', function () {
          return(
            new Promise(function (resolve, reject) {
              handler({})
              global.setTimeout(function () {
                resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
              }, 1);
            })
          );
        });

        it('should call the error() function of the logger with 1 argument', function () {
          return(
            new Promise(function (resolve, reject) {
              handler({})
              global.setTimeout(function () {
                resolve(assert.strictEqual(doubles.loggerStub.error.args[0].length, 1));
              }, 1);
            })
          );
        });
        
        it('should call the error() function of the logger with the error\'s message in the "message" property', function () {
          return(
            new Promise(function (resolve, reject) {
              const key = 'myKey';
              const value = 'myValue';
              const errorMsg = `Failed to set expiration in the cache key "${key}" and value "${value}"`;

              handler({ key, value })
              global.setTimeout(function () {
                resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].message, errorMsg));
              }, 1);
            })
          );
        });
        
        it('should call the error() function of the logger with an Error object in the "payload" property', function () {
          return(
            new Promise(function (resolve, reject) {
              const key = 'myKey';
              const value = 'myValue';

              handler({ key, value })
              global.setTimeout(function () {
                resolve(assert.typeOf(doubles.loggerStub.error.args[0][0].payload, 'Error'));
              }, 1);
            })
          );
        });

        describe('if an "ack" function was provided', function () {
          it('should call it once', function () {
            return(new Promise(function (resolve, reject) {
              const ack = sandbox.stub();
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.isTrue(ack.calledOnce));
              }, 1);
            }));
          });
          
          it('should call it with 1 argument', function () {
            return(new Promise(function (resolve, reject) {
              const ack = sandbox.stub();
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.strictEqual(ack.args[0].length, 1));
              }, 1);
            }));
          });
          
          it('should call it with an Error object', function () {
            return(new Promise(function (resolve, reject) {
              const ack = sandbox.stub();
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.typeOf(ack.args[0][0], 'Error'));
              }, 1);
            }));
          });
        });
      });
    });

    describe('if the "expireKey" property of the supplied cache object returns a promise that rejects', function () {
      let testError;
      let returnPromise;
      beforeEach(function () {
        testError = new Error('test error message');
      });

      it('should call the error() function of the logger once', function () {
        returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.expireKey.returns(returnPromise);
        return(
          new Promise(function (resolve, reject) {
            handler({});
            global.setTimeout(function () {
              resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with 1 argument', function () {
        returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.expireKey.returns(returnPromise);
        return(
          new Promise(function (resolve, reject) {
            handler({});
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0].length, 1));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with the error message as the "message" property', function () {
        returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.expireKey.returns(returnPromise);
        return(
          new Promise(function (resolve, reject) {
            handler({});
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].message, testError.message));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with the Error object as the "payload" property', function () {
        returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.expireKey.returns(returnPromise);
        return(
          new Promise(function (resolve, reject) {
            handler({});
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].payload, testError));
            }, 1);
          })
        );
      });

      describe('if an "ack" function was provided', function () {
        it('should call it once', function () {
          const ack = sandbox.stub();
          returnPromise = Promise.reject(testError);
          doubles.cacheModuleStub.expireKey.returns(returnPromise);
          return(
            new Promise(function (resolve, reject) {
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.isTrue(ack.calledOnce));
              }, 1);
            })
          );
        });
        
        it('should call it with 1 argument', function () {
          const ack = sandbox.stub();
          returnPromise = Promise.reject(testError);
          doubles.cacheModuleStub.expireKey.returns(returnPromise);
          return(
            new Promise(function (resolve, reject) {
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.strictEqual(ack.args[0].length, 1));
              }, 1);
            })
          );
        });
        
        it('should call it with the Error object', function () {
          const ack = sandbox.stub();
          returnPromise = Promise.reject(testError);
          doubles.cacheModuleStub.expireKey.returns(returnPromise);
          return(
            new Promise(function (resolve, reject) {
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.strictEqual(ack.args[0][0], testError));
              }, 1);
            })
          );
        });
      });
    });
  });
});