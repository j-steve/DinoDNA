var Promise			= require('bluebird');
var db				= require('../lib/db');
var DnaProfileSnp	= require('./DnaProfileSnp');
var DataCollection	= require('./DataCollection');

var DnaProfile = new DataCollection('dna_profile');

DnaProfile.Entity.snpCount = function() {
	return DnaProfileSnp.count({dna_profile_id: this.id});
};

module.exports = DnaProfile;