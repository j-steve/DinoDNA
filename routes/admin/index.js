var router	= require('express').Router();
var mysql	= require('mysql');
var request = require('request');
var Promise	= require('bluebird');

var db = mysql.createPool({
  host     : 'localhost',
  user     : 'DinoDNA',
  password : 'dinodnaPass',
  database : 'DinoDNA_web'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	var sql = 'SELECT ?? FROM ?? WHERE ? ORDER BY ?? LIMIT 1';
	var sqlArgs = ['message', 'log', {action: 'SNPedia continueFrom'}, 'timestamp'];
	executeSql(sql, sqlArgs).then(function(results) {
		res.render('admin', {continueFrom: results.length ? results[0].message : ''});
	}).catch(next);
});

/* POST home page. */
//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?action=askargs&conditions=Category:Is%20a%20genotype&printouts=magnitude|'
//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=ask&query=[[Category:Is%20a%20genotype]]|?magnitude|?Summary|sort=magnitude|order=desc|limit=100|offset=';
var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=query&list=categorymembers&cmtitle=Category:In_dbSNP&continue&cmlimit=500&cmcontinue=';

router.post('/load-snpedia', function(req, res, next) {
	sendRequest(req.body.startFrom || '');
	
	var loopCount = 0;
	function sendRequest(startFrom) {
		console.log('starting from:', startFrom)
		request(SNPEDIA_URL + startFrom, function(err, response, body) {
			// Handle errors.
			if (err) {return sendErrorResp(err);}
			var json = JSON.parse(body);
			if (json.error) {return sendErrorResp(json.error.info);}
			
			// Add SNPs to database.
			var snps = json.query.categorymembers.map(x => ({rsid: x.title, snpedia: true}));
			insert('snp', snps);
			
			// Contine to next page, or send HTTP response if finished or max page count limit reached.
			if (json.batchcomplete || loopCount++ >= req.body.maxPageCount) {
				res.send(json);
			} else {
				// Grab "continueFrom", log to DB, and execute next request.
				var continueFrom = json['continue'].cmcontinue;
				insert('log', {domain: 'data', action: 'SNPedia continueFrom', message: continueFrom});
				sendRequest(continueFrom);
			}
		});
	}
	
	function sendErrorResp(err) {
		res.status(500).send('ERROR: ' + err);
	}
	
});

function insert(tableName, values) {
	values = [].concat(values); // convert values param to array if necessary.
	if (!values.length) {reject('Cannot insert an empty list.');}
	
	// Get columns, then convert objects to list for bulk insert.
	var columns = Object.keys(values[0]);
	values = values.map(x => columns.map(c => x[c])); // convert values members from objects to arrays.
	
	// Create and execute SQL statement.
	return executeSql('INSERT INTO ?? (??) VALUES ?', [tableName, columns, values]);
}

function executeSql(sql, values) {
	return new Promise(function(resolve, reject) {
		// Create SQL statement.
		sql = mysql.format(sql, values);
		// Execute SQL.
		console.log('Executing SQL:\n\t' + sql);
		db.query(sql, function(err, resp) {
			if (err) {reject(err);} else {resolve(resp);}
		});
	});
}

module.exports = router;
