var router = require('express').Router();

var Readline = require('readline');
var Promise = require('bluebird');
var DnaProfileSnp = require('../models/DnaProfileSnp');
var DnaProfile = require('../models/DnaProfile');

// Populate the DNA Profile value on all requests.
router.all('/', function(req, res, next) {
	DnaProfile.getById(req.query.profile).then(function(dnaProfile) {
		res.locals.dnaProfile = dnaProfile;
		next();
	}).catch(next);
});

/* File Upload GET */
router.get('/', function(req, res, next) {
	DnaProfile.getById(req.query.profile).then(function(dnaProfile) {
		res.render('dna-upload', {pageTitle: 'Upload DNA Data'});
	}).catch(next);
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
		var inserts = [];

		file.on('data', function(data) {
			console.log('Next chunk recieved:', data.length, 'bytes of data; attempting to upload', snps.length, 'new records.');

			if (snps.length) {
				var snpCount = snps.length;
				var insertPromise = DnaProfileSnp.collection.insert(snps).then(function() {
					console.log('Inserted', snpCount, 'records succesfully.');
				});
				inserts.push(insertPromise);
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
				var lineParts = line.split('\t');
				snps.push({
					dnaProfileID: res.locals.dnaProfile.id,
					rsid: lineParts[0],
					chromosome: lineParts[1],
					position: lineParts[2],
					allele1: lineParts[3],
					allele2: lineParts[4]
				});
			}
		});

		lineReader.on('close', function() {
			if (!res.finished) {res.sendStatus(200);}

			Promise.all(inserts).then(function() {
				console.log('All uploads complete.');
			})['catch'](console.error);
		});
	}

	/**
	 * Converts a Stream into a Promise.
	 *
	 * @param {Stream} stream
	 * @return {Promise}
	 */
	function streamToPromise(stream) {
	    return new Promise(function(resolve, reject) {
	        stream.on("end", resolve);
	        stream.on("error", reject);
	    });
	}
});

module.exports = router;

