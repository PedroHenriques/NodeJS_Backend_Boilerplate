'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const logger = require('../../../../dist/sharedLibs/services/logger');

describe('Cache - Handlers - cacheGetValue', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyHandler;

  beforeEach(function () {
    doubles = {
      loggerStub: sandbox.stub(logger),
      cacheModuleStub: {
        getValue: sandbox.stub()
      },
    };
    proxyHandler = proxyquire('../../../../dist/cache/handlers/cacheGetValue.js', {
      '../../sharedLibs/services/logger': doubles.loggerStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should return a function', function () {
    assert.typeOf(proxyHandler.default(doubles.cacheModuleStub), 'function');
  });

  describe('returned function', function () {
    let handler;
    beforeEach(function () {
      doubles.cacheModuleStub.getValue.returns(Promise.resolve(''));

      handler = proxyHandler.default(doubles.cacheModuleStub);
    });

    it('should call the debug() function of the logger once', function () {
      handler({});
      assert.isTrue(doubles.loggerStub.debug.calledOnce);
    });
    
    it('should call the debug() function of the logger with 1 argument', function () {
      handler({});
      assert.strictEqual(doubles.loggerStub.debug.args[0].length, 1);
    });
    
    it('should call the debug() function of the logger with a custom message', function () {
      handler({});
      assert.deepEqual(doubles.loggerStub.debug.args[0][0], { message: 'Received event "cacheGetValue"' });
    });

    it('should call the "getValue" property of the provided cache object once', function () {
      handler({});
      assert.isTrue(doubles.cacheModuleStub.getValue.calledOnce);
    });

    it('should call the "getValue" property of the provided cache object with 1 argument', function () {
      handler({});
      assert.strictEqual(doubles.cacheModuleStub.getValue.args[0].length, 1);
    });

    it('should call the "getValue" property of the provided cache object with the "key" property of the first argument provided to this function', function () {
      const key = 'myKey';
      handler({ key });
      assert.strictEqual(doubles.cacheModuleStub.getValue.args[0][0], key);
    });

    describe('if the "getValue" property of the provided cache object returns a promise that resolves', function () {
      describe('if an "ack" function was provided', function () {
        it('should call it once', function () {
          const ack = sandbox.stub();
          const returnPromise = Promise.resolve('');
          doubles.cacheModuleStub.getValue.returns(returnPromise);
          handler({}, ack);
          return(
            returnPromise
            .then(function () {
              assert.isTrue(ack.calledOnce);
            })
          );
        });
        
        it('should call it with 2 arguments', function () {
          const ack = sandbox.stub();
          const returnPromise = Promise.resolve('');
          doubles.cacheModuleStub.getValue.returns(returnPromise);
          handler({}, ack);
          return(
            returnPromise
            .then(function () {
              assert.strictEqual(ack.args[0].length, 2);
            })
          );
        });

        describe('first argument', function () {
          it('should be NULL', function () {
            const ack = sandbox.stub();
            const returnPromise = Promise.resolve('');
            doubles.cacheModuleStub.getValue.returns(returnPromise);
            handler({}, ack);
            return(
              returnPromise
              .then(function () {
                assert.isNull(ack.args[0][0]);
              })
            );
          });
        });
        
        describe('second argument', function () {
          it('should be the value of the resolved promise', function () {
            const ack = sandbox.stub();
            const returnValue = 'my result';
            const returnPromise = Promise.resolve(returnValue);
            doubles.cacheModuleStub.getValue.returns(returnPromise);
            handler({}, ack);
            return(
              returnPromise
              .then(function () {
                assert.strictEqual(ack.args[0][1], returnValue);
              })
            );
          });
        });
      });
    });

    describe('if the "getValue" property of the provided cache object returns a promise that rejects', function () {
      it('should call the error() function of the logger once', function () {
        const testError = new Error('my test error message');
        const returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.getValue.returns(returnPromise);
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
        const testError = new Error('my test error message');
        const returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.getValue.returns(returnPromise);
        return(
          new Promise(function (resolve, reject) {
            handler({});
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0].length, 1));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with the error message in the "message" property', function () {
        const testError = new Error('my test error message');
        const returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.getValue.returns(returnPromise);
        return(
          new Promise(function (resolve, reject) {
            handler({});
            global.setTimeout(function () {
              resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].message, testError.message));
            }, 1);
          })
        );
      });
      
      it('should call the error() function of the logger with the Error object in the "payload" property', function () {
        const testError = new Error('my test error message');
        const returnPromise = Promise.reject(testError);
        doubles.cacheModuleStub.getValue.returns(returnPromise);
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
          const testError = new Error('my test error message');
          const returnPromise = Promise.reject(testError);
          doubles.cacheModuleStub.getValue.returns(returnPromise);
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
          const testError = new Error('my test error message');
          const returnPromise = Promise.reject(testError);
          doubles.cacheModuleStub.getValue.returns(returnPromise);
          return(
            new Promise(function (resolve, reject) {
              handler({}, ack);
              global.setTimeout(function () {
                resolve(assert.strictEqual(ack.args[0].length, 1));
              }, 1);
            })
          );
        });
        
        it('should call it with 1 the Error object', function () {
          const ack = sandbox.stub();
          const testError = new Error('my test error message');
          const returnPromise = Promise.reject(testError);
          doubles.cacheModuleStub.getValue.returns(returnPromise);
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