var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var UserSchema = new Schema({ 
	email: String,
	password: String
});

/**
 * Sets the password by hashing the given password value.
 * @param {String} password
 * @returns {User}
 */ 
UserSchema.methods.setPassword = function(password) {
	this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	return this;
}; 

/**
 * Return {@code true} if the given password matches the user's password.
 * @returns {Boolean}
 */
UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);

/*var User = mongoose.model('User', UserSchema);

User.getById = function(userid) {
	return new Promise(function (resolve, reject) {
		if (userid) {  
			User.findById(userid, function(err, user) {
				if (err) {reject(err);} else {resolve(user);}
			});
		} else {
			resolve(false);
		}
	});
};

module.exports = User;*/


