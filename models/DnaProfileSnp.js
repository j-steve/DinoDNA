var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
var Logger			= require('../lib/Logger');
var SNP				= require('./SNP');

var DnaProfileSnp = new DataCollection('dna_profile_snp');

DnaProfileSnp.getByNk = function(dnaProfileId, rsid) {
	return DnaProfileSnp.getOne({dna_profile_id: dnaProfileId, rsid: rsid});
};

/**
 * @returns {SNP}
 */
DnaProfileSnp.Entity.getSnp = function() {
	return SNP.getById(this.rsid);
};

DnaProfileSnp.Entity.getAlleles = function() {
	var self = this;
	return this.getSnp().then(function(snp) {
		var alleles = [self.allele1, self.allele2];
		if (snp.is_reversed) {
			alleles = alleles.map(function(allele) {
				switch (allele) {
					case 'A': return 'T';
					case 'T': return 'A';
					case 'C': return 'G';
					case 'G': return 'C';
				}
			});
		} else if (snp.is_reversed === null) {
			Logger.warn('Missing isReversed data for "{0}".', self.rsid);
		}
		return alleles;
	});
};

module.exports = DnaProfileSnp;