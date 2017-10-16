var express = require('express');
var router = express.Router();


var database = require('../database');

var renderHomePage = function(req,res,next){

	res.render('index', { title: 'Welcome to ' + req.app.locals.configFile.companyName });

}

// router.get('/', function(req, res, next) {
// 	//console.log("user: " + req.user.id + " " + req.user.permission);

// 	console.log('within get!');
// 	res.render('index', { title: 'Dirt Services' });
//   //res.render('index', { title: 'Express' });

// }]);

router.get('/',renderHomePage);

module.exports = router;
