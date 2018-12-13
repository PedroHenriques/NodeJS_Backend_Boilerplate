'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const util = require('util');

describe('Cache - cache service', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyCache;

  beforeEach(function () {
    doubles = {
      redisClientStub: {
        del: sandbox.stub(),
        exists: sandbox.stub(),
        get: sandbox.stub(),
        set: sandbox.stub(),
        setnx: sandbox.stub(),
        expire: sandbox.stub(),
      },
      promisifyStub: sandbox.stub(util, 'promisify'),
    };
    proxyCache = proxyquire('../../../../dist/cache/services/cache.js', {
      'util': doubles.promisifyStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('cacheFactory', function () {
    let bindStub;
    beforeEach(function () {
      bindStub = sandbox.stub();
      doubles.promisifyStub.returns({ bind: bindStub });
    });

    describe('setup', function () {
      it('should call NodeJS\'s "promisify" with the "del" function of the RedisClient', function () {
        proxyCache.default(doubles.redisClientStub);
        assert.isTrue(doubles.promisifyStub.calledWith(doubles.redisClientStub.del));
      });
      
      it('should call NodeJS\'s "promisify" with the "exists" function of the RedisClient', function () {
        proxyCache.default(doubles.redisClientStub);
        assert.isTrue(doubles.promisifyStub.calledWith(doubles.redisClientStub.exists));
      });
      
      it('should call NodeJS\'s "promisify" with the "get" function of the RedisClient', function () {
        proxyCache.default(doubles.redisClientStub);
        assert.isTrue(doubles.promisifyStub.calledWith(doubles.redisClientStub.get));
      });
      
      it('should call NodeJS\'s "promisify" with the "set" function of the RedisClient', function () {
        proxyCache.default(doubles.redisClientStub);
        assert.isTrue(doubles.promisifyStub.calledWith(doubles.redisClientStub.set));
      });
      
      it('should call NodeJS\'s "promisify" with the "setnx" function of the RedisClient', function () {
        proxyCache.default(doubles.redisClientStub);
        assert.isTrue(doubles.promisifyStub.calledWith(doubles.redisClientStub.setnx));
      });
      
      it('should call NodeJS\'s "promisify" with the "expire" function of the RedisClient', function () {
        proxyCache.default(doubles.redisClientStub);
        assert.isTrue(doubles.promisifyStub.calledWith(doubles.redisClientStub.expire));
      });

      describe('setup for the promisified version of the "del" function', function () {
        let delBindStub;
        beforeEach(function () {
          delBindStub = sandbox.stub();
          doubles.promisifyStub.withArgs(doubles.redisClientStub.del).returns({ bind: delBindStub });
        });

        it('should call the bind() function once', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.isTrue(delBindStub.calledOnce);
        });

        it('should call the bind() function with 1 argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(delBindStub.args[0].length, 1);
        });
        
        it('should call the bind() function with the redis client as argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(delBindStub.args[0][0], doubles.redisClientStub);
        });
      });
      
      describe('setup for the promisified version of the "exists" function', function () {
        let existsBindStub;
        beforeEach(function () {
          existsBindStub = sandbox.stub();
          doubles.promisifyStub.withArgs(doubles.redisClientStub.exists).returns({ bind: existsBindStub });
        });

        it('should call the bind() function once', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.isTrue(existsBindStub.calledOnce);
        });

        it('should call the bind() function with 1 argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(existsBindStub.args[0].length, 1);
        });
        
        it('should call the bind() function with the redis client as argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(existsBindStub.args[0][0], doubles.redisClientStub);
        });
      });
      
      describe('setup for the promisified version of the "get" function', function () {
        let getBindStub;
        beforeEach(function () {
          getBindStub = sandbox.stub();
          doubles.promisifyStub.withArgs(doubles.redisClientStub.get).returns({ bind: getBindStub });
        });

        it('should call the bind() function once', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.isTrue(getBindStub.calledOnce);
        });

        it('should call the bind() function with 1 argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(getBindStub.args[0].length, 1);
        });
        
        it('should call the bind() function with the redis client as argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(getBindStub.args[0][0], doubles.redisClientStub);
        });
      });
      
      describe('setup for the promisified version of the "set" function', function () {
        let setBindStub;
        beforeEach(function () {
          setBindStub = sandbox.stub();
          doubles.promisifyStub.withArgs(doubles.redisClientStub.set).returns({ bind: setBindStub });
        });

        it('should call the bind() function once', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.isTrue(setBindStub.calledOnce);
        });

        it('should call the bind() function with 1 argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(setBindStub.args[0].length, 1);
        });
        
        it('should call the bind() function with the redis client as argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(setBindStub.args[0][0], doubles.redisClientStub);
        });
      });

      describe('setup for the promisified version of the "setnx" function', function () {
        let setnxBindStub;
        beforeEach(function () {
          setnxBindStub = sandbox.stub();
          doubles.promisifyStub.withArgs(doubles.redisClientStub.setnx).returns({ bind: setnxBindStub });
        });

        it('should call the bind() function once', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.isTrue(setnxBindStub.calledOnce);
        });

        it('should call the bind() function with 1 argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(setnxBindStub.args[0].length, 1);
        });
        
        it('should call the bind() function with the redis client as argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(setnxBindStub.args[0][0], doubles.redisClientStub);
        });
      });
      
      describe('setup for the promisified version of the "expire" function', function () {
        let expireBindStub;
        beforeEach(function () {
          expireBindStub = sandbox.stub();
          doubles.promisifyStub.withArgs(doubles.redisClientStub.expire).returns({ bind: expireBindStub });
        });

        it('should call the bind() function once', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.isTrue(expireBindStub.calledOnce);
        });

        it('should call the bind() function with 1 argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(expireBindStub.args[0].length, 1);
        });
        
        it('should call the bind() function with the redis client as argument', function () {
          proxyCache.default(doubles.redisClientStub);
          assert.strictEqual(expireBindStub.args[0][0], doubles.redisClientStub);
        });
      });
    });

    it('should return an object with "delKeys" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'delKeys');
    });

    describe('"delKeys" property of the return object', function () {
      let promiseDelStub;
      let returnPromise;
      let cacheService;
      beforeEach(function () {
        promiseDelStub = sandbox.stub();

        returnPromise = Promise.resolve(1);
        promiseDelStub.returns(returnPromise);
        bindStub.returns(promiseDelStub);

        cacheService = proxyCache.default(doubles.redisClientStub);
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.delKeys, 'function');
      });

      it('should call the redis client "del" function once, when invocked', function () {
        cacheService.delKeys([]);
        assert.isTrue(promiseDelStub.calledOnce);
      });

      it('should call the redis client "del" function with 1 argument, when invocked', function () {
        cacheService.delKeys([]);
        assert.strictEqual(promiseDelStub.args[0].length, 1);
      });
      
      it('should call the redis client "del" function with the provided argument, when invocked', function () {
        const keys = [ 'key1', 'key2' ];
        cacheService.delKeys(keys);
        assert.strictEqual(promiseDelStub.args[0][0], keys);
      });

      it('should return the result of the redis client "del" function', function () {
        assert.strictEqual(cacheService.delKeys([ 'key1', 'key2' ]), returnPromise);
      });
    });

    it('should return an object with "keysExist" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'keysExist');
    });

    describe('"keysExist" property of the return object', function () {
      let promiseExistsStub;
      let cacheService;
      beforeEach(function () {
        promiseExistsStub = sandbox.stub();

        promiseExistsStub.returns(Promise.resolve(2));
        bindStub.returns(promiseExistsStub);

        cacheService = proxyCache.default(doubles.redisClientStub);
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.keysExist, 'function');
      });

      it('should call the redis client "exists" function once, when invocked', function () {
        cacheService.keysExist([]);
        assert.isTrue(promiseExistsStub.calledOnce);
      });

      it('should return a promise', function () {
        assert.typeOf(cacheService.keysExist([]), 'promise');
      });

      describe('if the promise resolves with a number equal to the number of elements of the array provided as argument', function () {
        it('should resolve to TRUE', function () {
          promiseExistsStub.returns(Promise.resolve(3));

          return(
            cacheService.keysExist([ 'key1', 'key2', 'key3' ])
            .then(function (result) {
              assert.isTrue(result);
            })
          );
        });
      });
      
      describe('if the promise resolves with a number different to the number of elements of the array provided as argument', function () {
        it('should resolve to FALSE', function () {
          promiseExistsStub.returns(Promise.resolve(3));

          return(
            cacheService.keysExist([ 'key1', 'key2' ])
            .then(function (result) {
              assert.isFalse(result);
            })
          );
        });
      });

      describe('if the promise rejects', function () {
        it('should let the Error bubble up', function () {
          const testError = new Error('test error message');
          promiseExistsStub.returns(Promise.reject(testError));

          return(
            cacheService.keysExist([ 'key1', 'key2' ])
            .then(function () {
              assert.fail();
            })
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });

    it('should return an object with "getValue" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'getValue');
    });

    describe('"getValue" property of the return object', function () {
      let promiseGetStub;
      let returnPromise;
      let cacheService;
      beforeEach(function () {
        promiseGetStub = sandbox.stub();

        returnPromise = Promise.resolve('value');
        promiseGetStub.returns(returnPromise);
        bindStub.returns(promiseGetStub);

        cacheService = proxyCache.default(doubles.redisClientStub);
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.getValue, 'function');
      });

      it('should call the redis client "get" function once, when invocked', function () {
        cacheService.getValue('my key');
        assert.isTrue(promiseGetStub.calledOnce);
      });

      it('should call the redis client "get" function with 1 argument, when invocked', function () {
        cacheService.getValue('my key');
        assert.strictEqual(promiseGetStub.args[0].length, 1);
      });
      
      it('should call the redis client "get" function with the provided argument, when invocked', function () {
        const key = 'my key';
        cacheService.getValue(key);
        assert.strictEqual(promiseGetStub.args[0][0], key);
      });

      it('should return the result of the redis client "get" function', function () {
        assert.strictEqual(cacheService.getValue('my key'), returnPromise);
      });
    });

    it('should return an object with "storeValue" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'storeValue');
    });

    describe('"storeValue" property of the return object', function () {
      let promiseSetStub;
      let returnPromise;
      let cacheService;
      beforeEach(function () {
        promiseSetStub = sandbox.stub();

        returnPromise = Promise.resolve('value');
        promiseSetStub.returns(returnPromise);
        bindStub.returns(promiseSetStub);

        cacheService = proxyCache.default(doubles.redisClientStub);
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.storeValue, 'function');
      });

      it('should call the redis client "set" function once, when invocked', function () {
        cacheService.storeValue('my key', 'my value');
        assert.isTrue(promiseSetStub.calledOnce);
      });

      it('should call the redis client "set" function with 2 argument, when invocked', function () {
        cacheService.storeValue('my key', 'my value');
        assert.strictEqual(promiseSetStub.args[0].length, 2);
      });
      
      it('should call the redis client "set" function with the provided arguments, when invocked', function () {
        const key = 'my key';
        const value = 'my value';
        cacheService.storeValue(key, value);
        assert.deepEqual(promiseSetStub.args[0], [ key, value ]);
      });

      it('should return a promise', function () {
        assert.typeOf(cacheService.storeValue('my key', 'my value'), 'promise');
      });

      describe('if the redis client "set" function returns the string "OK"', function () {
        it('should return a promise that resolves with TRUE', function () {
          promiseSetStub.returns(Promise.resolve('OK'));

          return(
            cacheService.storeValue('my key', 'my value')
            .then(function (result) {
              assert.isTrue(result);
            })
          );
        });
      });
      
      describe('if the redis client "set" function returns any string other than "OK"', function () {
        it('should return a promise that resolves with FALSE', function () {
          promiseSetStub.returns(Promise.resolve('other string'));

          return(
            cacheService.storeValue('my key', 'my value')
            .then(function (result) {
              assert.isFalse(result);
            })
          );
        });
      });

      describe('if the promise rejects', function () {
        it('should let the Error bubble up', function () {
          const testError = new Error('test error message');
          promiseSetStub.returns(Promise.reject(testError));

          return(
            cacheService.storeValue('my key', 'my value')
            .then(function () {
              assert.fail();
            })
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });

    it('should return an object with "setObject" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'setObject');
    });

    describe('"setObject" property of the return object', function () {
      let storeValueStub;
      let cacheService;
      beforeEach(function () {
        storeValueStub = sandbox.stub();

        cacheService = proxyCache.default(doubles.redisClientStub);
        cacheService.storeValue = storeValueStub;
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.setObject, 'function');
      });

      it('should return the result of the own module\'s storeValue()', function () {
        storeValueStub.returns('storeValue() return value');

        assert.strictEqual(cacheService.setObject('my key', { key1: 'value1', key2: 5 }), 'storeValue() return value');
      });

      it('should call the own module\'s storeValue() once, when invocked', function () {
        cacheService.setObject('my key', { key1: 'value1', key2: 5 });
        assert.isTrue(cacheService.storeValue.calledOnce);
      });
      
      it('should call the own module\'s storeValue() with 2 arguments, when invocked', function () {
        cacheService.setObject('my key', { key1: 'value1', key2: 5 });
        assert.strictEqual(cacheService.storeValue.args[0].length, 2);
      });
      
      describe('first argument', function () {
        it('should be the first argument received by the "setObject" property', function () {
          const myKey = 'my key';
          cacheService.setObject(myKey, { key1: 'value1', key2: 5 });
          assert.strictEqual(cacheService.storeValue.args[0][0], myKey);
        });
      });
      
      describe('second argument', function () {
        it('should be a JSON string version of the second argument received by the "setObject" property', function () {
          const myValue = { key1: 'value1', key2: 5 };
          cacheService.setObject('my key', myValue);
          assert.strictEqual(cacheService.storeValue.args[0][1], JSON.stringify(myValue));
        });
      });
    });

    it('should return an object with "setObjectIfNotExists" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'setObjectIfNotExists');
    });

    describe('"setObjectIfNotExists" property of the return object', function () {
      let promiseSetnxStub;
      let returnPromise;
      let cacheService;
      beforeEach(function () {
        promiseSetnxStub = sandbox.stub();

        returnPromise = Promise.resolve(true);
        promiseSetnxStub.returns(returnPromise);
        bindStub.returns(promiseSetnxStub);

        cacheService = proxyCache.default(doubles.redisClientStub);
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.setObjectIfNotExists, 'function');
      });

      it('should call the redis client "setnx" function once, when invocked', function () {
        cacheService.setObjectIfNotExists('my key', { key: 1, otherKey: 'value' });
        assert.isTrue(promiseSetnxStub.calledOnce);
      });

      it('should call the redis client "setnx" function with 2 argument, when invocked', function () {
        cacheService.setObjectIfNotExists('my key', { key: 1, otherKey: 'value' });
        assert.strictEqual(promiseSetnxStub.args[0].length, 2);
      });
      
      describe('first argument', function () {
        it('should be the first argument received by the "setObjectIfNotExists" property', function () {
          const myKey = 'my key';
          cacheService.setObjectIfNotExists(myKey, { key: 1, otherKey: 'value' });
          assert.strictEqual(promiseSetnxStub.args[0][0], myKey);
        });
      });
      
      describe('second argument', function () {
        it('should be a JSON string version of the second argument received by the "setObjectIfNotExists" property', function () {
          const myValue = { key: 1, otherKey: 'value' };
          cacheService.setObjectIfNotExists('my key', myValue);
          assert.strictEqual(promiseSetnxStub.args[0][1], JSON.stringify(myValue));
        });
      });

      it('should return the result of the redis client "setnx" function', function () {
        assert.strictEqual(cacheService.setObjectIfNotExists('my key', { key: 1, otherKey: 'value' }), returnPromise);
      });
    });

    it('should return an object with "getObject" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'getObject');
    });

    describe('"getObject" property of the return object', function () {
      let getValueStub;
      let cacheService;
      beforeEach(function () {
        getValueStub = sandbox.stub();

        getValueStub.returns(Promise.resolve(JSON.stringify({ key1: 3 })));

        cacheService = proxyCache.default(doubles.redisClientStub);
        cacheService.getValue = getValueStub;
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.getObject, 'function');
      });

      it('should call the own module\'s getValue() once', function () {
        cacheService.getObject('my key');
        assert.isTrue(getValueStub.calledOnce);
      });

      it('should call the own module\'s getValue() with 1 argument', function () {
        cacheService.getObject('my key');
        assert.strictEqual(getValueStub.args[0].length, 1);
      });

      it('should call the own module\'s getValue() with the argument provided to the "getObject" property', function () {
        const myKey = 'my key';
        cacheService.getObject(myKey);
        assert.strictEqual(getValueStub.args[0][0], myKey);
      });

      describe('if getValue() returns a promise that resolves with "null"', function () {
        it('should return an empty object', function () {
          getValueStub.returns(Promise.resolve(null));
          return(
            cacheService.getObject('my key')
            .then(function (value) {
              assert.isEmpty(value);
            })
          );
        });
      });

      describe('if getValue() returns a promise that resolves with a string', function () {
        it('should return the JSON parsed version of that string', function () {
          const myObj = { key1: 3, key2: 'value2' };
          getValueStub.returns(Promise.resolve(JSON.stringify(myObj)));
          return(
            cacheService.getObject('my key')
            .then(function (value) {
              assert.deepEqual(value, myObj);
            })
          );
        });
      });
      
      describe('if getValue() returns a promise that rejects', function () {
        it('should let the Error bubble up', function () {
          const testError = new Error('test error message');
          getValueStub.returns(Promise.reject(testError));
          return(
            cacheService.getObject('my key')
            .then(function () {
              assert.fail();
            })
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });

    it('should return an object with "expireKey" property', function () {
      assert.hasAnyKeys(proxyCache.default(doubles.redisClientStub), 'expireKey');
    });

    describe('"expireKey" property of the return object', function () {
      let promiseExpireStub;
      let returnPromise;
      let cacheService;
      beforeEach(function () {
        promiseExpireStub = sandbox.stub();

        returnPromise = Promise.resolve(true);
        promiseExpireStub.returns(returnPromise);
        bindStub.returns(promiseExpireStub);

        cacheService = proxyCache.default(doubles.redisClientStub);
      });

      it('should be a function', function () {
        assert.typeOf(cacheService.expireKey, 'function');
      });

      it('should call the redis client "expire" function once, when invocked', function () {
        cacheService.expireKey('my key', 1234);
        assert.isTrue(promiseExpireStub.calledOnce);
      });

      it('should call the redis client "expire" function with 2 arguments, when invocked', function () {
        cacheService.expireKey('my key', 999);
        assert.strictEqual(promiseExpireStub.args[0].length, 2);
      });
      
      it('should call the redis client "expire" function with the provided arguments, when invocked', function () {
        const key = 'my key';
        const ttl = 101010
        cacheService.expireKey(key, ttl);
        assert.deepEqual(promiseExpireStub.args[0], [ key, ttl ]);
      });

      it('should return the result of the redis client "expire" function', function () {
        assert.strictEqual(cacheService.expireKey('my key', 11), returnPromise);
      });
    });
  });
});