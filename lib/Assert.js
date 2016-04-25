
var text = require('./text');

/** @class */
function ParameterTypeError() {
	TypeError.call(this);
}
ParameterTypeError.prototype = TypeError.prototype;
ParameterTypeError.prototype.constructor = ParameterTypeError;

exports.validType = function(actualValue, expectedType, parameterName) {
	if (typeof value !== type) {
		var errMsg = 'Given value "{0}" does not match expected type "{1}"';
		if (parameterName) {errMsg += ' for parameter {2}';}
		throw new ParameterTypeError(text.format(errMsg, actualValue, expectedType, parameterName));
	}
};