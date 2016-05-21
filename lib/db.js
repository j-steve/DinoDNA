var Promise = require('bluebird');
var mysql = require('mysql');
var text = require('./text');
var Logger = require('./Logger');

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'DinoDNA',
  password : 'dinoPass',
  database : 'DinoDNA_web'
});

pool.on('enqueue', function () {
	//console.warn('Waiting for available connection slot');
});

pool.on('error', function (err) {
	Logger.error(err.message);
});
	 
function DbConnection(initialConn) { 
	var self = this;
	
	function getConn() { 
		return new Promise(function (resolve, reject) {
			if (initialConn) {return resolve(initialConn);} 
			
			pool.getConnection(function(err, conn) {
				if (err) {
					Logger.error(err.message);
					reject(err);
				} else {
					resolve(conn);
					conn.release();
				}
			});
		});
	}
	
	this.getConnection = function() {
		return getConn().then(conn => new DbConnection(conn));
	};
	
	this.transaction = function(transCallback) {
		if (typeof transCallback !== 'function') {throw new TypeError('Invalid argument type, transaction requires a function argument.');}
		return self.getConnection().then(function(conn) {
			return conn.executeSql('START TRANSACTION').then(function() {
				conn.commit = x => conn.executeSql('COMMIT');
				conn.rollback = x => conn.executeSql('ROLLBACK');
				return transCallback(conn).tap(conn.commit).catch(function(err) {conn.rollback(); throw err;});
			});
		});
	};

	this.batchInsert = function(tableName, columns, values) {
		if (!values) {return Promise.reject(new Error('Values cannot be null.'));}
		if (!values.length) {return Promise.resolve(0);}
		return self.executeSql('INSERT INTO ?? (??) VALUES ?', tableName, columns, values).then(result => result.affectedRows);
	};

	this.selectOne = function(tableName, where) {
		return self.executeSql("SELECT * FROM ?? WHERE ???", tableName, where).then(function(rows, fields) {
			if (rows.length > 1) {throw new Error('Too many matching rows returned: expected 1, got ' + rows.length + ' records.');}
			return rows.length ? rows[0] : null;
		});
	};

	this.executeSql = function(sql, values) {
		values = [].slice.call(arguments, 1);
		var nullIndex = values.findIndex(x => x == null);
		if (nullIndex > -1) {throw new Error('Contains null or undefined value at index ' + (nullIndex + 1) + '.');}
		
		return new Promise(function(resolve, reject) {
			sql = self.format(sql, values);
			//console.log('Executing SQL:', text.truncate(sql, 100));
			getConn().then(conn => conn.query(sql, function(err, rows, fields) {
				if (err) {
					console.error(sql);
					return reject(err);
				}
				resolve(rows);
			}));
		});
	};
	
	this.format = function(sql, args) {
		return sql.replace(/\?+/g, function(match) {
			switch (match.length) {
				case 3: return escapeWhereClause(args.shift());
				case 2: return mysql.escapeId(args.shift());
				case 1: return mysql.format('?', args.shift());
				default: throw new Error('Invalid format: too many ?s in query: "' + sql + '".');
			}
		});
	};
	
	function escapeWhereClause(where) {
		if (typeof where === 'object') {
			var fields = Object.keys(where).map(function(field) {
				var value = where[field];
				var txt = mysql.escapeId(field);
				if (value == null) {
					txt += ' IS NULL';
				} else {
					txt += (typeof value === 'object') ? ' IN ' : ' = ';
					txt += mysql.escape(value);
				}
				return txt;
			});
			where = fields.join(' AND ');
		}
		return where;
	}
}

module.exports = new DbConnection();