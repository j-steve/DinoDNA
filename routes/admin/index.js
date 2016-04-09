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
	var SNPs = [];
	sendRequest(req.body.startFrom || '');
	
	var loopCount = 0;
	function sendRequest(startFrom) {
			console.log('starting from:', startFrom)
			request(SNPEDIA_URL + startFrom, function(err, response, body) {
			if (err) {return res.status(500).send('ERROR: ' + err);}
			var json = JSON.parse(body);
			if (json.error) {
				return res.status(500).send('ERROR: ' + json.error.info);
			} else if (!json.batchcomplete && loopCount++ < req.body.maxPageCount) {
				json.query.categorymembers.forEach(function(member) {
					SNPs.push({rsid: member.title});
				});
				var continueFrom = json['continue'].cmcontinue;
				sendRequest(continueFrom);
			} else {
				var responseJson = {continueFrom: startFrom, snps: SNPs}
				res.send(responseJson);
			}
		});
	}
	
});

module.exports = router;
