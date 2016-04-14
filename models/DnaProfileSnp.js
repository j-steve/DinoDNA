var Promise	= require('bluebird');
var db		= require('../lib/db');

function DnaProfileSnp(row) {
	var self = this;

	this.id = row.id;
	this.dna_profile_id = row.dna_profile_id;
	this.rsid = row.rsid;
	this.allele1 = row.allele1;
	this.allele2 = row.allele2;
	this.created_at = row.created_at;
	this.updated_at = row.updated_at;

	var keys = Object.keys(this);

	this.save = function() {
		return self.id ? self.update() : self.insert();
	};

	this.insert = function() {
		if (self.id) {return Promise.reject('Cannot insert: ID already exists, value="' + self.id + '".');}
		var sql = 'INSERT INTO ?? SET ?';
		return db.executeSql(sql, 'dna_profile_snp', self).then(function(result) {
			self.id = result.insertId;
			return self;
		});
	};

	this.update = function() {
		if (!self.id) {return Promise.reject('Cannot update: ID is null.');}
		var sql = 'UPDATE ?? SET ? WHERE ?';
		return db.executeSql(sql, 'dna_profile_snp', self, {id: self.id}).then(result => self);
	};
}

DnaProfileSnp.getById = function(id) {
	return DnaProfile.getOne({id: id});
};

DnaProfileSnp.getOne = function(where) {
	return DnaProfile.getMany(where).then(function(results) {
		if (results.length > 1) {throw new Error('More than 1 record returned.');}
		return results.length === 0 ? null : results[0];
	});
};

DnaProfileSnp.getMany = function(where) {
	return db.executeSql('SELECT * FROM ?? WHERE ?', 'dna_profile_snp', where).then(function(rows) {
		return rows && rows.map(row => new DnaProfileSnp(row));
	});
};

DnaProfileSnp.count = function(where) {
	return db.executeSql('SELECT COUNT(*) FROM ?? WHERE ?', 'dna_profile_snp', where).then(x => x[0]['COUNT(*)']);
};

DnaProfileSnp.insert = function(values) {
	if (!values || !values.length) {return Promise.resolve(null);}
	var columns = Object.keys(values[0]);
	return db.executeSql('INSERT INTO ?? (??) VALUES ?', 'dna_profile_snp', columns, values);
};

module.exports = DnaProfileSnp;