var Promise = require('bluebird');
var mysql = require('mysql');

var db = mysql.createPool({
  host     : 'localhost',
  user     : 'DinoDNA',
  password : 'dinoPass',
  database : 'DinoDNA_web'
});

db.batchInsert = function(tableName, columns, values) {
	if (!values) {return Promise.reject(new Error('Values cannot be null.'));}
	if (!values.length) {return Promise.resolve(0);}
	return db.executeSql('INSERT INTO ?? (??) VALUES ?', tableName, columns, values).then(result => result.affectedRows);
};

db.selectOne = function(tableName, where) {
	return db.executeSql("SELECT * FROM ?? WHERE ?", tableName, where).then(function(rows, fields) {
		if (rows.length > 1) {throw new Error('Too many matching rows returned: expected 1, got ' + rows.length + ' records.');}
		return rows.length ? rows[0] : null;
	});
};

db.executeSql = function(sql, values) {
	values = [].slice.call(arguments, 1);
	return new Promise(function(resolve, reject) {
		sql = mysql.format(sql, values);
		db.query(sql, function(err, rows, fields) {
			if (err) {reject(err);} else {resolve(rows);}
		});
	});
};

module.exports = db;