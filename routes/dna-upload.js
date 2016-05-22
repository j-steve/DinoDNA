var router			= require('express').Router();
var Readline		= require('readline');
var Promise			= require('bluebird');
var db				= require('../lib/db');
var Logger			= require('../lib/Logger');
var DnaProfile		= require('../models/DnaProfile');
var DnaProfileSnp	= require('../models/DnaProfileSnp');
var DnaFileParser	= require('../models/DnaFileParser');
var UploadedFile	= require('../models/UploadedFile');

var COLUMN_NAMES = ['rsid', 'chromosome', 'position', 'allele1', 'allele2', 'dna_profile_id', 'uploaded_file_id'];

var FLIP_ALLELES_SQL = "UPDATE dinodna_web.dna_profile_snp JOIN dinodna_data.snp USING (rsid) SET allele1 = CASE allele1 WHEN 'A' THEN 'T' WHEN 'T' THEN 'A' WHEN 'C' THEN 'G' WHEN 'G' THEN 'C' END, allele2 = CASE allele2 WHEN 'A' THEN 'T' WHEN 'T' THEN 'A' WHEN 'C' THEN 'G' WHEN 'G' THEN 'C' END WHERE is_reversed = 1 AND uploaded_file_id = ?";


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
		req.busboy.on('file', function(fieldname, fileStream, filename) {
			UploadedFile.new({name: filename}).insert().then(function(uploadedFile) {
				processFile(uploadedFile, fileStream);
			});
		});
	} catch (e) {
		Logger.error(e);
		res.status(500).end("An error occured.");
	}

	/**
	 * @param {UploadedFile} uploadedFile
	 * @param {FileStream} file
	 */
	function processFile(uploadedFile, file) {
		console.log("Uploading: " + uploadedFile.name);

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
		
		var dnaFileParser = new DnaFileParser();
		
		lineReader.on('line', function(line) {
			var snp = dnaFileParser.parseLine(line);
			if (snp) {
				snp.push(res.locals.dnaProfile.id);
				snp.push(uploadedFile.id);
				snps.push(snp);
			}
		});

		lineReader.on('close', function() {
			if (dnaFileParser.isValidFile) {
				res.sendStatus(200);
			} else {
				uploadedFile.delete();
				res.status(500).end('Invalid file: must be AncestryDNA or 23andMe file export.');
			}

			Promise.all(inserts).then(function() {
				console.log('All uploads complete.'); 
				if (dnaFileParser.isAlwaysFwdStrand) {
					console.log('Flippin alleles');
					return db.executeSql(FLIP_ALLELES_SQL, uploadedFile.id);
				}
			}).then(function() {
				console.log('All done!');
				uploadedFile.completed_at = new Date();
				uploadedFile.save();
			}).catch(function(err) {
				 // On error, delete UploadedFile. Cascading delete will delete all SNPs.
				console.error(err);
				uploadedFile.delete();
			});
		});
	}
});

module.exports = router;

