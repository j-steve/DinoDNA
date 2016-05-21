var router				= require('express').Router();
var Promise				= require('bluebird');
var Logger				= require('../../lib/Logger');
var GenosetCriteria		= require('../../models/GenosetCriteria');

router.get('/', function(req, res, next) {
	Promise.filter(GenosetCriteria.getSignifigant(), function(genoset) {
		return genoset.test(res.locals.dnaProfile.id);
	}).map(genoset => genoset.populateCategory()).then(function(results) {
		res.locals.pageTitle = 'Genoset Report for ' + res.locals.dnaProfile.name;
		results.sort(function(a, b) {
			if (a.category && b.category) {
				return b.category.id - a.category.id;
			} else if (a.category) {
				return -1;
			} else if (b.category) {
				return 1;
			} else {
				return b.magnitude - a.magnitude;
			}
		});
		res.render('report/genoset', {genosets: results});
	}).catch(next);
});

module.exports = router;