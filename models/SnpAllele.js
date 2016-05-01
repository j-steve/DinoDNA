var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Asset			= require('../lib/Assert');
var SNP				= require ('./SNP'); 

var SnpAllele = new DataCollection('snp_allele');

SnpAllele.Entity.test = function(dnaProfileId) {
	
};

module.exports = SnpAllele;