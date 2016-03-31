var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var DnaProfileSnpSchema = new Schema({
	dnaProfileID: {type: Schema.ObjectId, required: true, index: true},
	rsid: {type: String, required: true},
	chromosome: String,
	position: Number,
	allele1: String,
	allele2: String 
});

DnaProfileSnpSchema.index({dnaProfileID: 1, rsid: 1}, {unique: true});

module.exports = mongoose.model('DnaProfileSnp', DnaProfileSnpSchema);