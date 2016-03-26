function tryLogin(form) {
	var errMsg = form.getElementsByClassName('errMsg')[0];
	errMsg.innerHTML = '';
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState === XMLHttpRequest.DONE) {
			if (req.status === 200) {
				document.location.replace(req.responseText);
			} else {
				errMsg.innerHTML = req.responseText;
			}
		}
	};
	req.open('POST', window.location.href);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	req.send(encodeForm(form));
}

function encodeForm(form) {
	var elements = [].slice.call(form.elements); // convert array-line to true array
	var values = elements.map(function(element) {
		return encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value);
	});
	return values.join('&');
}