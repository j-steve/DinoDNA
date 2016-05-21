var app = require('express')();
var File = require('si-file');

var ERROR_LINE = /at (?:([^(\/\\]+) \()?(.+):(\d+):(\d+)(?:\))?/g;

module.exports = function(err, req, res, next) {
	console.log('why');
	
	var codeSnippets = [];
	if (err && err.stack) {
		var match;
		while ((match = ERROR_LINE.exec(err.stack))) {
			var file = new File(match[2]);
			var snippet = {
				functionName: match[1],
				filePath: file.path,
				fileName: file.name,
				lineNo: match[3] - 1,
				isLib: isExternalCode(file),
				lines: file.existsSync() ? file.readLinesSync() : []
			};
			codeSnippets.push(snippet);
		}
	}
	console.log(err);
	res.status(err && err.status || 500);
	res.render('error', {
		message : err ? err.message || err.toString() : '',
		error : app.get('env') === 'development' ? err : null,
		codeSnippets: codeSnippets
	});
};

/**
 * Returns {@code true} if the given file is external (third-party) code,
 * which may be displayed differently than internal app code (e.g. collapsed by default).
 * 
 * @param {File} file
 * @returns {Boolean}
 */
function isExternalCode(file) {
	return file.path.indexOf('node_modules') > -1;
}