var router = require('express').Router();
var DnaProfile = require('../models/DnaProfile');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('add-dna-profile', {
		pageTitle : 'Create new DNA Profile'
	});
});

router.post('/', function(req, res, next) {
	var insertData = {
		user_id : res.locals.user.id,
		name : req.body.name
	};
	console.log('dna prof is', DnaProfile);
	new DnaProfile(insertData).save().then(function(dnaProfile) {
		console.log('Added dna profile: ' + dnaProfile.name);
		res.redirect('dna-upload?profile=' + encodeURIComponent(dnaProfile.id));
	}).catch(next);
});

module.exports = router;
