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