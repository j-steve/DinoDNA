var router				= require('express').Router();
var Promise				= require('bluebird');
var Logger				= require('../../lib/Logger');
var GenosetCriteria		= require('../../models/GenosetCriteria');

router.get('/', function(req, res, next) {
	Promise.filter(GenosetCriteria.getAll(), function(genoset) {
		return genoset.test(res.locals.dnaProfile.id);
	}).then(function(results) {
		res.locals.pageTitle = 'Genoset Report for ' + res.locals.dnaProfile.name;
		results.forEach(function(x) {if (x.magnitude === 0) {x.magnitude = -1;}});
		results.sort((a, b) => b.magnitude - a.magnitude);
		res.render('report/genoset', {genosets: results});
	}).catch(next);
});

module.exports = router;