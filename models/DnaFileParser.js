/** 
 * @class
 * @returns {DnaFileParser}
 */
function DnaFileParser() {
	var self = this;
	
	this.isValidFile = true;
	
	var awaitingHeader = false;
	var combinedAlleles = false;
	this.isAlwaysFwdStrand = false;
	
	var isFirstLine = true;
	this.parseLine = function(line) {
		if (isFirstLine) {
			parseFormatType(line);
			isFirstLine = false;
		} else if (line[0] === '#') {
			// skip comment lines
		} else if (awaitingHeader) {
			awaitingHeader = false;
		} else if (self.isValidFile) {
			var columns = line.split('\t');
			if (combinedAlleles) { // Convert "AG" to "A" and "G".
				var alleles = columns.splice(-1, 1);
				columns.push(alleles[0]);
				columns.push(alleles[1]);
			}
			return columns;
		}
	};
	
	function parseFormatType(firstLine) {
		if (firstLine.contains('AncestryDNA')) {
			awaitingHeader = true;
			self.isAlwaysFwdStrand = true;
		} else if (firstLine.contains('23andMe')) { 
			combinedAlleles = true;
		} else {
			self.isValidFile = false;
		}
	}
}


module.exports = DnaFileParser;