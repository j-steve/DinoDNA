var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Asset			= require('../lib/Assert');
var GenosetCriteriaParser = require('./GenosetCriteriaParser');

var GenosetCriteria = new DataCollection('genoset');

var cachedTests = {};

GenosetCriteria.Entity.test = function(dnaProfileId) {
	if (!cachedTests.hasOwnProperty(dnaProfileId)) { 
		var criteria = this.criteria.replace(/#.+/g, '').replace(/\s/g, '').replace(/;/g, ',');
		cachedTests[dnaProfileId] = GenosetCriteriaParser(criteria, dnaProfileId);
	}
	return cachedTests[dnaProfileId];
};

module.exports = GenosetCriteria;