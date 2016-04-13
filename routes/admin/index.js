var router	= require('express').Router();
var request = require('request');
var Promise	= require('bluebird');
var db 		= require('../../lib/db');

//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?action=askargs&conditions=Category:Is%20a%20genotype&printouts=magnitude|'
//var SNPEDIA_URL = http://bots.snpedia.com/api.php?format=json&action=ask&query=[[Category:Is%20a%20genotype]]|?magnitude|?Summary|sort=magnitude|order=desc|limit=100|offset=';
var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=query&list=categorymembers&cmtitle=Category:{{CATEGORY}}&continue&cmlimit=500&cmcontinue=';

/* GET home page. */
router.get('/', function(req, res, next) {
	var sql = 'SELECT ?? FROM ?? WHERE ? ORDER BY ?? DESC LIMIT 1';
	var sqlArgs = ['message', 'log', {action: 'SNPedia continueFrom'}, 'entry_id'];
	executeSql(sql, sqlArgs).then(function(results) {
		res.render('admin', {'continueFrom': results.length ? results[0].message : ''});
	}).catch(next);
});

/* POST home page. */
router.post('/load-snpedia', function(req, res, next) {
	sendRequest(req.body.startFrom || '');
	var loopCount = 0;
	var changeCount = 0;
	function sendRequest(startFrom) {
		var url = SNPEDIA_URL.replace(/\{\{CATEGORY\}\}/g, req.body.category) + (startFrom || '');
		console.log('Sending URL request to:', url);
		request(url + startFrom, function(err, response, body) {
			// Handle errors.
			if (err) {return sendErrorResp(err);}
			var json = JSON.parse(body);
			if (json.error) {return sendErrorResp(json.error.info);}
			// Add SNPs to database.
			var snps = json.query.categorymembers.map(x => ({rsid: x.title, snpedia: true}));
			insert('snp', snps).then(function(dbResp) {
				console.log('\tInserted', dbResp.affectedRows, 'rows.');
				changeCount += dbResp.affectedRows;
				var continueFrom = json.continue ? json.continue.cmcontinue : null;
				if (json.batchcomplete || !continueFrom) {
					insert('log', {domain: 'data', action: 'SNPedia continueFrom', message: 'DONE!!'});
					return res.send('ALL DONE!! Inserted: ' + changeCount);
				}
				insert('log', {domain: 'data', action: 'SNPedia continueFrom', message: continueFrom});
				if (loopCount++ >= req.body.maxPageCount) {
					res.send({'changeCount':changeCount, 'continueFrom':continueFrom, 'dbResp':dbResp});
				} else {
					sendRequest(continueFrom);
				}
			}).catch(sendErrorResp);
		});
	}

	function sendErrorResp(err) {
		res.status(500).send('ERROR: ' + err + ' [INSERTED: ' + changeCount + ']');
	}

});

function insert(tableName, values) {
	values = [].concat(values); // convert values param to array if necessary.
	if (!values.length) {return Promise.reject('Cannot insert an empty list.');}

	// Get columns, then convert objects to list for bulk insert.
	var columns = Object.keys(values[0]);
	values = values.map(x => columns.map(c => x[c])); // convert values members from objects to arrays.

	// Create and execute SQL statement.
	return db.executeSql('INSERT IGNORE INTO ?? (??) VALUES ?', [tableName, columns, values]);
}

module.exports = router;