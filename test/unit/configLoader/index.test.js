'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const configLoader = require('../../../dist/configLoader/services/configLoader');
const socketConnection = require('../../../dist/sharedLibs/utils/socketConnection');
const queue = require('../../../dist/sharedLibs/utils/queue');
const cacheKeyGenerator = require('../../../dist/sharedLibs/utils/cacheKeyGenerator');

describe('ConfigLoader - index', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyStubs;

  beforeEach(function () {
    doubles = {
      pathStub: {
        join: sandbox.stub(),
        resolve: sandbox.stub(),
      },
      configLoaderStub: sandbox.stub(configLoader),
      socketConnectionStub: sandbox.stub(socketConnection),
      queueStub: sandbox.stub(queue),
      cacheKeyGeneratorStub: sandbox.stub(cacheKeyGenerator),
      configLoaderObject: {
        startCheckUp: sandbox.stub(),
      },
    };
    proxyStubs = {
      'path': doubles.pathStub,
      './services/configLoader': doubles.configLoaderStub,
      '../sharedLibs/utils/socketConnection': doubles.socketConnectionStub,
      '../sharedLibs/utils/queue': doubles.queueStub,
      '../sharedLibs/utils/cacheKeyGenerator': doubles.cacheKeyGeneratorStub,
    };

    doubles.configLoaderStub.default.returns(doubles.configLoaderObject);
  });

  afterEach(function () {
    sandbox.restore();
    delete process.env.CACHE_HOST;
    delete process.env.CACHE_PORT;
    delete process.env.QUEUE_CON_URL;
  });

  it('should call the "join" function of the path module once', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.isTrue(doubles.pathStub.join.calledOnce);
  });
  
  describe('first call', function () {
    it('should call it with 3 arguments', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.pathStub.join.args[0].length, 3);
    });
    
    it('should call it with the "userAccountConfig" relative file path parts', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.deepEqual(
        doubles.pathStub.join.args[0],
        [ '.', 'config', 'userAccountConfig.json' ]
      );
    });
  });

  it('should call the "resolve" function of the path module once', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.isTrue(doubles.pathStub.resolve.calledOnce);
  });
  
  describe('first call', function () {
    it('should call it with 1 argument', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.pathStub.resolve.args[0].length, 1);
    });
    
    it('should call it with the return value of the first call to the join function of the path module', function () {
      doubles.pathStub.join.onCall(0).returns('relative path for call 0');
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.pathStub.resolve.args[0][0], 'relative path for call 0');
    });
  });

  it('should call the "userAccountConfigKeyGen" of the cacheKeyGenerator module once', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.isTrue(doubles.cacheKeyGeneratorStub.userAccountConfigKeyGen.calledOnce);
  });
  
  it('should call the "userAccountConfigKeyGen" of the cacheKeyGenerator module with no arguments', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.strictEqual(doubles.cacheKeyGeneratorStub.userAccountConfigKeyGen.args[0].length, 0);
  });

  it('should call the default export of the configLoader module once', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.isTrue(doubles.configLoaderStub.default.calledOnce);
  });
  
  it('should call the default export of the configLoader module with 1 argument', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.strictEqual(doubles.configLoaderStub.default.args[0].length, 1);
  });
  
  it('should call the default export of the configLoader module with the "userAccountConfig" file key', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.isFalse(doubles.configLoaderStub.default.args[0][0].filesToWatch.userAccountConfig === undefined);
  });
  
  describe('"userAccountConfig" key', function () {;
    it('should have the return value of the first call to the resolve function of the path module in the "path" property', function () {
      doubles.pathStub.resolve.onCall(0).returns('first file absolute path');
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(
        doubles.configLoaderStub.default.args[0][0].filesToWatch.userAccountConfig.path,
        'first file absolute path'
      );
    });
    
    it('should have -1 in the "lastModified" property', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(
        doubles.configLoaderStub.default.args[0][0].filesToWatch.userAccountConfig.lastModified,
        -1
      );
    });
    
    it('should have the return value of the userAccountConfigKeyGen function of the cacheKeyGenerator module in the "persistKey" property', function () {
      doubles.cacheKeyGeneratorStub.userAccountConfigKeyGen.returns('user account config persist key');
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(
        doubles.configLoaderStub.default.args[0][0].filesToWatch.userAccountConfig.persistKey,
        'user account config persist key'
      );
    });
  });

  it('should call the startCheckUp function of the return value of the default export of the configLoader module once', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.isTrue(doubles.configLoaderObject.startCheckUp.calledOnce);
  });
  
  it('should call the startCheckUp function of the return value of the default export of the configLoader module with no arguments', function () {
    proxyquire('../../../dist/configLoader/index.js', proxyStubs);
    assert.strictEqual(doubles.configLoaderObject.startCheckUp.args[0].length, 0);
  });

  describe('if the QUEUE_CON_URL env variable is set', function () {
    beforeEach(function () {
      process.env.QUEUE_CON_URL = 'queue con URL';
    });

    it('should call the connectWithRetry function of the queue module once', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.isTrue(doubles.queueStub.connectWithRetry.calledOnce);
    });
    
    it('should call the connectWithRetry function of the queue module with 1 argument', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.queueStub.connectWithRetry.args[0].length, 1);
    });
    
    it('should call the connectWithRetry function of the queue module with the env variable value in the "connectionURL" property', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.queueStub.connectWithRetry.args[0][0].connectionURL, 'queue con URL');
    });
  });

  describe('if the CACHE_HOST and CACHE_PORT env variables are set', function () {
    beforeEach(function () {
      process.env.CACHE_HOST = 'cache host';
      process.env.CACHE_PORT = '90796674';
    });

    it('should call the connectSocket function of the socketConnection module once', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.isTrue(doubles.socketConnectionStub.connectSocket.calledOnce);
    });
    
    it('should call the connectSocket function of the socketConnection module with 3 arguments', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.socketConnectionStub.connectSocket.args[0].length, 3);
    });
    
    it('should call the connectSocket function of the socketConnection module with value of the CACHE_HOST env variable as the 1st argument', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.socketConnectionStub.connectSocket.args[0][0], 'cache host');
    });
    
    it('should call the connectSocket function of the socketConnection module with value of the CACHE_PORT env variable as the 2nd argument', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.socketConnectionStub.connectSocket.args[0][1], 90796674);
    });
    
    it('should call the connectSocket function of the socketConnection module with "cache" as the 3rd argument', function () {
      proxyquire('../../../dist/configLoader/index.js', proxyStubs);
      assert.strictEqual(doubles.socketConnectionStub.connectSocket.args[0][2], 'cache');
    });
  });
});