var app = require('express')();
var User = require('../models/User');

app.use(function(req, res, next) {
	User.getById(req.cookies.userid).then(function(user) {
		if (user) {
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.locals.user = user;
			next();
		} else {
			console.warn('Authentication failed for userid: ' + req.cookies.userid);
			res.clearCookie('userid'); // clear cookie, in the unlikely event it was set to an invalid value
			res.redirect('/login?r=' + encodeURIComponent(req.url));
		}
	}).catch(next);
});


module.exports = app;