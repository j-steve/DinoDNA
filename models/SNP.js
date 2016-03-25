var mongoose = require('mongoose'); 

var schema = mongoose.Schema({ 
	rsid: String,
	chromosome: String,
	position: Number,
	allele1: String,
	allele2: String 
});

module.exports = mongoose.model('SNP', schema);