var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Asset			= require('../lib/Assert');
var Logger			= require('../lib/Logger');
var db				= require('../lib/db');
var GenotypeCategory = require('./GenotypeCategory');


var GenosetCriteriaParser = require('./GenosetCriteriaParser');

var GenosetCriteria = new DataCollection('dinodna_data', 'genoset'); 

GenosetCriteria.getSignifigant = function() {
	//return this.getMany('magnitude <> 0');
	return this.getMany('coefficient IS NULL OR coefficient <> 1');
};


//var cachedTests = {};

GenosetCriteria.Entity.test = function(dnaProfileId) {
	//if (!cachedTests[this._id]) {cachedTests[this._id] = {};}
	
	//if (!cachedTests[this._id].hasOwnProperty(dnaProfileId)) {
		var criteria = this.criteria.replace(/#.+/g, '').replace(/\s/g, '').replace(/;/g, ',');
		var result = GenosetCriteriaParser(criteria, dnaProfileId);
		return result;
		//cachedTests[this._id][dnaProfileId] = result;
	//}
	//return cachedTests[this._id][dnaProfileId];
};

GenosetCriteria.Entity.getCategory = function() {
	return GenotypeCategory.getById(this.category_id);
};

GenosetCriteria.Entity.populateCategory = function() {
	var self = this;
	return this.getCategory().then(function(category) {
		self.category = category;
		return self;
	});
};

module.exports = GenosetCriteria;