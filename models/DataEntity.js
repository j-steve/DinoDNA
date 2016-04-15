var Promise	= require('bluebird');
var db		= require('../lib/db');

function DataEntity(tableName, ObjectClass) {
	var self = this;

	var getMetadata = db.executeSql('SHOW COLUMNS FROM ??', tableName).then(function(columns) {
		return {
			columns: columns.map(c => c.Field),
			id: columns.find(c => c.Key === 'PRI')
		};
	});

	this.getById = function(id) {
		return getMetadata.then(function(metadata) {
			var byId = {};
			byId[metadata.id] = id;
			return self.getOne(byId);
		});
	};

	this.getOne = function(where) {
		return DnaProfile.getMany(where).then(function(results) {
			if (results.length > 1) {throw new Error('More than 1 record returned.');}
			return results.length === 0 ? null : results[0];
		});
	};

	this.getMany = function(where) {
		return db.executeSql('SELECT * FROM ?? WHERE ?', 'dna_profile', where).then(function(rows) {
			return rows && rows.map(row => new ObjectClass(row));
		});
	};

	function instatiateObj() {
		Object.create(ObjectClass);
	}
}

module.exports = DataEntity;