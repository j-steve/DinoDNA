var router = require('express').Router();
var DnaProfile = require(ROOT_PATH + '/models/DnaProfile');

/* GET home page. */
router.get('/', function(req, res, next) {
	DnaProfile.find({userID: res.locals.user._id}, function(err, dnaProfiles) {
		if (err) {return next(err);}
		res.render('dashboard', {pageTitle: 'Dashboard', dnaProfiles: dnaProfiles});
	});
});

module.exports = router;
