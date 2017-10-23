var express = require('express');
var router = express.Router();


const nodemailer = require('nodemailer');

let trans;

nodemailer.createTestAccount((err,account) =>{

	trans = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port:587,
		secure:false,
		auth:{
			user: account.user,
			pass: account.pass
		}
	});

	module.exports.transporter = trans;
});




