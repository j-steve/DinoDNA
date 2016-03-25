var express = require('express');
var router = express.Router();
var User = require('../models/User');


/* GET users listing. */
router.get('/', function(req, res, next) { 
	if (req.cookies.userid) {
		User.findById(req.cookies.userid, function(err, user) { 
			if (user) { 
				res.redirect('/upload');
			} else {
				res.render('create-account');
			}
		});
	} else {
		res.render('create-account');
	} 
});


router.post('/', function(req, res, next) {
	var userInfo = {username: req.body.username};
	User.findOne(userInfo, function(err, user) {
		if (user) {
			console.log("Duplicate user: " + user.username);
			res.status(500).end("Selected username already exists");
		} else {
			user = new User(userInfo)
			user.save(); 
			res.cookie('userid', user._id, { maxAge: 900000, httpOnly: true });
			console.log("Creted new user: " + user);
			res.redirect("/upload");
		}
	});
	
});


module.exports = router;