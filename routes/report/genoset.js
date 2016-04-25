var router				= require('express').Router();
var Promise				= require('bluebird');
var GenosetCriteria		= require('../../models/GenosetCriteria');

router.get('/', function(req, res, next) {
	//Promise.filter(GenosetCriteria.getMany("name LIKE 'fake%'"), function(genoset) {
	Promise.filter(GenosetCriteria.getAll(), function(genoset) {
		var isMatch = genoset.test(res.locals.dnaProfile.id);
		isMatch.then(x => console.log('IS ' + genoset.name + ' A MATCH?', x));
		return isMatch;
	}).then(function(results) {
		var gsIds = results.map(x => x.name);
		res.send(gsIds);
	}).catch(next);
});

module.exports = router;