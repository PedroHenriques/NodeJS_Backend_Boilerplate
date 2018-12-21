'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const dbFindOne = require('../../../../dist/db/handlers/dbFindOne');
const dbFindOneUpdate = require('../../../../dist/db/handlers/dbFindOneUpdate');
const dbInsertOne = require('../../../../dist/db/handlers/dbInsertOne');

describe('DB - handlers - index', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyIndex;

  beforeEach(function () {
    doubles = {
      dbFindOneStub: sandbox.stub(dbFindOne),
      dbFindOneUpdateStub: sandbox.stub(dbFindOneUpdate),
      dbInsertOneStub: sandbox.stub(dbInsertOne),
      dbObject: {},
    };
    proxyIndex = proxyquire('../../../../dist/db/handlers/index', {
      './dbFindOne': doubles.dbFindOneStub,
      './dbFindOneUpdate': doubles.dbFindOneUpdateStub,
      './dbInsertOne': doubles.dbInsertOneStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyIndex.default, 'function');
    });

    it('should call the default export of the dbFindOne module once', function () {
      proxyIndex.default();
      assert.isTrue(doubles.dbFindOneStub.default.calledOnce);
    });
    
    it('should call the default export of the dbFindOne module with 1 argument', function () {
      proxyIndex.default();
      assert.strictEqual(doubles.dbFindOneStub.default.args[0].length, 1);
    });
    
    it('should call the default export of the dbFindOne module with the db object provided to this function', function () {
      proxyIndex.default(doubles.dbObject);
      assert.strictEqual(doubles.dbFindOneStub.default.args[0][0], doubles.dbObject);
    });

    it('should call the default export of the dbFindOneUpdate module once', function () {
      proxyIndex.default();
      assert.isTrue(doubles.dbFindOneUpdateStub.default.calledOnce);
    });
    
    it('should call the default export of the dbFindOneUpdate module with 1 argument', function () {
      proxyIndex.default();
      assert.strictEqual(doubles.dbFindOneUpdateStub.default.args[0].length, 1);
    });
    
    it('should call the default export of the dbFindOneUpdate module with the db object provided to this function', function () {
      proxyIndex.default(doubles.dbObject);
      assert.strictEqual(doubles.dbFindOneUpdateStub.default.args[0][0], doubles.dbObject);
    });

    it('should call the default export of the dbInsertOne module once', function () {
      proxyIndex.default();
      assert.isTrue(doubles.dbInsertOneStub.default.calledOnce);
    });
    
    it('should call the default export of the dbInsertOne module with 1 argument', function () {
      proxyIndex.default();
      assert.strictEqual(doubles.dbInsertOneStub.default.args[0].length, 1);
    });
    
    it('should call the default export of the dbInsertOne module with the db object provided to this function', function () {
      proxyIndex.default(doubles.dbObject);
      assert.strictEqual(doubles.dbInsertOneStub.default.args[0][0], doubles.dbObject);
    });

    it('should return an object with the correct properties', function () {
      assert.hasAllKeys(proxyIndex.default(), [ 'dbFindOne', 'dbFindOneUpdate', 'dbInsertOne' ]);
    });

    describe('"dbFindOne" property of the returned object', function () {
      it('should have the result of the call to the default export of the dbFindOne module', function () {
        const factoryReturn = {};
        doubles.dbFindOneStub.default.returns(factoryReturn);
        assert.strictEqual(proxyIndex.default().dbFindOne, factoryReturn);
      });
    });
    
    describe('"dbFindOneUpdate" property of the returned object', function () {
      it('should have the result of the call to the default export of the dbFindOneUpdate module', function () {
        const factoryReturn = {};
        doubles.dbFindOneUpdateStub.default.returns(factoryReturn);
        assert.strictEqual(proxyIndex.default().dbFindOneUpdate, factoryReturn);
      });
    });
    
    describe('"dbInsertOne" property of the returned object', function () {
      it('should have the result of the call to the default export of the dbInsertOne module', function () {
        const factoryReturn = {};
        doubles.dbInsertOneStub.default.returns(factoryReturn);
        assert.strictEqual(proxyIndex.default().dbInsertOne, factoryReturn);
      });
    });
  });
});