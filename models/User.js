var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new Schema({ 
	email: String,
	password: String
});

/**
 * Hashes the given password.
 */ 
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Return {@code true} if the given password matches the user's password.
 */
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.local.password);
};


module.exports = mongoose.model('User', userSchema);