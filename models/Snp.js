var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var SnpSchema = new Schema({
	rsid: {type: String, required: true, index: true},
	chromosome: String,
	position: Number
});

SnpSchema.index({chromosome: 1, position: 1}, {unique: true});

module.exports = mongoose.model('Snp', SnpSchema);