'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const mongodb = require('mongodb');
const mongoUtils = require('../../../../dist/db/utils/mongo');

describe('DB - services - db', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyDb;

  beforeEach(function () {
    doubles = {
      mongoDbStub: {
        collection: sandbox.stub(),
      },
      mongoUtilsStubs: sandbox.stub(mongoUtils),
    };
    proxyDb = proxyquire('../../../../dist/db/services/db', {
      '../utils/mongo': doubles.mongoUtilsStubs,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should return an object with the expected properties', function () {
      assert.hasAllKeys(proxyDb.default({}), [ 'insertOne', 'findOne', 'findOneUpdate' ]);
    });

    describe('"insertOne" property of the returned object', function () {
      let db;
      let insertOneStub;
      const insertedId = mongodb.ObjectID(12345);

      beforeEach(function () {
        insertOneStub = sandbox.stub();
        insertOneStub.returns(Promise.resolve({ insertedId }));
        doubles.mongoDbStub.collection.returns({ insertOne: insertOneStub });
        db = proxyDb.default(doubles.mongoDbStub);
      });

      it('should call the collection() function of the object provided to the default export once', function () {
        db.insertOne({ collection: 'test collection name', item: {} });
        assert.isTrue(doubles.mongoDbStub.collection.calledOnce);
      });
      
      it('should call the collection() function of the object provided to the default export with 1 argument', function () {
        db.insertOne({ collection: 'test collection name', item: {} });
        assert.strictEqual(doubles.mongoDbStub.collection.args[0].length, 1);
      });
      
      it('should call the collection() function of the object provided to the default export with the value of the "collection" property of the object provided to this function', function () {
        db.insertOne({ collection: 'test collection name', item: {} });
        assert.strictEqual(doubles.mongoDbStub.collection.args[0][0], 'test collection name');
      });
      
      it('should call the insertOne() function of the object returned by the call to mongodb module\'s collection() function once', function () {
        db.insertOne({ collection: 'test collection name', item: {} });
        assert.isTrue(insertOneStub.calledOnce);
      });
      
      it('should call the insertOne() function of the object returned by the call to mongodb module\'s collection() function with 1 argument', function () {
        db.insertOne({ collection: 'test collection name', item: {} });
        assert.strictEqual(insertOneStub.args[0].length, 1);
      });
      
      it('should call the insertOne() function of the object returned by the call to mongodb module\'s collection() function with the "item" property of the object provided to this function', function () {
        const testItem = {};
        db.insertOne({ collection: 'test collection name', item: testItem });
        assert.strictEqual(insertOneStub.args[0][0], testItem);
      });
      
      it('should return a promise', function () {
        assert.typeOf(db.insertOne({ collection: 'test collection name', item: {} }), 'promise');
      });
      
      it('should return a promise that resolves with the string representation of the resolve value of the promise returned by the call to mongodb\'s Collection insertOne()', function () {
        return(
          db.insertOne({ collection: 'test collection name', item: {} })
          .then(function (result) {
            assert.strictEqual(result, insertedId.toHexString());
          })
        );
      });

      describe('if the mongodb\'s Collection insertOne() returns a promise that rejects', function () {
        it('should throw the Error object from the rejected promise', function () {
          const testError = new Error('test error message');
          const returnPromise = Promise.reject(testError);
          insertOneStub.returns(returnPromise);
          return(
            db.insertOne({ collection: 'test collection name', item: {} })
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });

    describe('"findOne" property of the returned object', function () {
      let db;
      let findOneStub;

      beforeEach(function () {
        findOneStub = sandbox.stub();
        findOneStub.returns(Promise.resolve({}));
        doubles.mongoDbStub.collection.returns({ findOne: findOneStub });
        db = proxyDb.default(doubles.mongoDbStub);
      });

      it('should call the prepareQuer() function of the mongo utils module once', function () {
        db.findOne({});
        assert.isTrue(doubles.mongoUtilsStubs.prepareQuery.calledOnce);
      });
      
      it('should call the prepareQuer() function of the mongo utils module with 1 argument', function () {
        db.findOne({});
        assert.strictEqual(doubles.mongoUtilsStubs.prepareQuery.args[0].length, 1);
      });
      
      it('should call the prepareQuer() function of the mongo utils module with the "query" property of the object provided to this function', function () {
        const queryObj = {};
        db.findOne({ query: queryObj });
        assert.strictEqual(doubles.mongoUtilsStubs.prepareQuery.args[0][0], queryObj);
      });
      
      it('should call the collection() function of the mongodb module once', function () {
        db.findOne({});
        assert.isTrue(doubles.mongoDbStub.collection.calledOnce);
      });
      
      it('should call the collection() function of the mongodb module with 1 argument', function () {
        db.findOne({});
        assert.strictEqual(doubles.mongoDbStub.collection.args[0].length, 1);
      });
      
      it('should call the collection() function of the mongodb module with the "collection" property of the object provided to this function', function () {
        db.findOne({ collection: 'test collection arg' });
        assert.strictEqual(doubles.mongoDbStub.collection.args[0][0], 'test collection arg');
      });
      
      it('should call the findOne property of the object returned by the collection() function of the mongodb module once', function () {
        db.findOne({});
        assert.isTrue(findOneStub.calledOnce);
      });
      
      it('should call the findOne property of the object returned by the collection() function of the mongodb module with 1 argument', function () {
        db.findOne({});
        assert.strictEqual(findOneStub.args[0].length, 1);
      });
      
      it('should call the findOne property of the object returned by the collection() function of the mongodb module with the result of calling the prepareQuery() function of the mongo utils module', function () {
        const preparedQuery = {};
        doubles.mongoUtilsStubs.prepareQuery.returns(preparedQuery);
        db.findOne({});
        assert.strictEqual(findOneStub.args[0][0], preparedQuery);
      });
      
      it('should call the prepareResult() function of the mongo utils module once', function () {
        return(
          db.findOne({})
          .then(function () {
            assert.isTrue(doubles.mongoUtilsStubs.prepareResult.calledOnce);
          })
        );
      });
      
      it('should call the prepareResult() function of the mongo utils module with 1 argument', function () {
        return(
          db.findOne({})
          .then(function () {
            assert.strictEqual(doubles.mongoUtilsStubs.prepareResult.args[0].length, 1);
          })
        );
      });
      
      it('should call the prepareResult() function of the mongo utils module with the result of the mongodb\'s findOne()', function () {
        const findOneResult = {};
        findOneStub.returns(Promise.resolve(findOneResult));
        return(
          db.findOne({})
          .then(function () {
            assert.strictEqual(doubles.mongoUtilsStubs.prepareResult.args[0][0], findOneResult);
          })
        );
      });
      
      it('should return a promise that resolves with the result of the prepareResult() function of the mongo utils module', function () {
        const preparedResult = {};
        doubles.mongoUtilsStubs.prepareResult.returns(preparedResult);
        return(
          db.findOne({})
          .then(function (result) {
            assert.strictEqual(result, preparedResult);
          })
        );
      });

      describe('if the call to prepareResult() of the mongo utils module returns a promise that rejects', function () {
        it('should return a promise that rejects', function () {
          const testError = new Error('test error message');
          findOneStub.returns(Promise.reject(testError));
          return(
            db.findOne({})
            .then(function () {
              assert.fail();
            })
            .catch(function () {
              assert.ok(true);
            })
          );
        });
        
        it('should return a promise that rejects with the Error object of the prepareResult() function\'s rejected promise', function () {
          const testError = new Error('test error message');
          findOneStub.returns(Promise.reject(testError));
          return(
            db.findOne({})
            .catch(function (error) {
              assert.strictEqual(error. testError);
            })
          );
        });
      });
    });

    describe('"findOneUpdate" property of the returned object', function () {
      let db;
      let findOneAndUpdateStub;

      beforeEach(function () {
        findOneAndUpdateStub = sandbox.stub();
        findOneAndUpdateStub.returns(Promise.resolve({
          ok: 1,
          value: {},
        }));
        doubles.mongoDbStub.collection.returns({ findOneAndUpdate: findOneAndUpdateStub });
        db = proxyDb.default(doubles.mongoDbStub);
      });

      it('should call the prepareQuery() function of the mongo utils module once', function () {
        db.findOneUpdate({});
        assert.isTrue(doubles.mongoUtilsStubs.prepareQuery.calledOnce);
      });
      
      it('should call the prepareQuery() function of the mongo utils module with 1 argument', function () {
        db.findOneUpdate({});
        assert.strictEqual(doubles.mongoUtilsStubs.prepareQuery.args[0].length, 1);
      });
      
      it('should call the prepareQuery() function of the mongo utils module with the "filter" property of the object provided to this function', function () {
        const filter = {};
        db.findOneUpdate({ filter });
        assert.strictEqual(doubles.mongoUtilsStubs.prepareQuery.args[0][0], filter);
      });
      
      it('should call the prepareQuery() function of the mongo utils module with the "filter" property of the object provided to this function', function () {
        const filter = {};
        db.findOneUpdate({ filter });
        assert.strictEqual(doubles.mongoUtilsStubs.prepareQuery.args[0][0], filter);
      });
      
      it('should call the collection() function of the mongodb\'s module once', function () {
        db.findOneUpdate({});
        assert.isTrue(doubles.mongoDbStub.collection.calledOnce);
      });
      
      it('should call the collection() function of the mongodb\'s module with 1 argument', function () {
        db.findOneUpdate({});
        assert.strictEqual(doubles.mongoDbStub.collection.args[0].length, 1);
      });
      
      it('should call the collection() function of the mongodb\'s module with the "collection" property of the object provided to this function', function () {
        db.findOneUpdate({ collection: 'test collection name' });
        assert.strictEqual(doubles.mongoDbStub.collection.args[0][0], 'test collection name');
      });
      
      it('should call the findOneAndUpdate() function of the object returned by the collection() function of the mongodb\'s module once', function () {
        return(
          db.findOneUpdate({})
          .then(function () {
            assert.isTrue(findOneAndUpdateStub.calledOnce);
          })
        );
      });
      
      it('should call the findOneAndUpdate() function of the object returned by the collection() function of the mongodb\'s module with 3 arguments', function () {
        return(
          db.findOneUpdate({})
          .then(function () {
            assert.strictEqual(findOneAndUpdateStub.args[0].length, 3);
          })
        );
      });

      describe('first argument', function () {
        it('should be the return value of the prepareQuery() function of the mongo utils module', function () {
          const preparedQuery = {};
          doubles.mongoUtilsStubs.prepareQuery.returns(preparedQuery);
          return(
            db.findOneUpdate({})
            .then(function () {
              assert.strictEqual(findOneAndUpdateStub.args[0][0], preparedQuery);
            })
          );
        });
      });
      
      describe('second argument', function () {
        it('should be the "update" property of the object provided to this function', function () {
          const updateObj = {};
          return(
            db.findOneUpdate({ update: updateObj })
            .then(function () {
              assert.strictEqual(findOneAndUpdateStub.args[0][1], updateObj);
            })
          );
        });
      });
      
      describe('third argument', function () {
        it('should be an object with the correct configurations', function () {
          return(
            db.findOneUpdate({})
            .then(function () {
              assert.deepEqual(
                findOneAndUpdateStub.args[0][2],
                { returnOriginal: false }
              );
            })
          );
        });
      });

      it('should call the prepareResult() function of the mongo utils module once', function () {
        return(
          db.findOneUpdate({})
          .then(function () {
            assert.isTrue(doubles.mongoUtilsStubs.prepareResult.calledOnce);
          })
        );
      });
      
      it('should call the prepareResult() function of the mongo utils module with 1 argument', function () {
        return(
          db.findOneUpdate({})
          .then(function () {
            assert.strictEqual(doubles.mongoUtilsStubs.prepareResult.args[0].length, 1);
          })
        );
      });
      
      it('should call the prepareResult() function of the mongo utils module with the "value" property of the object from the resolved promise of mongodb\'s collection findOneUpdate()', function () {
        const valueProperty = {};
        findOneAndUpdateStub.returns(Promise.resolve({
          ok: 1,
          value: valueProperty,
        }));
        return(
          db.findOneUpdate({})
          .then(function () {
            assert.strictEqual(doubles.mongoUtilsStubs.prepareResult.args[0][0], valueProperty);
          })
        );
      });

      describe('if the result of prepareResult() from the mongo utils module is null', function () {
        it('should return a promise that resolves with an empty object', function () {
          doubles.mongoUtilsStubs.prepareResult.returns(null);
          return(
            db.findOneUpdate({})
            .then(function (result) {
              assert.deepEqual(result, {});
            })
          );
        });
      });
      
      describe('if the result of prepareResult() from the mongo utils module is an object', function () {
        it('should return a promise that resolves with that object', function () {
          const preparedResult = {};
          doubles.mongoUtilsStubs.prepareResult.returns(preparedResult);
          return(
            db.findOneUpdate({})
            .then(function (result) {
              assert.strictEqual(result, preparedResult);
            })
          );
        });
      });

      describe('if the "ok" property of the object from the resolved promise returned by the call to findOneAndUpdate() of the mongodb\'s collection is not 1', function () {
        it('should return a promise that rejects', function () {
          findOneAndUpdateStub.returns(Promise.resolve({
            ok: 0,
            value: null,
            lastErrorObject: new Error('test error message'),
          }));
          return(
            db.findOneUpdate({})
            .catch(function () {
              assert.ok(true);
            })
          );
        });
        
        it('should return a promise that rejects with contents of the "lastErrorObject" property of that object', function () {
          const testError = new Error('test error message');
          findOneAndUpdateStub.returns(Promise.resolve({
            ok: 0,
            value: null,
            lastErrorObject: testError,
          }));
          return(
            db.findOneUpdate({})
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
      
      describe('if the call to findOneAndUpdate() of the mongodb\'s collection returns a promise that rejects', function () {
        it('should return a promise that rejects', function () {
          findOneAndUpdateStub.returns(Promise.reject(new Error('test error message')));
          return(
            db.findOneUpdate({})
            .catch(function () {
              assert.ok(true);
            })
          );
        });
        
        it('should return a promise that rejects with that Error object', function () {
          const testError = new Error('test error message');
          findOneAndUpdateStub.returns(Promise.reject(testError));
          return(
            db.findOneUpdate({})
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });
  });
});