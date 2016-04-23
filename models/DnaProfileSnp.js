var Promise	= require('bluebird');
var db		= require('../lib/db');
var DataCollection	= require('./DataCollection');

var DnaProfileSnp = new DataCollection('dna_profile_snp');

module.exports = DnaProfileSnp;