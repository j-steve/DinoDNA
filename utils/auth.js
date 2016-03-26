var express = require('express'); 
var app = express();
var User = require(ROOT_PATH + '/models/User');

app.use(function(req, res, next) {
	getUserById(req.cookies.userid).then(function(user) {
		if (user) {
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.locals.user = user;
			next();
		} else {
			console.warn('Authentication failed for userid: ' + req.cookies.userid);
			res.clearCookie('userid'); // clear cookie, in the unlikely event it was set to an invalid value
			res.redirect('/login?r=' + encodeURIComponent(req.url));
		}
	}, next);
});


function getUserById(userid) {
	return new Promise(function (resolve, reject) {
		if (userid) {  
			User.findById(userid, function(err, user) {
				if (err) {reject(err);} else {resolve(user);}
			});
		} else {
			resolve(false);
		}
	});
}


module.exports = app;