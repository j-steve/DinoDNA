var router = require('express').Router();
var DnaProfile = require('../models/DnaProfile');

router.get('/', function(req, res, next) {
	res.locals.user.getDnaProfiles().then(function(dnaProfiles) {
		res.redirect(dnaProfiles.length ? '/dash' : '/add-dna-profile');
	}).catch(next);
});

module.exports = router;