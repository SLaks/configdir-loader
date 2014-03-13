"use strict";

if (process.browser)
	throw new Error("configdir-loader cannot run under Browserify");

var fs = require("fs");
var path = require("path");
var _ = require('lodash');

module.exports = load;
module.exports.load = load;
module.exports.loadDirectory = loadDirectory;

/**
 * Loads configuration files from a set of directories.
 * 
 * @param {String} environment	The environment suffix to load files for.
 * @param {Array} directories	An array of directories to read.
 * 
 * @returns {Object}			A configuration object containing all of the loaded files.
 */
function load(environment, directories) {
	if (!Array.isArray(directories))
		directories = Array.prototype.slice.call(arguments, 1);

	return _.merge.apply(void 0, directories.map(loadDirectory.bind(void 0, environment)));
}

/**
 * Loads configuration files from a single directory.
 * 
 * @param {String} environment	The environment suffix to load files for.
 * @param {String} dir			The path to the directory to read.
 * 
 * @returns {Object}			A configuration object containing all of the loaded files.
 */
function loadDirectory(environment, dir) {
	var objName;
	var envRegex = new RegExp('-' + environment + '\\.js(on)?$');

	var result = { environment: environment };

	// First, find all environment-specific files
	var names = fs.readdirSync(dir);
	for (var i = 0; i < names.length; i++) {
		var envIndex = names[i].search(envRegex);
		if (envIndex < 0)
			continue;
		objName = names[i].substr(0, envIndex);

		result[objName] = require(path.join(dir, names[i]));

		// Try loading the base file (using require's standard filename resolution)
		try {
			result[objName] = _.merge(require(path.join(dir, objName + '-base')), result[objName]);
		} catch (e) {
			if (/^Cannot find module /.test(e.message))
				continue;	// If there is no base file, do nothing
			else
				throw e;
		}
	}

	// Then, read all unsuffixed files.
	for (i = 0; i < names.length; i++) {
		if (/-/.test(names[i]))
			continue;	// Skip files for other environments

		var extensionPoint = names[i].search(/\.js(on)?$/);
		if (extensionPoint < 0)
			continue;	// Skip non-Javascript files
		objName = names[i].substr(0, extensionPoint);	//Remove extension
		if (result.hasOwnProperty(objName))
			continue;	// Skip files that we loaded environment-specific versions of

		result[objName] = require(path.join(dir, names[i]));
	}

	return result;
}
