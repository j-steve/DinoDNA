var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Logger			= require('../lib/Logger');

var GenotypeCategory = new DataCollection('dinodna_data', 'genotype_category');

module.exports = GenotypeCategory;