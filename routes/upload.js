var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require(ROOT_PATH + '/models/User');
 
// Create SNP schema



/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('upload');
});

module.exports = router;
