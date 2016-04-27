var Promise = require('bluebird');
var fs = require('fs');
var EOL = require('os').EOL;

var filequeues = {};

/**
 * @class
 * @param {string} filename
 */
function File(filename) {
	var self = this;
	
	this.filename = filename;
	if (!filequeues[filename]) {filequeues[filename] = Promise.resolve();}
	var queue = filequeues[filename];

	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.writeLine = function(data, options) {
		return self.write(makeLine(data), options);
	};
	
	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.write = function(data, options) {
		return queue.finally(function() {
			return new Promise(function(resolve, reject) {
				fs.writeFile(self.filename, data, options, function(err, response) {
					if (err) {return reject(err);}
					resolve(response);
				});
			});
		});
	};

	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.appendLine = function(data, options) {
		return self.append(makeLine(data), options);
	};
	
	/**
	 * @param {String|Number|Buffer} data
	 * @param {Object|String} options
	 * @returns {Promise}
	 */
	this.append = function(data, options) {
		return queue.then(function() {
			return new Promise(function(resolve, reject) {
				fs.appendFile(self.filename, data, options, function(err, response) {
					if (err) {return reject(err);}
					resolve(response);
				});
			});
		});
	};
	
	function makeLine(data) {
		if (!data.endsWith(EOL)) {data += EOL;}
		return data;
	}
	
}

module.exports = File;