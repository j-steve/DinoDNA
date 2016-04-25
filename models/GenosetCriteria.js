var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Asset			= require('../lib/Assert');
var GenosetCriteriaParser = require('./GenosetCriteriaParser');

var GenosetCriteria = new DataCollection('genoset'); 

var cachedTests = {};

GenosetCriteria.Entity.test = function(dnaProfileId) {
	if (!cachedTests[this._id]) {cachedTests[this._id] = {};}
	
	console.log('evaluating', this.name, 'for', dnaProfileId);
	if (!cachedTests[this._id].hasOwnProperty(dnaProfileId)) {
		var criteria = this.criteria.replace(/#.+/g, '').replace(/\s/g, '').replace(/;/g, ',');
		var result = GenosetCriteriaParser(criteria, dnaProfileId);
		cachedTests[this._id][dnaProfileId] = result;
		console.log('\tResult:', result);
	}
	return cachedTests[this._id][dnaProfileId];
};

module.exports = GenosetCriteria;