'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const cacheGetValue = require('../../../../dist/cache/handlers/cacheGetValue');
const cacheStoreValue = require('../../../../dist/cache/handlers/cacheStoreValue');
const cacheGetObject = require('../../../../dist/cache/handlers/cacheGetObject');
const cacheStoreObject = require('../../../../dist/cache/handlers/cacheStoreObject');
const cacheStoreObjectIfNotExists = require('../../../../dist/cache/handlers/cacheStoreObjectIfNotExists');
const cacheExpireKey = require('../../../../dist/cache/handlers/cacheExpireKey');
const cacheDeleteKeys = require('../../../../dist/cache/handlers/cacheDeleteKeys');
const cacheKeysExist = require('../../../../dist/cache/handlers/cacheKeysExist');

describe('Cache - Handlers - index', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyIndex;

  beforeEach(function () {
    doubles = {
      cacheObject: sandbox.stub(),
      cacheGetValue: sandbox.stub(cacheGetValue),
      cacheStoreValue: sandbox.stub(cacheStoreValue),
      cacheGetObject: sandbox.stub(cacheGetObject),
      cacheStoreObject: sandbox.stub(cacheStoreObject),
      cacheStoreObjectIfNotExists: sandbox.stub(cacheStoreObjectIfNotExists),
      cacheExpireKey: sandbox.stub(cacheExpireKey),
      cacheDeleteKeys: sandbox.stub(cacheDeleteKeys),
      cacheKeysExist: sandbox.stub(cacheKeysExist),
    };
    proxyIndex = proxyquire('../../../../dist/cache/handlers/index.js', {
      './cacheGetValue': doubles.cacheGetValue,
      './cacheStoreValue': doubles.cacheStoreValue,
      './cacheGetObject': doubles.cacheGetObject,
      './cacheStoreObject': doubles.cacheStoreObject,
      './cacheStoreObjectIfNotExists': doubles.cacheStoreObjectIfNotExists,
      './cacheExpireKey': doubles.cacheExpireKey,
      './cacheDeleteKeys': doubles.cacheDeleteKeys,
      './cacheKeysExist': doubles.cacheKeysExist,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should return an object', function () {
    assert.typeOf(proxyIndex.default(doubles.cacheObject), 'Object');
  });

  describe('returned object', function () {
    let returnedObject;
    beforeEach(function () {
      returnedObject = proxyIndex.default(doubles.cacheObject);
    });

    it('should have a "cacheGetValueHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheGetValueHandler'));
    });

    it('should have a "cacheStoreValueHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheStoreValueHandler'));
    });
    
    it('should have a "cacheGetObjectHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheGetObjectHandler'));
    });
    
    it('should have a "cacheStoreObjectHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheStoreObjectHandler'));
    });
    
    it('should have a "cacheStoreObjectIfNotExistsHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheStoreObjectIfNotExistsHandler'));
    });
    
    it('should have a "cacheExpireKeyHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheExpireKeyHandler'));
    });
    
    it('should have a "cacheDeleteKeysHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheDeleteKeysHandler'));
    });
    
    it('should have a "cacheKeysExistHandler" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(returnedObject).includes('cacheKeysExistHandler'));
    });

    it('should call the default export of the cacheGetValue module once', function () {
      assert.isTrue(doubles.cacheGetValue.default.calledOnce);
    });

    it('should call the default export of the cacheGetValue module with 1 argument', function () {
      assert.strictEqual(doubles.cacheGetValue.default.args[0].length, 1);
    });

    it('should call the default export of the cacheGetValue module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheGetValue.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheStoreValue module once', function () {
      assert.isTrue(doubles.cacheStoreValue.default.calledOnce);
    });

    it('should call the default export of the cacheStoreValue module with 1 argument', function () {
      assert.strictEqual(doubles.cacheStoreValue.default.args[0].length, 1);
    });

    it('should call the default export of the cacheStoreValue module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheStoreValue.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheGetObject module once', function () {
      assert.isTrue(doubles.cacheGetObject.default.calledOnce);
    });

    it('should call the default export of the cacheGetObject module with 1 argument', function () {
      assert.strictEqual(doubles.cacheGetObject.default.args[0].length, 1);
    });

    it('should call the default export of the cacheGetObject module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheGetObject.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheStoreObject module once', function () {
      assert.isTrue(doubles.cacheStoreObject.default.calledOnce);
    });

    it('should call the default export of the cacheStoreObject module with 1 argument', function () {
      assert.strictEqual(doubles.cacheStoreObject.default.args[0].length, 1);
    });

    it('should call the default export of the cacheStoreObject module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheStoreObject.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheStoreObjectIfNotExists module once', function () {
      assert.isTrue(doubles.cacheStoreObjectIfNotExists.default.calledOnce);
    });

    it('should call the default export of the cacheStoreObjectIfNotExists module with 1 argument', function () {
      assert.strictEqual(doubles.cacheStoreObjectIfNotExists.default.args[0].length, 1);
    });

    it('should call the default export of the cacheStoreObjectIfNotExists module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheStoreObjectIfNotExists.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheExpireKey module once', function () {
      assert.isTrue(doubles.cacheExpireKey.default.calledOnce);
    });

    it('should call the default export of the cacheExpireKey module with 1 argument', function () {
      assert.strictEqual(doubles.cacheExpireKey.default.args[0].length, 1);
    });

    it('should call the default export of the cacheExpireKey module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheExpireKey.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheDeleteKeys module once', function () {
      assert.isTrue(doubles.cacheDeleteKeys.default.calledOnce);
    });

    it('should call the default export of the cacheDeleteKeys module with 1 argument', function () {
      assert.strictEqual(doubles.cacheDeleteKeys.default.args[0].length, 1);
    });

    it('should call the default export of the cacheDeleteKeys module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheDeleteKeys.default.args[0][0], doubles.cacheObject);
    });

    it('should call the default export of the cacheKeysExist module once', function () {
      assert.isTrue(doubles.cacheKeysExist.default.calledOnce);
    });

    it('should call the default export of the cacheKeysExist module with 1 argument', function () {
      assert.strictEqual(doubles.cacheKeysExist.default.args[0].length, 1);
    });

    it('should call the default export of the cacheKeysExist module with the provided cache object', function () {
      assert.strictEqual(doubles.cacheKeysExist.default.args[0][0], doubles.cacheObject);
    });

    describe('"cacheGetValueHandler" property', function () {
      it('should have the return value of the default export of the cacheGetValue module', function () {
        const handler = { cache: 'getValue' };
        doubles.cacheGetValue.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheGetValueHandler, handler);
      });
    });
    
    describe('"cacheStoreValueHandler" property', function () {
      it('should have the return value of the default export of the cacheStoreValue module', function () {
        const handler = { cache: 'storeValue' };
        doubles.cacheStoreValue.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheStoreValueHandler, handler);
      });
    });
    
    describe('"cacheGetObjectHandler" property', function () {
      it('should have the return value of the default export of the cacheGetObject module', function () {
        const handler = { cache: 'getObject' };
        doubles.cacheGetObject.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheGetObjectHandler, handler);
      });
    });
    
    describe('"cacheStoreObjectHandler" property', function () {
      it('should have the return value of the default export of the cacheStoreObject module', function () {
        const handler = { cache: 'storeObject' };
        doubles.cacheStoreObject.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheStoreObjectHandler, handler);
      });
    });
    
    describe('"cacheStoreObjectIfNotExistsHandler" property', function () {
      it('should have the return value of the default export of the cacheStoreObjectIfNotExists module', function () {
        const handler = { cache: 'cacheStoreObjectIfNotExists' };
        doubles.cacheStoreObjectIfNotExists.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheStoreObjectIfNotExistsHandler, handler);
      });
    });
    
    describe('"cacheExpireKeyHandler" property', function () {
      it('should have the return value of the default export of the cacheExpireKey module', function () {
        const handler = { cache: 'cacheExpireKey' };
        doubles.cacheExpireKey.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheExpireKeyHandler, handler);
      });
    });
    
    describe('"cacheDeleteKeysHandler" property', function () {
      it('should have the return value of the default export of the cacheDeleteKeys module', function () {
        const handler = { cache: 'cacheDeleteKeys' };
        doubles.cacheDeleteKeys.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheDeleteKeysHandler, handler);
      });
    });
    
    describe('"cacheKeysExistHandler" property', function () {
      it('should have the return value of the default export of the cacheKeysExist module', function () {
        const handler = { cache: 'cacheKeysExist' };
        doubles.cacheKeysExist.default.returns(handler);
        returnedObject = proxyIndex.default(doubles.cacheObject);
        assert.strictEqual(returnedObject.cacheKeysExistHandler, handler);
      });
    });
  });
});