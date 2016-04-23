var router = require('express').Router();
var DnaProfile = require('../models/DnaProfile');
var DnaProfileSnp = require('../models/DnaProfileSnp');
var Promise = require('bluebird');

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
	console.log('dna prof:', res.locals.dnaProfile);
	Promise.props({
	    snpCount: res.locals.dnaProfile.snpCount(),
	    dnaProfiles: res.locals.user.getDnaProfiles()
	}).then(function(result) {
		res.locals.pageTitle = 'DNA Profile: ' + res.locals.dnaProfile.name;
		res.locals.snpCount = result.snpCount;
		res.locals.otherDnaProfiles = result.dnaProfiles.filter(x => x.id !== res.locals.dnaProfile.id);
		res.render('dna-profile');
	}).catch(next);
});

module.exports = router;