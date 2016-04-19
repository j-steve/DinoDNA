var Promise = require('bluebird');
var mysql = require('mysql');
var text = require('./text');

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'DinoDNA',
  password : 'dinoPass',
  database : 'DinoDNA_web'
});

pool.on('enqueue', function () {
	console.warn('Waiting for available connection slot');
});

function DbConnection(conn) { 
	var self = this;
	
	this.getConnection = function() {
		return new Promise(function (resolve, reject) {
			conn.getConnection(function(err, connection) {
				if (err) {return reject(err);} 
				resolve(new DbConnection(connection));
				connection.release();
			});
		});
	};
	
	this.transaction = function(transCallback) {
		if (typeof transCallback !== 'function') {throw new TypeError('Invalid argument type, transaction requires a function argument.');}
		return self.getConnection().then(function(connection) {
			return connection.executeSql('START TRANSACTION').then(function() {
				connection.commit = x => connection.executeSql('COMMIT');
				connection.rollback = x => connection.executeSql('ROLLBACK');
				return transCallback(connection).tap(connection.commit).catch(function(err) {connection.rollback(); throw err;});
			});
		});
	};

	this.batchInsert = function(tableName, columns, values) {
		if (!values) {return Promise.reject(new Error('Values cannot be null.'));}
		if (!values.length) {return Promise.resolve(0);}
		return self.executeSql('INSERT INTO ?? (??) VALUES ?', tableName, columns, values).then(result => result.affectedRows);
	};

	this.selectOne = function(tableName, where) {
		return self.executeSql("SELECT * FROM ?? WHERE ?", tableName, where).then(function(rows, fields) {
			if (rows.length > 1) {throw new Error('Too many matching rows returned: expected 1, got ' + rows.length + ' records.');}
			return rows.length ? rows[0] : null;
		});
	};

	this.executeSql = function(sql, values) {
		values = [].slice.call(arguments, 1);
		var nullIndex = values.findIndex(x => x == null);
		if (nullIndex > -1) {throw new Error('Contains null or undefined value at index ' + (nullIndex + 1) + '.');}
		
		return new Promise(function(resolve, reject) {
			sql = mysql.format(sql, values);
			console.log('Executing SQL:', text.truncate(sql, 100));
			conn.query(sql, function(err, rows, fields) {
				if (err) {return reject(err);}
				resolve(rows);
			});
		});
	};
}

module.exports = new DbConnection(pool);