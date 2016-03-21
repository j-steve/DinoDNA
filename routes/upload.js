var express = require('express');
var router = express.Router();

var Readline = require('readline'); 

var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_tfldttfx:15vsse4tjgecu51hr47gtg6v36@ds047335.mlab.com:47335/heroku_tfldttfx');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/* Create SNP schema */
var SNP;
var dbconn = db.once('open', function() {
	console.log("Database connection established");
	var snpSchema = mongoose.Schema({ 
		rsid: String,
		chromosome: String,
		position: Number,
		allele1: String,
		allele2: String 
	});
	SNP = mongoose.model('SNP', snpSchema)
});

/* File Upload POST */
router.post('/', function(req, res, next) {
	try { 
		req.pipe(req.busboy);
		req.busboy.on('file', processFile);
	} catch (e) {
		console.error(e);
		res.status(500).end("An error occured.");
	} 

	/**
	 * @param {String} fieldname
	 * @param {FileStream} file
	 * @param {String} filename
	 */
	function processFile(fieldname, file, filename) {
		console.log("Uploading: " + filename);
		
		var lineReader = Readline.createInterface({input: file});
		var snps = [];
		
		file.on('data', function(data) {
			console.log('Next chunk recieved:', data.length, 'bytes of data; attempting to upload', snps.length, 'new records.');
			
			if (snps.length) { 
				var insertCount = snps.length;
				SNP.collection.insert(snps, function(err, docs) {
					if (err) {
						console.error(err);
						res.status(500).end("An error occured: DB insert failed.");
					} else {
						console.log('Inserted', insertCount, 'records succesfully');
					}
				});
				snps = [];
			}
		});
		
		var lineNo = 0;
		lineReader.on('line', function(line) {
			if (lineNo === -1) {return;}
			
			lineNo++; 
			if (lineNo === 1 && line !== '#AncestryDNA raw data download') {
				res.status(500).end('Invalid file: must be AncestryDNA file export.');
				lineNo = -1;
			} else if (lineNo > 17) { // skip comments and header 
				var lp = line.split('\t'); 
				snps.push({rsid: lp[0], chromosome: lp[1], position: lp[2], allele1: lp[3], allele2: lp[4]});
			}
		});
		
		lineReader.on('close', function() {
			if (!res.finished) {res.send('OK');}
		}); 
	}
});

module.exports = router;

