var router = require('express').Router();
var DnaProfile = require(ROOT_PATH + '/models/DnaProfile');

router.get('/', function(req, res, next) {
	DnaProfile.findOne({userID: res.locals.user._id}, function(err, dnaProfile) {
		if (err) {return next(err);} 
		res.redirect(dnaProfile ? '/dash' : '/add-dna-profile');
	});
});

module.exports = router;