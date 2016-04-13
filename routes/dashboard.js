var router = require('express').Router();
var DnaProfile = require(ROOT_PATH + '/models/DnaProfile');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.locals.user.getDnaProfiles().then(function(dnaProfiles) {
		res.render('dashboard', {pageTitle: 'Dashboard', dnaProfiles: dnaProfiles});
	}).catch(next);
});

module.exports = router;
