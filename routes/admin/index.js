var router	= require('express').Router();
var request = require('request');
var Promise	= require('bluebird');
var db 		= require('../../lib/db');
var web 	= require('../../lib/web');
var text 	= require('../../lib/text');

//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?action=askargs&conditions=Category:Is%20a%20genotype&printouts=magnitude|'
//var SNPEDIA_URL = http://bots.snpedia.com/api.php?format=json&action=ask&query=[[Category:Is%20a%20genotype]]|?magnitude|?Summary|sort=magnitude|order=desc|limit=100|offset=';
var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=query&list=categorymembers&cmtitle=Category:{{CATEGORY}}&continue&cmlimit=500&cmcontinue=';
var GENOSET_URL = 'http://bots.snpedia.com/api.php?format=json&action=ask&query=[[Category:Is%20a%20genoset]]|?Magnitude|?Repute|?Summary|limit=100|offset=';
var SNP_URL = 'http://bots.snpedia.com/api.php?format=json&action=parse&prop=links&page=';
var SNP_EXTRACT_URL = 'http://bots.snpedia.com/api.php?format=json&action=parse&prop=text|categories&page=';


router.use('/snp-progress', require('./snp-progress'));


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('admin');
});

/* POST home page. */
router.post('/load-snpedia', function(req, res, next) {
	var url = SNPEDIA_URL.replace(/\{\{CATEGORY\}\}/g, req.body.category);
	var extractor = json => json.query.categorymembers.map(x => ({rsid: x.title, snpedia: true}));
	sendRequest('snp', extractor, url, req.body.startFrom).then(resp => res.send(resp)).catch(err => res.status(500).send(err));
});


/* POST home page. */
router.post('/load-genosets', function(req, res, next) {
	var extractor = function(json) {
		var results = json.query.results;
		return Object.keys(results).map(function(key) {
			console.log(results[key]);
			var p = results[key].printouts;
			return {name: results[key].fulltext, magnitude: p.Magnitude[0], repute: p.Repute[0], summary: p.Summary[0]};
		});
	};
	sendRequest('genoset', extractor, GENOSET_URL, req.body.startFrom).then(resp => res.send(resp)).catch(function(err) {
		console.error(err);
		console.trace(err);
		res.status(500).send(err);
	});
});

router.all('/populate-genosets', function(req, res, next) {
	var url = 'http://bots.snpedia.com/api.php?format=json&action=parse&prop=text&page=';
	db.executeSql('SELECT * FROM genoset WHERE criteria IS NULL').then(function(gsRows) {
		gsRows.forEach(function(gs) {
			web.getJsonResponse(url + gs.name + '/criteria').then(function(urlResp) {
				if (!urlResp.parse.text) {return;}
				console.log(urlResp);
				var criteria = text.parseOne(urlResp.parse.text['*'], '<pre>', '</pre>');
				db.executeSql('UPDATE genoset SET ? WHERE ?', {criteria: criteria}, {id: gs.id});
			});
		});
	});
	res.send('ok');
});

router.all('/extract-snps', function(req, res, next) {
	//var sql = 'SELECT * FROM snp LEFT OUTER JOIN snp_allele ON snp.rsid = snp_allele.snp_rsid WHERE snp_allele.snp_rsid IS NULL LIMIT 1';
	var startTime = Date.now();
	var sql = 'SELECT * FROM snp WHERE snpedia = 1 LIMIT ' + (req.query.limit || '50');
	Promise.each(db.executeSql(sql), function(snp) {
		return web.getJsonResponse(SNP_EXTRACT_URL + snp.rsid).then(function(urlResp) {
			if (!urlResp.parse || !urlResp.parse.text) {return console.error('Bad response for', snp.rsid, urlResp);}
			var cats = urlResp.parse.categories.map(x => x['*']).join('\n');
			var data = {snpedia: 3, snpedia_page: urlResp.parse.text['*'], snpedia_cats: cats};
			return db.executeSql('UPDATE snp SET ? WHERE rsid = ?', data, snp.rsid);
		}).catch(console.error);
	}).then(function(inserts) {
		var txt = 'ok! inserted: '+ inserts.length + ' record';
		var elapsedTime = (Date.now() - startTime) / 1000;
		txt += ' in ' + elapsedTime.toFixed(1) + ' seconds.';
		txt += ' (avg ' + (elapsedTime/inserts.length).toFixed(1) + ' sec./insert)';
		txt += '<br><br>' + inserts.map(x => x.rsid).join('<br>');
		txt += '<script>setTimeout(function() {location.reload();}, 2000);</script>';
		res.send(txt);
	}).catch(next);
});


router.all('/populate-snps', function(req, res, next) {
	//var sql = 'SELECT * FROM snp LEFT OUTER JOIN snp_allele ON snp.rsid = snp_allele.snp_rsid WHERE snp_allele.snp_rsid IS NULL LIMIT 1';
	var startTime = Date.now();
	var sql = 'SELECT * FROM snp WHERE snpedia = 1 ORDER BY RAND() LIMIT ' + (req.query.limit || '50');
	db.executeSql(sql).then(function(snpRows) {
		return Promise.each(snpRows, function(snp) {
			return web.getJsonResponse(SNP_URL + snp.rsid).then(function(urlResp) {
				if (!urlResp.parse || !urlResp.parse.links) {return console.error('Bad response for', snp.rsid, urlResp);}
				var snpPrefix = snp.rsid.toUpperCase() + '(';
				var seenAlleles = [];
				return Promise.each(urlResp.parse.links, function(link) {
					var name = link['*'] && link['*'].toUpperCase();
					if (name.startsWith(snpPrefix) && seenAlleles.indexOf(name) === -1) {
						seenAlleles.push(name);
						name = name.slice(snpPrefix.length, -1);
						var alleles = name.split(';').map(x => x.trim());
						var alleleData = {snp_rsid: snp.rsid, allele1: alleles[0], allele2: alleles[1]};
						return db.executeSql('INSERT INTO snp_allele SET ?', alleleData).catch({code:'ER_DUP_ENTRY'}, err =>console.warn(err.message));
					}
				}).then(x => db.executeSql('UPDATE snp SET snpedia = 2 WHERE rsid = ?', snp.rsid));
			});
		});
	}).then(function(inserts) {
		var txt = 'ok! inserted: '+ inserts.length;
		var elapsedTime = Date.now() - startTime;
		txt += ' in ' + elapsedTime/1000 + ' seconds.';
		txt += '<br><br>' + inserts.map(x => x.rsid).join('<br>');
		res.send(txt);
	}).catch(next);
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
		return insert(tableName, extractor(json)).then(function(dbResp) {
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



router.all('/migrate-snpedia', function(req, res, next) { 
	var startTime = Date.now();
	var sql = 'SELECT * FROM snpedia_snp2 LIMIT ' + (req.query.limit || '5');
	return Promise.each(db.executeSql(sql), function(snpRow) {
		snpRow.last_retrieved_date = snpRow.updated_date;
		snpRow.full_text = snpRow.snpedia_page;
		snpRow.categories = snpRow.snpedia_cats;
		['23andme', 'snpedia', 'ancestry', 'snpedia_page', 'snpedia_cats'].forEach(x => delete snpRow[x]);

		return db.transaction(function(trans) {
			return trans.executeSql('INSERT INTO snpedia_snp SET ?', snpRow).then(function() {
				trans.executeSql('DELETE FROM snpedia_snp2 WHERE rsid = ? LIMIT 1', snpRow.rsid);
			});
		}); 
	}).then(function(inserts) {
		var txt = 'ok! inserted: '+ inserts.length;
		var elapsedTime = Date.now() - startTime;
		txt += ' in ' + elapsedTime/1000 + ' seconds.';
		txt += '<br><br>' + inserts.map(x => x.rsid).join('<br>');
		txt += '<script>setTimeout(function() {location.reload();}, 2000);</script>';
		res.send(txt);
	}).catch(next);
});

module.exports = router;