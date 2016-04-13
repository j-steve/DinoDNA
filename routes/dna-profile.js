var router = require('express').Router();
var DnaProfile = require('../models/DnaProfile');
var DnaProfileSnp = require('../models/DnaProfileSnp');

//Populate the DNA Profile value on all requests.
router.get('/', function(req, res, next) {
	DnaProfile.getById(req.query.profile).then(function(dnaProfile) {
		res.locals.dnaProfile = dnaProfile;
		next();
	}).catch(next);
});

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('Getting SNP count for DNA profile id: ' + res.locals.dnaProfile.id);
	res.locals.dnaProfile.snpCount().then(function(count) {
		res.render('dna-profile', {pageTitle: 'DNA Profile: ' + res.locals.dnaProfile.name, snpCount: count});
	}).catch(next);
});

module.exports = router;