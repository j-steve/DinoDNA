var router			= require('express').Router();
var Readline		= require('readline');
var Promise			= require('bluebird');
var db				= require('../lib/db');
var Logger			= require('../lib/Logger');
var DnaProfile		= require('../models/DnaProfile');
var DnaProfileSnp	= require('../models/DnaProfileSnp');
var DnaFileParser	= require('../models/DnaFileParser');

var COLUMN_NAMES = ['rsid', 'chromosome', 'position', 'allele1', 'allele2', 'dna_profile_id'];

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
		Logger.error(e);
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
				var insertPromise = db.batchInsert('dna_profile_snp', COLUMN_NAMES, snps).then(function(changedRows) {
					console.log('Inserted', changedRows, 'records succesfully.');
				});
				inserts.push(insertPromise);
				snps = [];
			}
		});

		var dnaFileParser = new DnaFileParser(res.locals.dnaProfile.id);
		
		lineReader.on('line', line => snps.push(dnaFileParser.parseLine(line)));

		lineReader.on('close', function() {
			if (dnaFileParser.isValidFile) {
				res.sendStatus(200);
			} else {
				res.status(500).end('Invalid file: must be AncestryDNA or 23andMe file export.');
			}

			Promise.all(inserts).then(x => console.log('All uploads complete.')).catch(Logger.error);
		});
	}
});

module.exports = router;

