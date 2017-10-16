var mysql = require('mysql');
var config = require('./config');

var connection = mysql.createConnection({
	host : 'localhost',
	user : config.sqlUserName,
	password : config.sqlPassword,
	database : config.databaseName
});


connection.connect((err) =>{
	if(err)
	{
		console.log("Error connecting to db: " + err);
	}
	else{
		console.log("db conneced...");
	}
});


module.exports.db = connection;
