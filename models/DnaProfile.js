var Promise			= require('bluebird');
var db				= require('../lib/db');
var DnaProfileSnp	= require('./DnaProfileSnp');

function DnaProfile(row) {
	var self = this;

	this.id = row.id;
	this.user_id = row.user_id;
	this.name = row.name;
	this.created_at = row.created_at;
	this.updated_at = row.updated_at;

	var keys = Object.keys(this);

	/**
	 * Sets the password by hashing the given password value.
	 * @param {String} password
	 * @returns {User}
	 */
	this.setPassword = function(password) {
		this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
		return this;
	};

	/**
	 * Return {@code true} if the given password matches the user's password.
	 * @returns {Boolean}
	 */
	this.validatePassword = function(password) {
		return bcrypt.compareSync(password, this.password);
	};

	this.save = function() {
		return self.id ? self.update() : self.insert();
	};

	this.insert = function() {
		if (self.id) {return Promise.reject('Cannot insert: ID already exists, value="' + self.id + '".');}
		var sql = 'INSERT INTO ?? SET ?';
		return db.executeSql(sql, 'dna_profile', self).then(function(result) {
			self.id = result.insertId;
			return self;
		});
	};

	this.update = function() {
		if (!self.id) {return Promise.reject('Cannot update: ID is null.');}
		var sql = 'UPDATE ?? SET ? WHERE ?';
		return db.executeSql(sql, 'dna_profile', self, {id: self.id}).then(function(result) {
			return self;
		});
	};

	this.snpCount = function() {
		return DnaProfileSnp.count({dna_profile_id: self.id});
	};
}

DnaProfile.getById = function(id) {
	return DnaProfile.getOne({id: id});
};

DnaProfile.getOne = function(where) {
	return DnaProfile.getMany(where).then(function(results) {
		if (results.length > 1) {throw new Error('More than 1 record returned.');}
		return results.length === 0 ? null : results[0];
	});
};

DnaProfile.getMany = function(where) {
	return db.executeSql('SELECT * FROM ?? WHERE ?', 'dna_profile', where).then(function(rows) {
		return rows && rows.map(row => new DnaProfile(row));
	});
};

module.exports = DnaProfile;