/* global describe, it */
"use strict";

var assert = require('assert');

var loader = require('../configdir-loader.js');

describe('configdir-loader', function () {
	it('should load prod-specific files', function () {
		var actual = loader.load('prod', __dirname + '/fixtures/config1');
		var expected = {
			environment: 'prod',
			configInfo: { config1: true },
			env: { envMode: "normal", serverMode: "production" },
			keys: { someAPI: "prod-key" }
		};

		assert.deepEqual(actual, expected);
	});
	it('should load dev-specific files', function () {
		var actual = loader.load('dev', __dirname + '/fixtures/config1');
		var expected = {
			environment: 'dev',
			configInfo: { config1: true },
			keys: { someAPI: "dev-key" }
		};

		assert.deepEqual(actual, expected);
	});
	it('should merge multiple folders', function () {
		var actual = loader.load('dev', [__dirname + '/fixtures/config1', __dirname + '/fixtures/config2']);
		var expected = {
			environment: 'dev',
			configInfo: { config1: true, config2: true },
			keys: { someAPI: "dev-key" },
			appSettings: { port: 5000 }
		};

		assert.deepEqual(actual, expected);
	});
});