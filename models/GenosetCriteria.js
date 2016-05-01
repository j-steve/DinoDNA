var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Asset			= require('../lib/Assert');
var Logger			= require('../lib/Logger');
var db				= require('../lib/db');


var GenosetCriteriaParser = require('./GenosetCriteriaParser');

var GenosetCriteria = new DataCollection('genoset'); 

GenosetCriteria.getAll = function() {
	const SQL = "SELECT * FROM genoset UNION " +
			"SELECT -1, CONCAT(rsid, '(', allele1, ';', allele2, ')'), CONCAT(rsid, '(', allele1, ';', allele2, ')'), magnitude, NULL, message, created_at, updated_at " +
			"FROM snp_allele WHERE rsid NOT LIKE 'I%'";
	return db.executeSql(SQL).then(this._asEntity);
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

module.exports = GenosetCriteria;