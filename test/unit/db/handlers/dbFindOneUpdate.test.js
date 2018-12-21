'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const logger = require('../../../../dist/sharedLibs/services/logger');

describe('DB - handlers - dbFindOneUpdate', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyHandler;

  beforeEach(function () {
    doubles = {
      loggerStub: sandbox.stub(logger),
      dbObject: {
        findOneUpdate: sandbox.stub(),
      },
    };
    
    doubles.dbObject.findOneUpdate.returns(Promise.resolve({}));

    proxyHandler = proxyquire('../../../../dist/db/handlers/dbFindOneUpdate', {
      '../../sharedLibs/services/logger': doubles.loggerStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyHandler.default, 'function');
    });

    it('should return a function', function () {
      assert.typeOf(proxyHandler.default(), 'function');
    });

    describe('returned function', function () {
      let handler;

      beforeEach(function () {
        handler = proxyHandler.default(doubles.dbObject);
      });

      it('should call the debug() function of the logger once', function () {
        handler();
        assert.isTrue(doubles.loggerStub.debug.calledOnce);
      });
      
      it('should call the debug() function of the logger with 1 argument', function () {
        handler();
        assert.strictEqual(doubles.loggerStub.debug.args[0].length, 1);
      });
      
      it('should call the debug() function of the logger with a custom message in the "message" property', function () {
        handler();
        assert.deepEqual(
          doubles.loggerStub.debug.args[0][0],
          {
            message: 'Received event "dbFindOneUpdate"',
          }
        );
      });

      it('should call the findOneUpdate() function of the object provided to the default export once', function () {
        handler();
        assert.isTrue(doubles.dbObject.findOneUpdate.calledOnce);
      });
      
      it('should call the findOneUpdate() function of the object provided to the default export with 1 argument', function () {
        handler();
        assert.strictEqual(doubles.dbObject.findOneUpdate.args[0].length, 1);
      });
      
      it('should call the findOneUpdate() function of the object provided to the default export with the "payload" property of the 1st argument provided to this function', function () {
        const payload = {};
        handler(payload);
        assert.strictEqual(doubles.dbObject.findOneUpdate.args[0][0], payload);
      });

      describe('if the findOneUpdate() function of the object provided to the default export returns a promise that resolves', function () {
        describe('if an "ack" callback was provided', function () {
          it('should call it once', function () {
            doubles.dbObject.findOneUpdate.returns(Promise.resolve({}));
            return(
              new Promise(function (resolve, reject) {
                const ackStub = sandbox.stub();
                handler({}, ackStub);
                global.setTimeout(function () {
                  resolve(assert.isTrue(ackStub.calledOnce));
                }, 1);
              })
            );
          });
          
          it('should call it with 2 arguments', function () {
            doubles.dbObject.findOneUpdate.returns(Promise.resolve({}));
            return(
              new Promise(function (resolve, reject) {
                const ackStub = sandbox.stub();
                handler({}, ackStub);
                global.setTimeout(function () {
                  resolve(assert.strictEqual(ackStub.args[0].length, 2));
                }, 1);
              })
            );
          });
          
          describe('first argument', function () {
            it('should be NULL', function () {
              doubles.dbObject.findOneUpdate.returns(Promise.resolve({}));
              return(
                new Promise(function (resolve, reject) {
                  const ackStub = sandbox.stub();
                  handler({}, ackStub);
                  global.setTimeout(function () {
                    resolve(assert.isNull(ackStub.args[0][0]));
                  }, 1);
                })
              );
            });
          });
          
          describe('second argument', function () {
            it('should be the result of the resolved promise', function () {
              const resolveValue = {};
              doubles.dbObject.findOneUpdate.returns(Promise.resolve(resolveValue));
              return(
                new Promise(function (resolve, reject) {
                  const ackStub = sandbox.stub();
                  handler({}, ackStub);
                  global.setTimeout(function () {
                    resolve(assert.strictEqual(ackStub.args[0][1], resolveValue));
                  }, 1);
                })
              );
            });
          });
        });
      });

      describe('if the findOneUpdate() function of the object provided to the default export returns a promise that rejects', function () {
        it('should call the error() function of the logger once', function () {
          doubles.dbObject.findOneUpdate.returns(Promise.reject(new Error('test error message')));
          return(
            new Promise(function (resolve, reject) {
              handler();
              global.setTimeout(function () {
                resolve(assert.isTrue(doubles.loggerStub.error.calledOnce));
              }, 1);
            })
          );
        });
        
        it('should call the error() function of the logger with 1 argument', function () {
          doubles.dbObject.findOneUpdate.returns(Promise.reject(new Error('test error message')));
          return(
            new Promise(function (resolve, reject) {
              handler();
              global.setTimeout(function () {
                resolve(assert.strictEqual(doubles.loggerStub.error.args[0].length, 1));
              }, 1);
            })
          );
        });
        
        it('should call the error() function of the logger with the error message in the "message" property', function () {
          const testError = new Error('test error message');
          doubles.dbObject.findOneUpdate.returns(Promise.reject(testError));
          return(
            new Promise(function (resolve, reject) {
              handler();
              global.setTimeout(function () {
                resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].message, testError.message));
              }, 1);
            })
          );
        });
        
        it('should call the error() function of the logger with the Error object in the "payload" property', function () {
          const testError = new Error('test error message');
          doubles.dbObject.findOneUpdate.returns(Promise.reject(testError));
          return(
            new Promise(function (resolve, reject) {
              handler();
              global.setTimeout(function () {
                resolve(assert.strictEqual(doubles.loggerStub.error.args[0][0].payload, testError));
              }, 1);
            })
          );
        });

        describe('if an "ack" callback was provided', function () {
          it('should call it once', function () {
            doubles.dbObject.findOneUpdate.returns(Promise.reject(new Error('test error message')));
            return(
              new Promise(function (resolve, reject) {
                const ackStub = sandbox.stub();
                handler({}, ackStub);
                global.setTimeout(function () {
                  resolve(assert.isTrue(ackStub.calledOnce));
                }, 1);
              })
            );
          });
          
          it('should call it with 1 argument', function () {
            doubles.dbObject.findOneUpdate.returns(Promise.reject(new Error('test error message')));
            return(
              new Promise(function (resolve, reject) {
                const ackStub = sandbox.stub();
                handler({}, ackStub);
                global.setTimeout(function () {
                  resolve(assert.strictEqual(ackStub.args[0].length, 1));
                }, 1);
              })
            );
          });
          
          it('should call it with the Error object of the rejected promise', function () {
            const testError = new Error('test error message');
            doubles.dbObject.findOneUpdate.returns(Promise.reject(testError));
            return(
              new Promise(function (resolve, reject) {
                const ackStub = sandbox.stub();
                handler({}, ackStub);
                global.setTimeout(function () {
                  resolve(assert.strictEqual(ackStub.args[0][0], testError));
                }, 1);
              })
            );
          });
        });
      });
    });
  });
});