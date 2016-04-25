var Assert			= require('../lib/Assert');
var GenosetCriteria	= require('./GenosetCriteria');
var DnaProfileSnp	= require('./DnaProfileSnp');

var snpCriteria = function(args, rsid, dnaProfileId) {
	var isMatch = true;
	var alleles = DnaProfileSnp.getByNk(dnaProfileId, rsid).call('getAlleles');
	return alleles.each(function(allele) {
		var index = alleles.indexOf(searchAllele);
		 // If one or more alleles are undefined, cannot answer definitively so return null.
		if (index === -1) {isMatch = alleles.includes('0') ? null : false;}
	}).return(isMatch);
};

var classTypes = {
		'rs': snpCriteria,
		'I': snpCriteria,
		'i': snpCriteria,
		'gs': function(args, genosetName, dnaProfileId) {
			return GenosetCriteria.getById(genosetName).call(test, dnaProfileId);
		},
		'not': args => args.every(x => x === false), // x may be null, indicating no data; don't include this.
		'and': args => args.every(x => x),
		'or': args => args.find(x => x)
};

function parse(input, dnaProfileId) {
	var argStart = input.indexOf('(');
	if (argStart == -1) {
		return input;
	} else {
		var criteria = input.substring(0, argStart);
		var prefix = Object.keys(classTypes).find(x => criteria.startsWith(x));
		if (!prefix) {throw new Error('Unknown criteria type: "' + criteria + '".');}

		var args = splitArgs(input, argStart + 1, input.length - 1);
		var parsedArgs = args.map(x => parse(x, dnaProfileId));
		return classTypes[prefix](parsedArgs, criteria, dnaProfileId);
	}
}

function splitArgs(input, argStart, argEnd) {
	var argStack = [];
	var parenStack = 0;
	for (var i = argStart; i <= argEnd; i++) {
		var chr = input[i];
		if (i === argEnd || chr === ',' && !parenStack) {
			var arg = input.substring(argStart, i);
			if (arg) {argStack.push(arg);}
			argStart = i + 1;
		} else if (chr === '(') {
			parenStack++;
		} else if (chr === ')') {
			parenStack--;
		}
	}
	return argStack;
}


module.exports = parse;