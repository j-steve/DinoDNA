var mongoose = require('mongoose');

var schema = mongoose.Schema({ 
	username: String
});

module.exports = mongoose.model('User', schema);