var router				= require('express').Router();
var Promise				= require('bluebird');
var GenosetCriteria		= require('../../models/GenosetCriteria');

router.get('/', function(req, res, next) {
	Promise.all(GenosetCriteria.getAll(), function(genoset) {
		return genoset.name;
	}).then(function(results) {
		console.log(results);
		res.send(results);
	}).catch(next);
});

module.exports = router;