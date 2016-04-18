var router	= require('express').Router();
var Promise	= require('bluebird');
var db 		= require('../../lib/db');
var DnaProfile = require('../../models/DnaProfile');

var ALL_ALLELE_SQL = 'SELECT COUNT(*) AS `count` FROM dna_profile_snp a JOIN dna_profile_snp b ON a.rsid = b.rsid ' + 
	'WHERE a.dna_profile_id = ? AND b.dna_profile_id = ?';
var SAME_ALLELE_SQL = ALL_ALLELE_SQL + ' AND (a.allele1 = b.allele1 AND a.allele2 = b.allele2 OR a.allele1 = b.allele1 AND a.allele2 = b.allele1)';
var UNK_ALLELE_SQL = ALL_ALLELE_SQL + ' AND (a.allele1 = \'0\' OR a.allele2 = \'0\' OR b.allele1 = \'0\' OR b.allele2 = \'0\')'; 

//Populate the DNA Profile value on all requests.
router.get('/', function(req, res, next) {
	DnaProfile.getById(req.query.profile).then(function(dnaProfile) {
		res.locals.dnaProfile = dnaProfile;
		next();
	}).catch(next);
});

router.get('/', function(req, res, next) {
	var dna1 = res.locals.dnaProfile.id;
	var dna2 = req.query.compareTo;
	Promise.props({
		all: db.executeSql(ALL_ALLELE_SQL, dna1, dna2),
		same: db.executeSql(SAME_ALLELE_SQL, dna1, dna2),
		unk: db.executeSql(UNK_ALLELE_SQL, dna1, dna2)
	}).then(function(result) {
		var reportData = ['same', 'unk', 'all'].map(x => ({'': x, count: result[x][0].count.toLocaleString(), percent: ((result[x][0].count / result.all[0].count) * 100).toFixed(1) + '%'}));
		console.log(reportData);
		res.locals.reportTable = tablify(reportData);
		res.render('report', {reportName: 'Comparison Report'});
	}).catch(next);
});



function tablify(data) {
	var result = '<table>';
	if (data && data.length) {
		var columns = Object.keys(data[0]);
		var headers = columns.map(c => '<th>' + c + '</th>');
		result += '<tr>' + headers.join('') + '</tr>';
		data.forEach(function(row) {
			var cells = columns.map(c => '<td>' + row[c] + '</td>');
			result += '<tr>' + cells.join('') + '</tr>';
			
		});
	} else {
		result += '<tr><td>(no data)</td></tr>';
	}
	return result + '</table>';
}

module.exports = router;