'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const mongodb = require('mongodb');

describe('DB - utils - mongo', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyModule;

  beforeEach(function () {
    doubles = {
    };
    proxyModule = proxyquire('../../../../dist/db/utils/mongo', {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('prepareQuery()', function () {
    it('should not return the provided object', function () {
      const queryObject = {};
      assert.notStrictEqual(proxyModule.prepareQuery(queryObject), queryObject);
    });
    
    describe('if the provided object does not have an "id" property', function () {
      it('should return a deep copy of the provided object', function () {
        const queryObject = { key1: '', key2: 4, key3: {} };
        assert.deepEqual(proxyModule.prepareQuery(queryObject), queryObject);
      });
    });
    
    describe('if the provided object has an "id" property', function () {
      it('should remove it from the returned object', function () {
        const queryObject = { key1: '', key2: 4, key3: {}, id: new mongodb.ObjectID(1234567890).toHexString() };
        assert.notProperty(proxyModule.prepareQuery(queryObject), 'id');
      });
      
      it('should add an "_id" property to the returned object', function () {
        const queryObject = { key1: '', key2: 4, key3: {}, id: new mongodb.ObjectID(1234567890).toHexString() };
        assert.property(proxyModule.prepareQuery(queryObject), '_id');
      });

      describe('"_id" property of the returned object', function () {
        it('should have the same hex string value as the one in the "id" property of the provided object', function () {
          const testObjectId = new mongodb.ObjectID(1234567890);
          const result = proxyModule.prepareQuery({ key1: '', key2: 4, key3: {}, id: testObjectId.toHexString() });
          assert.strictEqual(result['_id'].toHexString(), testObjectId.toHexString());
        });
        
        it('should be enumerable', function () {
          const result = proxyModule.prepareQuery({ key1: '', key2: 4, key3: {}, id: new mongodb.ObjectID(1234567890).toHexString() });
          assert.isTrue(Object.getOwnPropertyDescriptor(result, '_id').enumerable);
        });
        
        it('should not be writable', function () {
          const result = proxyModule.prepareQuery({ key1: '', key2: 4, key3: {}, id: new mongodb.ObjectID(1234567890).toHexString() });
          assert.isFalse(Object.getOwnPropertyDescriptor(result, '_id').writable);
        });
      });
    });
  });

  describe('prepareResult()', function () {
    it('should not return the provided object', function () {
      const argObject = {};
      assert.notStrictEqual(proxyModule.prepareResult(argObject), argObject);
    });

    describe('if the provided object does not have an "_id" property', function () {
      it('should return a deep copy of the provided object', function () {
        const argObject = { key1: '', key2: 4, key3: {} };
        assert.deepEqual(proxyModule.prepareResult(argObject), argObject);
      });
    });
    
    describe('if the provided object has an "_id" property', function () {
      it('should remove it from the returned object', function () {
        const argObject = { key1: '', key2: 4, key3: {}, _id: new mongodb.ObjectID(1234) };
        assert.notProperty(proxyModule.prepareResult(argObject), '_id');
      });
      
      it('should add an "id" property to the returned object', function () {
        const argObject = { key1: '', key2: 4, key3: {}, _id: new mongodb.ObjectID(1234) };
        assert.property(proxyModule.prepareResult(argObject), 'id');
      });

      describe('"id" property of the returned object', function () {
        it('should have the same mongodb ObjectID value as the one in the "_id" property of the provided object', function () {
          const testObjectId = new mongodb.ObjectID(1234567890);
          const result = proxyModule.prepareResult({ key1: '', key2: 4, key3: {}, _id: testObjectId });
          assert.strictEqual(result['id'], testObjectId);
        });
        
        it('should be enumerable', function () {
          const result = proxyModule.prepareResult({ key1: '', key2: 4, key3: {}, _id: new mongodb.ObjectID(1234567890) });
          assert.isTrue(Object.getOwnPropertyDescriptor(result, 'id').enumerable);
        });
        
        it('should be writable', function () {
          const result = proxyModule.prepareResult({ key1: '', key2: 4, key3: {}, _id: new mongodb.ObjectID(1234567890) });
          assert.isTrue(Object.getOwnPropertyDescriptor(result, 'id').writable);
        });
      });
    });
  });
});