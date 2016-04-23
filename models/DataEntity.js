var Promise	= require('bluebird');
var db		= require('../lib/db');

function DataTable(tableName) {
	var self = this;

	var getMetadata = db.executeSql('SHOW COLUMNS FROM ??', tableName);
	var getIdField = getMetadata.then(cols => cols.find(x => x.Key === 'PRI').Field);
	var getFields = getMetadata.then(cols => cols.map(x => x.Field));

	/**
	 * Returns a single record whose primary key field matches the given ID value,<br>
	 * or {@code null} if no matching records are found.
	 * 
	 * @param {*} id	the primary key field value to match
	 * @returns {DataRecord}
	 */
	this.getById = function(id) {
		return getIdField.then(idField => self.getOne(idField, id));
	};

	/**
	 * Returns a single record matching the given 'where' criteria.<br>
	 * Returns {@code null} if no matching records are returned.<br>
	 * Throws an error if more than 1 record is returned.
	 * 
	 * @param {String|Object} where		an object of key value pairs, or a where SQL string, or the string of a key name
	 * @param {String} [whereVal]		if a string is given as first parameter and this value is given, it is used as the value
	 * @returns {DataRecord}
	 */
	this.getOne = function(where, whereVal) {
		if (typeof where === 'string' && whereVal) {where = {}; where[where] = whereVal;}
		return self.getMany(where).then(function(results) {
			if (results.length > 1) {throw new Error('More than 1 record returned.');}
			return results.length === 0 ? null : results[0];
		});
	};

	/**
	 * Returns all records matching the given 'where' clause values.
	 * @param {String|Object} where	the sql WHERE clause, or an object of key-value pairs
	 * @returns {Array<DataRecord>}
	 */
	this.getMany = function(where) {
		const SQL = 'SELECT * FROM ?? WHERE ?';
		return db.executeSql(SQL, tableName, where).then(rows => rows && rows.map(x => new DataRecord(x)));
	};
	

	function DataRecord(rowData) {

		this.save = function() {
			return self._id ? self.update() : self.insert();
		};

		this.insert = function() {
			if (self._id) {return Promise.reject('Cannot insert: ID already exists, value="' + self._id + '".');}
			var sql = 'INSERT INTO ?? SET ?';
			return db.executeSql(sql, tableName, self).then(function(result) {
				self._id = result.insertId;
				return self;
			});
		};

		this.update = function() {
			if (!self._id) {return Promise.reject('Cannot update: ID is null.');}
			var sql = 'UPDATE ?? SET ? WHERE ?';
			return db.executeSql(sql, tableName, self, {id: self._id}).then(function(result) {
				return self;
			});
		};
		
		// Add each row field as a property to the object.
		Object.keys(rowData).forEach(function(key) {
			Object.defineProperty(self, key, {
				get: () => rowData[key],
				set: (val) => rowData[key] = val
			});
		});

		// Add the special "_id" property.
		Object.defineProperty(self, '_id', {
			get: () => rowData[getIdField.value()],
			set: (val) => rowData[getIdField.value()] = val
		});
	}
}

module.exports = DataEntity;