var bcrypt	= require('bcrypt-nodejs');
var Promise	= require('bluebird');
var db		= require('../lib/db');
var DnaProfile = require('./DnaProfile');

function User(row) {
	var self = this;

	this.id = row.id;
	this.email = row.email;
	this.password = row.password;
	this.created_at = row.created_at;
	this.updated_at = row.updated_at;

	/**
	 * Sets the password by hashing the given password value.
	 * @param {String} password
	 * @returns {User}
	 */
	this.setPassword = function(password) {
		self.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
		return self;
	};

	/**
	 * Return {@code true} if the given password matches the user's password.
	 * @returns {Boolean}
	 */
	this.validatePassword = function(password) {
		return bcrypt.compareSync(password, self.password);
	};

	this.getDnaProfile = function(name) {
		return DnaProfile.getOne({user_id: self.id, name: name});
	};

	this.getDnaProfiles = function(name) {
		return DnaProfile.getMany({user_id: self.id});
	};

	this.save = function() {
		return self.id ? self.update() : self.insert();
	};

	this.insert = function() {
		if (self.id) {return Promise.reject('Cannot insert: ID already exists, value="' + self.id + '".');}
		var sql = 'INSERT INTO ?? SET ?';
		return db.executeSql(sql, 'user', self).then(function(result) {
			self.id = result.insertId;
			return self;
		});
	};

	this.update = function() {
		if (!self.id) {return Promise.reject('Cannot update: ID is null.');}
		var sql = 'UPDATE ?? SET ? WHERE ?';
		return db.executeSql(sql, 'user', self, {id: self.id}).then(function(result) {
			return self;
		});
	};
}

User.getById = function(id) {
	return User.getOne({id: id});
};

User.getOne = function(where) {
	return User.getMany(where).then(function(results) {
		if (results.length > 1) {throw new Error('More than 1 record returned.');}
		return results.length === 0 ? null : results[0];
	});
};

User.getMany = function(where) {
	return db.executeSql('SELECT * FROM ?? WHERE ?', 'user', where).then(function(rows) {
		return rows && rows.map(row => new User(row));
	});
};

module.exports = User;

