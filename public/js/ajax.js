function ajax(opts) {
	if (!opts || typeof opts === 'string') {opts = {url: opts};}
	if (!opts.url) {opts.url = location.href;}
	if (!opts.method) {opts.method = 'POST';}
	if (!opts.contentType) {opts.contentType = 'application/x-www-form-urlencoded';}
	if (typeof opts.data === 'object') {opts.data = encodeData(opts.data);}
	
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();
		
		req.onreadystatechange = function() {
			if (req.readyState === XMLHttpRequest.DONE) {
				if (req.status >= 200 && req.status < 300) {
					var response = req.response;
					if (req.getResponseHeader('Content-Type').startsWith('text/javascript;')) {
						response = JSON.parse(response);
					}
					resolve(response);
				} else {
					reject({httpCode: req.status, response: req.response});
				}
			}
		};
		req.onerror = function() {
			reject(new Error('Error sending ajax request.'));
		};
		
		req.open(opts.method, opts.url);
		req.setRequestHeader('Content-Type', opts.contentType);
		req.send(opts.data);
	});

	function encodeData(data) {
		var values = Object.keys(data).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
		return values.join('&');
	}
}
