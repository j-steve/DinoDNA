var router = require('express').Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.render('landing', { title: 'DinoDNA' });
});

module.exports = router;
