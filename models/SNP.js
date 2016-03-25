var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	userID: String,
	rsid: String,
	chromosome: String,
	position: Number,
	allele1: String,
	allele2: String 
});

module.exports = mongoose.model('SNP', schema);