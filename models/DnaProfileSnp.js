var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Logger			= require('../lib/Logger');
var SNP				= require('./SNP');

var DnaProfileSnp = new DataCollection('dinodna_web', 'dna_profile_snp');

DnaProfileSnp.getByNk = function(dnaProfileId, rsid) {
	return DnaProfileSnp.getOne({dna_profile_id: dnaProfileId, rsid: rsid});
};

/**
 * @returns {SNP}
 */
DnaProfileSnp.Entity.getSnp = function() {
	return SNP.getById(this.rsid);
};

module.exports = DnaProfileSnp;