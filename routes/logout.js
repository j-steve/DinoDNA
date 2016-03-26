var express = require('express');
var router = express.Router(); 

router.get('/', function(req, res) {
	res.clearCookie('userid');
	res.render('logout')
});

module.exports = router;