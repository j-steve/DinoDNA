var router = require('express').Router();  
var DnaProfile = require(ROOT_PATH + '/models/DnaProfile');
var SNP = require(ROOT_PATH + '/models/SNP');

//Populate the DNA Profile value on all requests.
router.get('/', function(req, res, next) {
	DnaProfile.findById(req.query.profile, function(err, dnaProfile) {
		if (!err) {res.locals.dnaProfile = dnaProfile;}
		next(err);
	});
});

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('Getting SNP count for DNA profile id: ' + res.locals.dnaProfile._id);
	SNP.count({dnaProfileID: res.locals.dnaProfile._id}, function(err, count) {
		res.render('dna-profile', {pageTitle: 'DNA Profile: ' + res.locals.dnaProfile.name, snpCount: count});
	});
});

module.exports = router;