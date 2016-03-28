var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DnaProfileSchema = new Schema(
	{
		userID: {type: Schema.ObjectId, required: true, index: true},
		name: {type: String, required: true}
	},
	{
		timestamps: true
	}
);

DnaProfileSchema.index({userID: 1, name: 1}, {unique: true});

module.exports = mongoose.model('DnaProfile', DnaProfileSchema);