var router	= require('express').Router();
var request = require('request');
var Promise	= require('bluebird');
var db 		= require('../../lib/db');
var web 		= require('../../lib/web');

//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?action=askargs&conditions=Category:Is%20a%20genotype&printouts=magnitude|'
//var SNPEDIA_URL = http://bots.snpedia.com/api.php?format=json&action=ask&query=[[Category:Is%20a%20genotype]]|?magnitude|?Summary|sort=magnitude|order=desc|limit=100|offset=';
var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=query&list=categorymembers&cmtitle=Category:{{CATEGORY}}&continue&cmlimit=500&cmcontinue=';

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('admin');
});

/* POST home page. */
router.post('/load-snpedia', function(req, res, next) {
	var url = SNPEDIA_URL.replace(/\{\{CATEGORY\}\}/g, req.body.category);
	var extractor = x => ({rsid: x.title, snpedia: true});
	sendRequest('snp', extractor, url, req.body.startFrom).then(resp => res.send(resp)).catch(err => res.status(500).send(err));
});


/* POST home page. */
router.post('/load-genosets', function(req, res, next) {
	var url = SNPEDIA_URL.replace(/\{\{CATEGORY\}\}/g, 'Is_a_genoset');
	var extractor = x => ({name: x.title, snpedia: true});
	sendRequest('genoset', extractor, url, req.body.startFrom).then(resp => res.send(resp)).catch(function(err) {
		console.error(err);
		console.trace(err);
		res.status(500).send(err);
	});
});

/* POST home page. */
router.post('/load-genotypes', function(req, res, next) {
	var url = SNPEDIA_URL.replace(/\{\{CATEGORY\}\}/g, 'Is_a_genotype');
	var extractor = x => ({name: x.title, snpedia: true});
	sendRequest('genoset', extractor, url, req.body.startFrom).then(resp => res.send(resp)).catch(function(err) {
		console.error(err);
		console.trace(err);
		res.status(500).send(err);
	});
});



function sendRequest(tableName, extractor, url, startFrom, loopCount, changeCount) {
	if (!startFrom) {startFrom = '';}
	if (!loopCount) {loopCount = 0;}
	if (!changeCount) {changeCount = 0;}

	return web.getJsonResponse(url + (startFrom || '')).then(function(json) {
		var values = json.query.categorymembers.map(extractor);
		return insert(tableName, values).then(function(dbResp) {
			console.log('\tInserted', dbResp.affectedRows, 'rows.');
			changeCount += dbResp.affectedRows;
			var continueFrom = json.continue ? json.continue.cmcontinue : null;
			if (json.batchcomplete || !continueFrom) {
				return 'ALL DONE!! Inserted: ' + changeCount;
			}
			if (loopCount++ >= req.body.maxPageCount) {
				return {'changeCount':changeCount, 'continueFrom':continueFrom, 'dbResp':dbResp};
			} else {
				return sendRequest(url, continueFrom, loopCount, changeCount);
			}
		});
	});
}

function insert(tableName, values) {
	values = [].concat(values); // convert values param to array if necessary.
	if (!values.length) {return Promise.reject('Cannot insert an empty list.');}

	// Get columns, then convert objects to list for bulk insert.
	var columns = Object.keys(values[0]);
	values = values.map(x => columns.map(c => x[c])); // convert values members from objects to arrays.

	// Create and execute SQL statement.
	return db.executeSql('INSERT IGNORE INTO ?? (??) VALUES ?', tableName, columns, values);
}

module.exports = router;