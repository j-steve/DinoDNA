exports.parseAll = function(text, start, end) {
	var results = [];
	var i = text.indexOf(start);
	while (i > -1) {
		i += start.length;
		var endI = text.indexOf(end, i);
		if (endI > -1) {
			results.push(text.substring(i, endI));
			i = endI + end.length;
		} else {break;}
	}
	return results;
};

exports.parseOne = function(text, start, end) {
	return exports.parseAll(text, start, end)[0];
};

exports.truncate = function(text, maxLength) {
	if (text.length > maxLength) {
		text = text.substr(0, maxLength - 3) + '...';
	}
	return text;
};

exports.pad = function(text, length, truncate) {
	if (text.length > length) {
		if (truncate) {text = exports.truncate(text, length);}
	} else {
		while (text.length < length) {text+= ' ';}
	}
	return text;
};

var FORMAT_ARGS = /\{(\d+)\}/g;

/**
 * Replaces values like "{0}", "{1}", etc., in the given text
 * with the argument of that index in the given argument list,
 * or simply removes the placeholder if the index is invalid.
 * 
 * @param {String} text
 * @param {Array<String>} ...args
 * @returns {String}
 */
exports.format = function(text, args) {
	if (arguments.length === 1) {return text;}
	if (!Array.isArray(args)) {args = [].slice.call(arguments, 1);}
	return text.replace(FORMAT_ARGS, function(match, g1) {
		if (args.length <= g1) {return '';}
		var val = args[g1];
		if (val === null) {
			return 'null';
		} else if (val === undefined) {
			return 'undefined';
		} else if (Array.isArray(val)) {
			val = '[' + val.join(',') + ']';
		}
		return val;
	});
};

/**
 * Returns {@code true} if all arguments are loosely ("==") equal,
 * performing a case-insensitive comparison for string values.
 * 
 * @returns {Boolean}
 */
exports.areEqual = function(args) {
	args = [].slice.call(arguments).map(x => typeof x === 'string' ? x.toUpperCase() : x);
	arg1 = args.pop();
	return args.every(x => x == arg1);
	
}

/**
 * Returns {@code true} if not all arguments are loosely ("==") equal,
 * performing a case-insensitive comparison for string values.
 * 
 * @returns {Boolean}
 */
exports.notEqual = function(arg1, arg2) {
	return !exports.areEqual.apply(null, arguments);
}

exports.htmlEncode = function(text) {
	text = text.replace(/</g, '&lt;');
	text = text.replace(/>/g, '&gt;');
	text = text.replace(/&/g, '&amp;');
	text = text.replace(/"/g, '&quot;');
	text = text.replace(/\u2013/g, '&ndash;');
	text = text.replace(/\u2014/g, '&mdash;');
	return text;
};