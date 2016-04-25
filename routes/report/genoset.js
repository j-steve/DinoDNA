var router				= require('express').Router();
var Promise				= require('bluebird');
var GenosetCriteria		= require('../../models/GenosetCriteria');

router.get('/', function(req, res, next) {
	Promise.filter(GenosetCriteria.getAll(), function(genoset) {
		return genoset.test(res.locals.dnaProfile.id);
	}).then(function(results) {
		var gsIds = results.map(x => x.name);
		res.send(gsIds);
	}).catch(next);
});

module.exports = router;