var MILIS_PER_DAY = 24 * 60 * 60 * 1000;

var router = require('express').Router();
var User = require('../models/User');


/**
 * GET: Show the login page.
 */
router.get('/', function(req, res, next) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	if (req.cookies.userid) {
		res.redirect(req.query.r || '/dash');
	} else {
		res.render('login');
	}

});

/**
 * POST: Process the submission from the login page
 */
router.post('/', function(req, res, next) {
	var email = req.body.email.toLowerCase();
	console.log('Searching for user with email=' + email);
	if	(email.length < 5) {
		res.status(500).send('Invalid email address, must be a least 5 characters.');
	} else if (req.body.password.length < 5) {
		res.status(500).send('Invalid password, must be a least 5 characters.');
	} else {
		User.getOne({email: email}).then(function(user) {
			if (user && !user.validatePassword(req.body.password)) {
				console.warn('Invalid password.');
				res.status(500).send('That email address has already been registered, but the password does not match. Please try again.');
			} else {
				if (user) {
					console.log('Password confirmed, logging in existing user: ' + email);
					login(user);
				} else {
					console.log('Registering new user: '+ email);
					user = new User({email: email});
					user.setPassword(req.body.password).save().then(login);
				}
			}
		}).catch(next);
	}

	function login(user) {
		console.log('herewego');
		res.cookie('userid', user.id, {maxAge: 365 * MILIS_PER_DAY, httpOnly: true});
		res.send(req.query.r || '/dash');
	}
});


module.exports = router;