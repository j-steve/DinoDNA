var Promise			= require('bluebird');
var DataCollection	= require('./DataCollection');
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
	return dnaProfileSnp.getSnp().prop('is_reversed').then(function(isReversed) {
		var alleles = [this.allele1, this.allele2];
		if (isReversed) {
			alleles = alleles.map(function(allele) {
				switch (allele) {
					case 'A': return 'T';
					case 'T': return 'A';
					case 'C': return 'G';
					case 'G': return 'C';
				}
			});
		}
		return alleles;
	});
};

module.exports = DnaProfileSnp;