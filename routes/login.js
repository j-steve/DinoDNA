var MILIS_PER_DAY = 24 * 60 * 60 * 1000;

var router = require('express').Router();
var User = require(ROOT_PATH + '/models/User');

router.route('/')
	/**
	 * GET: Show the login page.
	 */
	.get(function(req, res, next) {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		if (req.cookies.userid) {
			res.redirect(req.query.r || '/dash');
		} else {
			res.render('login');
		}
		
	})

	/**
	 * POST: Process the submission from the login page
	 */
	.post(function(req, res, next) {
		var email = req.body.email.toLowerCase();
		console.log('Searching for user with email=' + email);
		if	(email.length < 5) {
			res.status(500).send('Invalid email address, must be a least 5 characters.');
		} else if (req.body.password.length < 5) { 
			res.status(500).send('Invalid password, must be a least 5 characters.');
		} else { 
			User.findOne({email: email}, function(err, user) {
				if (err) {return next(err);}
				if (user && !user.validatePassword(req.body.password)) {
					console.warn('Invalid password.');
					res.status(500).send('That email address has already been registered, but the password does not match. Please try again.');
				} else {
					if (user) {
						console.log('Password confirmed, logging in existing user: ' + email);
					} else {
						console.log('Registering new user: '+ email);
						user = new User({email: email});
						user.setPassword(req.body.password).save(); 
					}
					res.cookie('userid', user._id, {maxAge: 365 * MILIS_PER_DAY, httpOnly: true});
					res.send(req.query.r || '/dash');
				}
			});
		}
	});


module.exports = router;