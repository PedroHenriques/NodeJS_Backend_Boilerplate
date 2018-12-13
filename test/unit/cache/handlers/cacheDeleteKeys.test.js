'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const logger = require('../../../../dist/sharedLibs/services/logger');

describe('Cache - Handlers - cacheDeleteKeys', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyHandler;

  beforeEach(function () {
    doubles = {
      loggerStub: sandbox.stub(logger),
      cacheModuleStub: {
        delKeys: sandbox.stub()
      },
    };
    proxyHandler = proxyquire('../../../../dist/cache/handlers/cacheDeleteKeys.js', {
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
      doubles.cacheModuleStub.delKeys.returns(Promise.resolve(1));

      handler = proxyHandler.default(doubles.cacheModuleStub);
    });

    it('should return void', function () {
      assert.isUndefined(handler({}));
    });

    it('should call the debug method of the logger once', function () {
      handler({});
      assert.isTrue(doubles.loggerStub.debug.calledOnce);
    });

    it('should call the debug method of the logger with 1 argument', function () {
      handler({});
      assert.strictEqual(doubles.loggerStub.debug.args[0].length, 1);
    });

    it('should call the debug method of the logger with a custom message', function () {
      handler({});
      assert.deepEqual(doubles.loggerStub.debug.args[0][0], { message: 'Received event "cacheDeleteKeys"' });
    });

    it('should call the delKeys() function of the cache module once', function () {
      handler({});
      assert.isTrue(doubles.cacheModuleStub.delKeys.calledOnce);
    });
    
    it('should call the delKeys() function of the cache module with 1 argument', function () {
      handler({});
      assert.strictEqual(doubles.cacheModuleStub.delKeys.args[0].length, 1);
    });

    it('should call the delKeys() function of the cache module with the "keys" property of the object provided iin the first argument', function () {
      const keys = [ 'key1', 'key2' ]
      handler({ keys });
      assert.strictEqual(doubles.cacheModuleStub.delKeys.args[0][0], keys);
    });

    describe('if the delKeys() function of the cache module returns a promise that resolves with a number', function () {
      let delKeysReturnPromise;
      beforeEach(function () {
        delKeysReturnPromise = Promise.resolve(1);
        doubles.cacheModuleStub.delKeys.returns(delKeysReturnPromise);
      });

      describe('if an "ack" function was provided', function () {
        let ack;
        beforeEach(function () {
          ack = sandbox.stub();
        });

        it('should call it once', function () {
          handler({}, ack);
          return(
            delKeysReturnPromise
            .then(function () {
              assert.isTrue(ack.calledOnce);
            })
          );
        });
        
        it('should call it with 2 arguments', function () {
          handler({}, ack);
          return(
            delKeysReturnPromise
            .then(function () {
              assert.strictEqual(ack.args[0].length, 2);
            })
          );
        });

        describe('first argument', function () {
          it('should be null', function () {
            handler({}, ack);
            return(
              delKeysReturnPromise
              .then(function () {
                assert.isNull(ack.args[0][0]);
              })
            );
          });
        });
        
        describe('second argument', function () {
          it('should be the value of the resolved promise returned from the delKeys() function of the cache module', function () {
            const resolveValue = 17;
            delKeysReturnPromise = Promise.resolve(resolveValue);
            doubles.cacheModuleStub.delKeys.returns(delKeysReturnPromise);

            handler({}, ack);
            return(
              delKeysReturnPromise
              .then(function () {
                assert.strictEqual(ack.args[0][1], resolveValue);
              })
            );
          });
        });
      });
    });

    describe('if the delKeys() function of the cache module returns a promise that rejects', function () {
      let testError;
      let delKeysReturnPromise;
      beforeEach(function () {
        testError = new Error('test error message');
        delKeysReturnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.delKeys.returns(delKeysReturnPromise);
      });

      it('should call the error() function of the logger once', function () {
        handler({});
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with 1 argument', function () {
        handler({});
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0].length, 1));
            }, 1);
          })
        );
      });

      it('should call the error() function of the logger with the error message in the "message" property', function () {
        handler({});
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].message, testError.message));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with the error object in the "payload" property', function () {
        handler({});
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].payload, testError));
            }, 1);
          })
        );
      });

      it('should call the "ack" function once, if it was provided', function () {
        const ack = sandbox.stub();
        handler({}, ack);
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.isTrue(ack.calledOnce));
            }, 1);
          })
        );
      });
      
      it('should call the "ack" function with 1 argument, if it was provided', function () {
        const ack = sandbox.stub();
        handler({}, ack);
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.strictEqual(ack.args[0].length, 1));
            }, 1);
          })
        );
      });

      it('should call the "ack" function with the error object as argument, if it was provided', function () {
        const ack = sandbox.stub();
        handler({}, ack);
        return(
          new Promise(function (resolve, reject) {
            global.setTimeout(function () {
              resolve(assert.strictEqual(ack.args[0][0], testError));
            }, 1);
          })
        );
      });
    });
  });
});