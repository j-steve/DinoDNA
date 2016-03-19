var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var routes = require('./routes/index');
var users = require('./routes/users');

var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_tfldttfx:15vsse4tjgecu51hr47gtg6v36@ds047335.mlab.com:47335/heroku_tfldttfx');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're in");
	  var kittySchema = mongoose.Schema({
		name: String
	});
	kittySchema.methods.speak = function () {
		var greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
		console.log(greeting);
	};
	var Kitten = mongoose.model('Kitten', kittySchema);
	var silence = new Kitten({ name: 'Silence' });
	console.log(silence.name); // 'Silence'
	
	var fluffy = new Kitten({ name: 'fluffy' });
	fluffy.save(function (err, fluffy) {
		if (err) return console.error(err);
		fluffy.speak();
	});
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy()); 
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
 
app.use('/file-upload', function(req, res, next){
	var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);  
		var fs = require('fs');
		
        fstream = fs.createWriteStream('C:/Users/Steve/Downloads/DELETEME/' + filename);
        file.pipe(fstream); 
        fstream.on('close', function () {
			
			var lineReader = require('readline').createInterface({
				input: fs.createReadStream('C:/Users/Steve/Downloads/DELETEME/' + filename)
			}); 
			lineReader.on('line', function (line) {
			}); 
			
            res.redirect('back');
        }); 
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
