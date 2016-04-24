var Assert = require('../Assert');

var classTypes = {};

exports.addCriteriaType = function(CriteriaClass, prefix) {
	Assert.validType(CriteriaClass, 'function', 'CriteriaClass');
	Assert.validType(prefix, 'string', 'prefix');
	classTypes[prefix] = CriteriaClass;
};

exports.parse = function(input) {
	input = input.replace(/#.+/g, '').replace(/\s/g, '').replace(/;/g, ',');
	return parseFormatted(input);
};

function parseFormatted(input) {
	var argStart = input.indexOf('(');
	if (argStart == -1) {
		return input;
	} else {
		var criteria = input.substring(0, argStart);
		var args = splitArgs(input, argStart + 1, input.length - 1).map(parseFormatted);
		var prefix = Object.keys(BaseCriteria.classTypes).find(x => criteria.startsWith(x));
		if (!prefix) {throw new Error('Unknown criteria type: "' + criteria + '".');}
		return new BaseCriteria[prefix](args);
	}
}

function splitArgs(input, argStart, argEnd) {
	var argStack = [];
	var parenStack = 0;
	for (var i = argStart; i <= argEnd; i++) {
		var chr = input[i];
		if (i === argEnd || chr === ',' && !parenStack) {
			var arg = input.substring(argStart, i);
			argStack.push(arg);
			argStart = i + 1;
		} else if (chr === '(') {
			parenStack++;
		} else if (chr === ')') {
			parenStack--;
		}
	}
	return argStack;
}