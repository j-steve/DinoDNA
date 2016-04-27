require('./lib/polyfill.js');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var lessMiddleware = require('less-middleware');

var app = express();

global.ROOT_PATH = __dirname;

// Setup view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Additional app setup.
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(busboy());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Setup routing for public pages.
app.use('/', require('./routes/landing'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));

// Setup routing for admin pages
app.use('/admin', require('./routes/admin'));

// Process DNA profile ID on all requests where the 'profile' querystring is set.
app.use(function(req, res, next) {
	if (req.query && req.query.profile) {
		var DnaProfile = require('./models/DnaProfile');
		DnaProfile.getById(req.query.profile).then(function(dnaProfile) {
			res.locals.dnaProfile = dnaProfile;
			next();
		}).catch(next);
	} else {next();}
});

// Setup routing for authenticated pages.
app.use(require('./lib/auth'));
app.use('/start', require('./routes/start'));
app.use('/add-dna-profile', require('./routes/add-dna-profile'));
app.use('/dash', require('./routes/dashboard'));
app.use('/dna-upload', require('./routes/dna-upload'));
app.use('/dna-profile', require('./routes/dna-profile'));

app.use('/report/compare', require('./routes/report/compare'));
app.use('/report/genosets', require('./routes/report/genoset'));

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Handle Errors.
app.use(function(err, req, res, next) {
	console.error('ERROR:', err);
	res.status(err.status || 500);
	res.render('error', {
		message : err.message || err,
		error : app.get('env') === 'development' ? err : null
	});
});

module.exports = app;