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

exports.htmlEncode = function(text) {
	text = text.replace(/</g, '&lt;');
	text = text.replace(/>/g, '&gt;');
	text = text.replace(/&/g, '&amp;');
	text = text.replace(/"/g, '&quot;');
	text = text.replace(/\u2013/g, '&ndash;');
	text = text.replace(/\u2014/g, '&mdash;');
	return text;
};