var router = require('express').Router(); 
var DnaProfile = require(ROOT_PATH + '/models/DnaProfile');

/* GET home page. */
router.get('/', function(req, res, next) { 
	res.render('add-dna-profile', {pageTitle: 'Create new DNA Profile'});
});

router.post('/', function(req, res, next) {
	var insertData = {userID: res.locals.user._id, name: req.body.name};
	DnaProfile.create(insertData, function(err, dnaProfile) {
		if (err) {return next(err);}
		console.log('Added dna profile: ' + dnaProfile.name);
		res.redirect('dna-upload?profile=' + encodeURIComponent(dnaProfile._id));
	});
})

module.exports = router;
