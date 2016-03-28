var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var SnpSchema = new Schema({
	dnaProfileID: {type: Schema.ObjectId, required: true, index: true},
	rsid: {type: String, required: true},
	chromosome: String,
	position: Number,
	allele1: String,
	allele2: String 
});

SnpSchema.index({dnaProfileID: 1, rsid: 1}, {unique: true});

module.exports = mongoose.model('SNP', SnpSchema);