var express = require('express');
var router = express.Router();


var database = require('../database');




var renderPage = function(req,res,next){


	res.render('referral', { title: 'Welcome to ' + req.app.locals.configFile.companyName });

}



router.get('/',renderPage);

router.post('/',renderPage);




module.exports = router;
