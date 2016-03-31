var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy'); 
var lessMiddleware = require('less-middleware'); 
var mongoose = require('mongoose');  

var app = express();

global.ROOT_PATH = __dirname;

// Setup view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Additional app setup.
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy()); 
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Establish DB connection and load DB Models.
var DB_CONN = 'mongodb://heroku_tfldttfx:15vsse4tjgecu51hr47gtg6v36@ds047335.mlab.com:47335/heroku_tfldttfx';
mongoose.connect(DB_CONN, {promiseLibrary: require('bluebird')}); 
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

// Setup routing for public pages.
app.use('/', require('./routes/landing'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));

// Setup routing for admin pages 
app.use('/admin', require('./routes/admin'));

// Setup routing for authenticated pages.
app.use(require('./utils/auth'));
app.use('/start', require('./routes/start'));
app.use('/add-dna-profile', require('./routes/add-dna-profile'));
app.use('/dash', require('./routes/dashboard'));
app.use('/dna-upload', require('./routes/dna-upload'));
app.use('/dna-profile', require('./routes/dna-profile'));

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Handle Errors.
if (app.get('env') === 'development') {
	// Development: print stacktrace.
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
} else {
	// Production: no stacktraces leaked to user.
	app.use(function(err, req, res, next) {
	  res.status(err.status || 500);
	  res.render('error', {
	    message: err.message,
	    error: {}
	  });
	});
}

module.exports = app;