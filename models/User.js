var bcrypt	= require('bcrypt-nodejs');
var Promise	= require('bluebird');
var db		= require('../lib/db');
var DnaProfile = require('./DnaProfile');
var DataCollection	= require('./DataCollection');

var User = new DataCollection('dinodna_web', 'user');

/**
 * Sets the password by hashing the given password value.
 * @param {String} password
 * @returns {User.Entity}
 */
User.Entity.setPassword = function(password) {
	this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	return this;
};

/**
 * Return {@code true} if the given password matches the user's password.
 * @returns {Boolean}
 */
User.Entity.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

User.Entity.getDnaProfile = function(name) {
	return DnaProfile.getOne({user_id: this.id, name: name});
};

User.Entity.getDnaProfiles = function(name) {
	return DnaProfile.getMany({user_id: this.id});
};

module.exports = User;

