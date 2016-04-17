var router	= require('express').Router();
var request = require('request');
var Promise	= require('bluebird');
var db 		= require('../../lib/db');
var web 	= require('../../lib/web');
var text 	= require('../../lib/text');


router.get('/', function(req, res, next) {
	return res.render('admin/snp-progress');
});

var STATUS_SQL = 'select snpedia, count(*) as completed, count(*) / (select count(*) from snp) as percent from snp group by snpedia';

router.post('/', function(req, res, next) {
	db.executeSql(STATUS_SQL).then(function(results) { 
		res.setHeader('content-type', 'text/javascript');
		return res.send({data: results});
	}).catch(next);
});


module.exports = router;