var Promise	= require('bluebird');
var db		= require('../lib/db');
var text	= require('../lib/text');

/**
 * The DataCollection is a wrapper class for interfacing with a single DB table.
 * It includes operations for basic CRUD actions.
 * Retrieved records are returned as DataCollection.Entity objects.
 * 
 * @class
 * @param {String} tableName	the name of the database table asociated with this class
 */
function DataCollection(schemaName, tableName) {
	var self = this;

	/**
	 * The main table metadata query, used to populate the list of columns from the specified table
	 * without requiring those column names to be specified in the code.
	 * @type {Promise<Array<mysql.Field>>
	 */
	var getMetadata = db.executeSql('SHOW COLUMNS FROM ??.??', schemaName, tableName);
	
	/**
	 * A metadata query indicating the name of the table's primary key field.
	 * @type {Promise<String>}
	 */
	var getIdField = getMetadata.then(cols => (cols.find(x => x.Key === 'PRI') || cols[0]).Field);
	
	/**
	 * A metadata query indicating the field names of this table.
	 * @type {Promise<Array<String>>}
	 */
	var getFields = getMetadata.then(cols => cols.map(x => x.Field));

	/**
	 * Returns a single record whose primary key field matches the given ID value,<br>
	 * or {@code null} if no matching records are found.
	 * 
	 * @param {*} id	the primary key field value to match
	 * @returns {Promise<Entity>}
	 */
	this.getById = function(id) {
		if (id == null) {return Promise.resolve(null);}
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
			if (results.length > 1) {throw new Error(text.format('More than 1 record returned for {0} where {1} {2}.', tableName, where, whereVal));}
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
		const SQL = 'SELECT * FROM ??.?? WHERE ???';
		return db.executeSql(SQL, schemaName, tableName, where).then(self._asEntity);
	};

	/**
	 * Returns all records from the table.
	 *  
	 * @returns {Promise<Array<Entity>>}
	 */
	this.getAll = function() {
		const SQL = 'SELECT * FROM ??.??';
		return db.executeSql(SQL, schemaName, tableName).then(self._asEntity);
	};
	
	/**
	 * Returns the number of records matching the given criteria.
	 * 
	 * @param {String|Object} where		the sql WHERE clause, or an object of key-value pairs
	 * @returns {Promise<Number>}
	 */
	this.count = function(where) {
		const COUNT = 'COUNT(*)';
		const SQL = 'SELECT ' + COUNT + ' as ?? FROM ??.?? WHERE ???';
		return db.executeSql(SQL, COUNT, schemaName, tableName, where).then(self._asEntity);
	};
	
	/**
	 * Inserts the given values into the table. Useful for batch inserts.
	 * 
	 * @returns Promise<>
	 */
	this.insert = function(values) {
		if (!values || !values.length) {return Promise.resolve(null);}
		var columns = Object.keys(values[0]);
		return db.executeSql('INSERT INTO ??.?? (??) VALUES ?', schemaName, tableName, columns, values);
	};
	
	this._asEntity = function(dbRows) {
		return entityInit.then(function() {
			return dbRows && dbRows.map(x => new Entity(x));
		});
	};
	
	/**
	 * Returns a new instantiated Entity of this DataCollection type.
	 * 
	 * @returns {DataCollection.Entity}
	 */
	this.new = function(data) {
		return new Entity(data);
	};
	
	
	this.Entity = Entity.prototype;

	/**
	 * The Entity class represents a single record from the DataCollection.  It is a wrapper class for the raw row data.
	 * 
	 * @class
	 * @param {Object} rowData		a list of key-value pairs retrieved from the database 
	 */
	function Entity(rowData) {
		var self = this;

		// Fix BUFFER issue with bit fields.
		Object.keys(rowData).forEach(function(field) {
			if (rowData[field] && rowData[field].constructor.name === 'Buffer') {
				rowData[field] = rowData[field][0];
			}
		});
		/** @private */
		this._rowData = rowData;

		/**
		 * Saves this record to the database, invoking either {@link #insert()} or {@link #update()},
		 * based on whether this record is new or existing (determined by the existence of its "id" field).
		 * 
		 * @returns {Promise}
		 */
		this.save = function() {
			return self._id ? self.update() : self.insert();
		};

		/**
		 * Inserts this new record into the database.<br>
		 * Throws an error if its primary key field {@link #_id} has already been set, 
		 * which would indicate that this record has already been inserted.
		 * 
		 * @returns {Promise<mysql.Insert>}
		 */
		this.insert = function() {
			if (self._id) {return Promise.reject('Cannot insert: ID already exists, value="' + self._id + '".');}
			const SQL = 'INSERT INTO ??.?? SET ?';
			return db.executeSql(SQL, schemaName, tableName, self._rowData).then(function(result) {
				self._id = result.insertId;
				return self;
			});
		};

		/**
		 * Updates the values of this record in the database.<br>
		 * Throws an error if its primary key field {@link #_id} has not yet been set, 
		 * which would indicate that this record has not been inserted.
		 * 
		 * @returns {Promise<mysql.Update>}
		 */
		this.update = function() {
			if (!self._id) {return Promise.reject('Cannot update: ID is null.');}
			const SQL = 'UPDATE ??.?? SET ? WHERE ???';
			return db.executeSql(SQL, schemaName, tableName, self._rowData, {id: self._id}).then(function(result) {
				return self;
			});
		};
	}
	
	/**
	 * A promise that awaits the initial table metadata query, then sets Entity's database properties.<br>
	 * This promise should be awaited before returning any instantiated DataCollection.Entity objects,
	 * otherwise their DB property fields may not have been initialized yet.
	 * @type {Promise}
	 */
	var entityInit = Promise.join(
			// Add each row field as a property to the object.
			Promise.each(getFields, function(field) { 
				Object.defineProperty(Entity.prototype, field, {
					get: function() {return this._rowData[field];},
					set: function(val) {return (this._rowData[field] = val);}
				});
			}),
			// Add the special "_id" property.
			getIdField.then(function(idField) {
				Object.defineProperty(Entity.prototype, '_id', {
					get: function() {return this._rowData[idField];},
					set: function(val) {return (this._rowData[idField] = val);}
				});
			})
	);
}

module.exports = DataCollection;