var Promise	= require('bluebird');
var request	= require('request');

exports.getJsonResponse = function(url) {
	return new Promise(function(resolve, reject) {
		console.log('Sending URL request to:', url);
		request(url, function(err, response, body) {
			if (err) {return reject(err);}
			resolve(JSON.parse(body));
		});
	});
};