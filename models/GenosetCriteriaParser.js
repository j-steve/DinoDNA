var Assert			= require('../lib/Assert');
var Logger			= require('../lib/Logger');
var text			= require('../lib/text');
var GenosetCriteria	= require('./GenosetCriteria');
var DnaProfileSnp	= require('./DnaProfileSnp');

var snpCriteria = function(searchAlleles, rsid, dnaProfileId) {
	searchAlleles = searchAlleles.map(x => x === '-' ? '0' : x); // replace "-" with "0".
	if (!searchAlleles.every(x => ['A', 'T', 'C', 'G', '0'].indexOf(x) !== -1)) {
		Logger.warn('SNP genoset criteria for {0} contains invalid alleles: {1}', rsid, searchAlleles);
	}
	var containsUnknowns = false;
	return DnaProfileSnp.getByNk(dnaProfileId, rsid).then(function(dnaProfSnp) {
		if (dnaProfSnp === null) {return null;}
		[dnaProfSnp.allele1, dnaProfSnp.allele2].forEach(function(allele) {
			var index = searchAlleles.indexOf(allele);
			if (index !== -1) {
				searchAlleles.splice(index, 1);
			} else if (allele === '0') {
				containsUnknowns = null; // return NULL vs FALSE to indicate that the value is unknown, not explicitly untrue.
			}
		});
		return !searchAlleles.length || containsUnknowns;
	});
};

var classTypes = {
		'rs': snpCriteria,
		'i': snpCriteria,
		'gs': function(args, genosetName, dnaProfileId) {
			return GenosetCriteria.getById(genosetName).call(test, dnaProfileId);
		},
		'not': args => Promise.all(args).then(a => a.every(x => x === false)), // x may be null, indicating no data; don't include this.
		'and': args => Promise.all(args).then(a => a.every(x => x)),
		'or': args => Promise.all(args).then(a => a.some(x => x)),
		'atleast': function(args) {
			var minCount = args.shift();
			return Promise.all(args).then(a => a.filter(x => x).length >= minCount);
		}
};

function parse(input, dnaProfileId) {
	var argStart = input.indexOf('(');
	if (argStart == -1) {
		return input;
	} else {
		var criteria = input.substring(0, argStart);
		var prefix = Object.keys(classTypes).find(x => criteria.toLowerCase().startsWith(x));
		if (!prefix) {throw new Error(text.format('Unknown criteria type: "{0}" within input: "{1}".', criteria, input));}

		var args = splitArgs(input, argStart + 1, input.length - 1);
		var parsedArgs = args.map(x => parse(x, dnaProfileId));
		var result = classTypes[prefix](parsedArgs, criteria, dnaProfileId);
		result.then(isMatch => Logger.log('Checking genoset {0} for profile {1}: result it "{2}"', input, dnaProfileId, isMatch));
		return result;
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