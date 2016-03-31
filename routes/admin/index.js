var router = require('express').Router();
var request = require('request');
var Snp = require(ROOT_PATH + '/models/Snp');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('admin');
});

/* POST home page. */
//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?action=askargs&conditions=Category:Is%20a%20genotype&printouts=magnitude|'
//var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=ask&query=[[Category:Is%20a%20genotype]]|?magnitude|?Summary|sort=magnitude|order=desc|limit=100|offset=';
var SNPEDIA_URL = 'http://bots.snpedia.com/api.php?format=json&action=query&list=categorymembers&cmtitle=Category:In_dbSNP&continue&cmcontinue=';

router.post('/load-snpedia', function(req, res, next) {
	var continueFrom = '';
	var SNPs = [];
	request(SNPEDIA_URL + continueFrom, function(err, response, body) {
		if (err) {return res.status(500).send('ERROR: ' + err);}
		var json = JSON.parse(body);
		if (!json.batchcomplete) {
			json.query.categorymembers.forEach(function(member) {
				SNPs.push({rsid: member.title});
			});
		}
		res.send(SNPs);
	});
	
});

module.exports = router;
