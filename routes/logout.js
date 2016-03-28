var router = require('express').Router(); 

router.get('/', function(req, res) {
	res.clearCookie('userid');
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('logout')
});

module.exports = router;