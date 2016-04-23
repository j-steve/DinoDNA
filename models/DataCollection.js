var Promise	= require('bluebird');
var db		= require('../lib/db');

/**
 * The DataCollection is a wrapper class for interfacing with a single DB table.
 * It includes operations for basic CRUD actions.
 * Retrieved records are returned as DataCollection.Entity objects.
 * 
 * @constructor
 * @param {String} tableName	the name of the database table asociated with this class
 */
function DataCollection(tableName) {
	var self = this;

	var getMetadata = db.executeSql('SHOW COLUMNS FROM ??', tableName);
	var getIdField = getMetadata.then(cols => cols.find(x => x.Key === 'PRI').Field);
	var getFields = getMetadata.then(cols => cols.map(x => x.Field));

	/**
	 * Returns a single record whose primary key field matches the given ID value,<br>
	 * or {@code null} if no matching records are found.
	 * 
	 * @param {*} id	the primary key field value to match
	 * @returns {Promise<Entity>}
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
	 * @returns {Promise<Entity>}
	 */
	this.getOne = function(where, whereVal) {
		if (typeof where === 'string' && whereVal) {where = {[where]: whereVal};}
		return self.getMany(where).then(function(results) {
			if (results.length > 1) {throw new Error('More than 1 record returned.');}
			return results.length === 0 ? null : results[0];
		});
	};

	/**
	 * Returns all records matching the given 'where' clause values.
	 * 
	 * @param {String|Object} where		the sql WHERE clause, or an object of key-value pairs
	 * @returns {Promise<Array<Entity>>}
	 */
	this.getMany = function(where) {
		const SQL = 'SELECT * FROM ?? WHERE ?';
		return db.executeSql(SQL, tableName, where).then(rows => rows && rows.map(x => new Entity(x)));
	};
	
	/**
	 * Returns the number of records matching the given criteria.
	 * 
	 * @param {String|Object} where		the sql WHERE clause, or an object of key-value pairs
	 * @returns {Promise<Number>}
	 */
	this.count = function(where) {
		const COUNT = 'COUNT(*)';
		const SQL = 'SELECT ' + COUNT + ' as ?? FROM ?? WHERE ?';
		return db.executeSql(SQL, COUNT, tableName, where).then(x => x[0][COUNT]);
	};
	
	/**
	 * Inserts the given values into the table. Useful for batch inserts.
	 * 
	 * @returns Promise<>
	 */
	this.insert = function(values) {
		if (!values || !values.length) {return Promise.resolve(null);}
		var columns = Object.keys(values[0]);
		return db.executeSql('INSERT INTO ?? (??) VALUES ?', tableName, columns, values);
	};
	
	
	this.Entity = Entity.prototype;

	/**
	 * The Entity class represents a single record from the DataCollection.  It is a wrapper class for the raw row data.
	 * @constructor
	 */
	function Entity(rowData) {
		
		this._rowData = rowData;

		this.save = function() {
			return self._id ? self.update() : self.insert();
		};

		this.insert = function() {
			if (self._id) {return Promise.reject('Cannot insert: ID already exists, value="' + self._id + '".');}
			const SQL = 'INSERT INTO ?? SET ?';
			return db.executeSql(SQL, tableName, self._rowData).then(function(result) {
				self._id = result.insertId;
				return self;
			});
		};

		this.update = function() {
			if (!self._id) {return Promise.reject('Cannot update: ID is null.');}
			const SQL = 'UPDATE ?? SET ? WHERE ?';
			return db.executeSql(SQL, tableName, self._rowData, {id: self._id}).then(function(result) {
				return self;
			});
		};
	}
	
	// Add each row field as a property to the object.
	Promise.each(getFields, function(field) {
		Object.defineProperty(Entity.prototype, field, {
			get: function() {return this._rowData[field];},
			set: function(val) {return (this._rowData[field] = val);}
		});
	});

	// Add the special "_id" property.
	getIdField.then(function(idField) {
		Object.defineProperty(Entity.prototype, '_id', {
			get: function() {return this._rowData[idField];},
			set: function(val) {return (this._rowData[idField] = val);}
		});
	});
}

module.exports = DataCollection;