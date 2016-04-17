var Promise	= require('bluebird');
var request	= require('request');

exports.getJsonResponse = function(url) {
	return new Promise(function(resolve, reject) {
		console.log('Sending URL request to:', url);
		request(url, function(err, response, body) {
			if (err) {return reject(err);}
			try {
				resolve(JSON.parse(body));
			} catch (e) {
				reject(new Error('Response was not valid JSON format: ' + e.message));
			}
		});
	});
};