var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send("You ain't registered ya varmint.");
});


module.exports = router;