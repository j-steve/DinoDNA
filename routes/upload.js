var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
 
// Create SNP schema



/* GET home page. */
router.get('/', function(req, res, next) {
	User.findById(req.cookies.userid, function(err, user) { 
		if (user) { 
			res.render('upload', {user:user.email});
		} else {
			res.redirect('/start');
		}
	});
  
});

module.exports = router;
