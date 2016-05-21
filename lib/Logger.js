var File	= require('si-file');
var text	= require('./text');

const TIMEZONE = 'en-US';
const DATE_OPTS = {month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'};

/**
 * @class
 */
function Logger(filename, logLevel) {
	var self = this;
	
	var file = new File(filename);
	logLevel = logLevel || Logger.Severity.INFO;
	
	this.log = function(severity, message, args) {
		if (severityLevels.includes(severity)) {
			args = [].slice.call(arguments, 2);
		} else {
			args = [].slice.call(arguments, 1);
			message = severity;
			severity = Logger.Severity.INFO;
		}
		logit(severity, message, args);
	};
	
	this.debug = function(message, args) {
		logit(Logger.Severity.DEBUG, message, [].slice.call(arguments, 1));
	};
	
	this.info = function(message, args) {
		logit(Logger.Severity.INFO, message, [].slice.call(arguments, 1));
	};
	
	this.warn = function(message, args) {
		logit(Logger.Severity.WARN, message, [].slice.call(arguments, 1));
	};
	
	this.error = function(message, args) {
		logit(Logger.Severity.ERROR, message, [].slice.call(arguments, 1));
	};
	
	function logit(level, message, args) {
		message = text.format(message, args);
		if (level >= logLevel) {
			var consoleStream = (level >= Logger.Severity.WARN) ? 'error' : 'log';
			var firstLine = message.split(/(\r?\n)/g, 1)[0];
			console[consoleStream](text.truncate(firstLine, 250));
			
			message = message.replace(/(\r?\n)/g, '$1                              '); // indent multiline comments
			var logPrefix = new Date().toLocaleString(TIMEZONE, DATE_OPTS) + '  ';
			var flag = '';
			if (level === Logger.Severity.ERROR) {flag = '[ERROR]';}
			else if (level === Logger.Severity.WARN) {flag = ' [WARN]';}
			file.appendLine(logPrefix + text.pad(flag, 9, true) + message);
		}
		
	}
	
	this.clearLog = function() {
		file.delete();
	};
}

Logger.Severity = {
	TRACE:	1,
	DEBUG:	2,
	INFO:	3,
	WARN:	4,
	ERROR:	5
};
var severityLevels = Object.keys(Logger.Severity).map(k => Logger.Severity[k]);

module.exports = new Logger('../log/DinoDNA.log');