var express = require('express');
var router = express.Router();
var validator = require('validator');

var database = require('../database');




var renderPage = function(req,res,next){

	//when we build our page as default, we must pass in a prefill or the ejs file will error out
	buildDefaultPrefill(req,function(err,response){

		res.render('referral', { title: 'Welcome to ' + req.app.locals.configFile.companyName,prefill:response });

	});
	

};










router.get('/',renderPage);

router.post('/',function(req,res,next){


	console.log(req.body);

	checkIfReferralValid(req,function(err,response){
		if(err)
		{
			res.render('referral', { title: 'Welcome to ' + req.app.locals.configFile.companyName,prefill: response });		
		}
		else
		{
			res.send("ok");
		}
	});

	

});








var checkIfReferralValid = function(req,callback)
{
	buildDefaultPrefill(req,function(err,response){

		var error = null;

		//submitter
		if(!req.body.SubmitterFName)
		{
			response.SubmitterFName.error = 'is-invalid';
			error = true;
		}
		if(!req.body.SubmitterLName)
		{
			response.SubmitterLName.error = 'is-invalid';
			error = true;
		}
		if(!validator.isEmail(req.body.SubmitterEmail))
		{
			response.SubmitterEmail.error = 'is-invalid';
			error = true;
		}
		if(!validator.isMobilePhone(req.body.SubmitterPhone.replace(/[^0-9]/g,''),'en-US'))
		{
			response.SubmitterPhone.error = 'is-invalid';
			error = true;
		}
		//end submitter

		//worker
		if(req.body.ReferralType == 'EOR'){
			if(!req.body.WorkerFName)
			{
				response.WorkerFName.error = 'is-invalid';
				error = true;
			}
			if(!req.body.WorkerLName)
			{
				response.WorkerLName.error = 'is-invalid';
				error = true;
			}
			if(!validator.isEmail(req.body.WorkerEmail))
			{
				response.WorkerEmail.error = 'is-invalid';
				error = true;
			}
			if(!validator.isMobilePhone(req.body.WorkerPhone.replace(/[^0-9]/g,''),'en-US'))
			{
				response.WorkerPhone.error = 'is-invalid';
				error = true;
			}
		}
		//end worker

		//client
		if(!req.body.ClientFName)
		{
			response.ClientFName.error = 'is-invalid';
			error = true;
		}
		if(!req.body.ClientLName)
		{
			response.ClientLName.error = 'is-invalid';
			error = true;
		}
		if(!validator.isEmail(req.body.ClientEmail))
		{
			response.ClientEmail.error = 'is-invalid';
			error = true;
		}
		if(!validator.isMobilePhone(req.body.ClientPhone.replace(/[^0-9]/g,''),'en-US'))
		{
			response.ClientPhone.error = 'is-invalid';
			error = true;
		}
		if(req.body.ClientAltPhone)
		{
			if(!validator.isMobilePhone(req.body.ClientAltPhone.replace(/[^0-9]/g,''),'en-US'))
			{
				response.ClientAltPhone.error = 'is-invalid';
				error = true;
			}
		}
		//address
		if(!req.body.ClientStreet)
		{
			response.ClientStreet.error = 'is-invalid';
			error = true;
		}
		if(!req.body.ClientCity)
		{
			response.ClientCity.error = 'is-invalid';
			error = true;
		}
		if(!req.body.ClientState)
		{
			response.ClientState.error = 'is-invalid';
			error = true;
		}
		if(!req.body.ClientZip)
		{
			response.ClientZip.error = 'is-invalid';
			error = true;
		}
		//
		if(!req.body.ClientDOB)
		{
			response.ClientDOB.error = 'is-invalid';
			error = true;
		}
		if(!req.body.ClientUCI)
		{
			response.ClientUCI.error = 'is-invalid';
			error = true;
		}
		if(!req.body.ClientHours)
		{
			response.ClientHours.error = 'is-invalid';
			error = true;
		}
		//end client

		//family
		if(req.body.ReferralType == 'EOR' || req.body.ReferralType == 'Respit'){
			if(!req.body.FamilyFName)
			{
				response.FamilyFName.error = 'is-invalid';
				error = true;
			}
			if(!req.body.FamilyLName)
			{
				response.FamilyLName.error = 'is-invalid';
				error = true;
			}
			if(!validator.isMobilePhone(req.body.FamilyPhone.replace(/[^0-9]/g,''),'en-US'))
			{
				response.FamilyPhone.error = 'is-invalid';
				error = true;
			}
			if(!req.body.FamilyRelationship)
			{
				response.FamilyRelationship.error = 'is-invalid';
				error = true;
			}
		}
		//end family

		callback(error,response);

	});
};


var buildDefaultPrefill = function(req,callback)
{
	var response = {};

	var type = req.body.ReferralType ? req.body.ReferralType : 'EOR';//set default to EOR if there is nothing in the body
	response.ReferralType = {value: type,error: ''};

	response.SubmitterFName = {value: req.body.SubmitterFName,error: ''};
	response.SubmitterLName = {value: req.body.SubmitterLName,error: ''};
	response.SubmitterEmail = {value: req.body.SubmitterEmail,error: ''};
	response.SubmitterPhone = {value: req.body.SubmitterPhone,error: ''};

	response.WorkerFName = {value: req.body.WorkerFName,error: ''};
	response.WorkerLName = {value: req.body.WorkerLName,error: ''};
	response.WorkerEmail = {value: req.body.WorkerEmail,error: ''};
	response.WorkerPhone = {value: req.body.WorkerPhone,error: ''};

	response.ClientFName = {value: req.body.ClientFName,error: ''};
	response.ClientLName = {value: req.body.ClientLName,error: ''};
	response.ClientEmail = {value: req.body.ClientEmail,error: ''};
	response.ClientPhone = {value: req.body.ClientPhone,error: ''};
	response.ClientAltPhone = {value: req.body.ClientAltPhone,error: ''};
	//address
	response.ClientStreet = {value: req.body.ClientStreet,error: ''};
	response.ClientStreet2 = {value: req.body.ClientStreet2,error: ''};
	response.ClientCity = {value: req.body.ClientCity,error: ''};
	response.ClientState = {value: req.body.ClientState,error: ''};
	response.ClientZip = {value: req.body.ClientZip,error: ''};
	//alt address
	response.ClientAltStreet = {value: req.body.ClientAltStreet,error: ''};
	response.ClientAltStreet2 = {value: req.body.ClientAltStreet2,error: ''};
	response.ClientAltCity = {value: req.body.ClientAltCity,error: ''};
	response.ClientAltState = {value: req.body.ClientAltState,error: ''};
	response.ClientAltZip = {value: req.body.ClientAltZip,error: ''};
	//
	response.ClientDOB = {value: req.body.ClientDOB,error: ''};
	response.ClientUCI = {value: req.body.ClientUCI,error: ''};
	response.ClientLanguage = {value: req.body.ClientLanguage,error: ''};
	response.ClientHours = {value: req.body.ClientHours,error: ''};
	var hourType = req.body.ClientHourType ? req.body.ClientHourType : 'quarterly';//set default to quarterly if there is nothing in the body
	response.ClientHourType = {value: hourType,error: ''};
	response.ClientDiagnosis = {value: req.body.ClientDiagnosis,error: ''};
	response.ClientAdditionalInfo = {value: req.body.ClientAdditionalInfo,error: ''};

	response.FamilyFName = {value: req.body.FamilyFName,error: ''};
	response.FamilyLName = {value: req.body.FamilyLName,error: ''};
	response.FamilyPhone = {value: req.body.FamilyPhone,error: ''};
	response.FamilyRelationship = {value: req.body.FamilyRelationship,error: ''};


	callback(null,response);
};





module.exports = router;

