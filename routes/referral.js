var express = require('express');
var router = express.Router();
var validator = require('validator');

var database = require('../database');

var email = require('../lib/email');

//render the page after a GET call
var renderPage = function(req,res,next){


	//when we build our page as default, we must pass in a prefill or the ejs file will error out
	buildDefaultPrefill(req,function(err,response){

		res.render('./referral/referral', { title: 'Welcome to ' + req.app.locals.configFile.companyName,prefill:response });

	});
	

};








router.get('/success',function(req,res,next){
	res.render('./referral/referralSuccess', { title: 'Referral Submitted Succesfully!'});
});

router.get('/',renderPage);

//user submitted the form
router.post('/',function(req,res,next){

	console.log(req.body);

	checkIfReferralValid(req,function(err,response){

		if(err)//re-render the page with the prefill object so the user doesnt lose info
		{
			res.render('./referral/referral', { title: 'Welcome to ' + req.app.locals.configFile.companyName,prefill: response });		
		}
		else//form has passed validation, add it to the db
		{
			insertReferralIntoDatabase(response,function(err,referralResponse){
				if(err)
				{
					res.render('./referral/referral', { title: 'Welcome to ' + req.app.locals.configFile.companyName,prefill:response,error:"Something went wrong. Please try again later." });
				}
				else
				{
					res.redirect('/referral/success');
				}
			});
		}

	});
});


//starts the inserting process into the database.
//ASSUMES INPUT IS VALIDATED
var insertReferralIntoDatabase = function(referralData,callback)
{
	
	var submitterPersonID;
	var workerPersonID = null;
	var clientAddressID;
	var clientAltAddressID = null;
	var clientID;
	var familtyID = null;

	new Promise(function(resolve,reject){
		//submitter
		var subFName = referralData.SubmitterFName.value;
		subFName = subFName.charAt(0).toUpperCase() + subFName.slice(1);//capitalize first letter
		var subLName = referralData.SubmitterLName.value;
		subLName = subLName.charAt(0).toUpperCase() + subLName.slice(1);

		database.db.query('INSERT INTO ReferralPerson (FName,LName,Email,Phone) VALUES (?,?,?,?)',[subFName,subLName,referralData.SubmitterEmail.value,referralData.SubmitterPhone.value],function(err,results){
			if(err){
				reject(err);
			}
			else
			{
				submitterPersonID = results.insertId;
				resolve();
			}
		});
	})
	.then(function(){//insert the worker into the db, if it is not eor, skip
		return new Promise(function(resolve,reject){

			if(referralData.ReferralType.value == 'EOR')
			{
				//worker
				var workerFName = referralData.WorkerFName.value;
				workerFName = workerFName.charAt(0).toUpperCase() + workerFName.slice(1);//capitalize first letter
				var workerLName = referralData.WorkerLName.value;
				workerLName = workerLName.charAt(0).toUpperCase() + workerLName.slice(1);

				database.db.query('INSERT INTO ReferralPerson (FName,LName,Email,Phone) VALUES (?,?,?,?)',[workerFName,workerLName,referralData.WorkerEmail.value,referralData.WorkerPhone.value],function(err,results){
					if(err){
						reject(err);
					}
					else
					{
						workerPersonID = results.insertId;
						resolve();
					}
				});
			}
			else
			{
				resolve();
			}
		});
	})
	.then(function(){//CLIENT ADDRESS
		return new Promise(function(resolve,reject){

			var street2 = referralData.ClientStreet2.value ? referralData.ClientStreet2.value : null;
			
			database.db.query('INSERT INTO Address (Street,Street2,State,ZIP) VALUES (?,?,?,?)',[referralData.ClientStreet.value,street2,referralData.ClientState.value,referralData.ClientZip.value],function(err,results){
				if(err){
					reject(err);
				}
				else
				{
					clientAddressID = results.insertId;
					resolve();
				}
			});

		});
	})
	.then(function(){//CLIENT ALT ADDRESS
		return new Promise(function(resolve,reject){

			if(referralData.ClientAltStreet.value)//if there is a alt street address we assume there is a second address to insert
			{
				var street2 = referralData.ClientAltStreet2.value ? referralData.ClientAltStreet2.value : null;
				
				database.db.query('INSERT INTO Address (Street,Street2,State,ZIP) VALUES (?,?,?,?)',[referralData.ClientAltStreet.value,street2,referralData.ClientAltState.value,referralData.ClientAltZip.value],function(err,results){
					if(err){
						reject(err);
					}
					else
					{
						clientAltAddressID = results.insertId;
						resolve();
					}
				});
			}
			else
			{
				resolve();
			}
		});
	})
	.then(function(){//insert the client into the db
		return new Promise(function(resolve,reject){
			
			var clientFName = referralData.ClientFName.value;
			clientFName = clientFName.charAt(0).toUpperCase() + clientFName.slice(1);//capitalize first letter
			var clientLName = referralData.ClientLName.value;
			clientLName = clientLName.charAt(0).toUpperCase() + clientLName.slice(1);

			var altPhone = referralData.ClientAltPhone.value ? referralData.ClientAltPhone.value : null;
			var language = referralData.ClientLanguage.value ? referralData.ClientLanguage.value : null;
			var diag = referralData.ClientDiagnosis.value ? referralData.ClientDiagnosis.value : null;

			var parameters = [clientFName,clientLName,referralData.ClientEmail.value,referralData.ClientPhone.value,altPhone,clientAddressID,clientAltAddressID,referralData.ClientDOB.value,referralData.ClientUCI.value,language,diag];

			database.db.query('INSERT INTO ReferralPerson (FName,LName,Email,Phone,AltPhone,Address,AltAddress,Birthday,UCI,Language,Diagnosis) VALUES (?,?,?,?,?,?,?,?,?,?,?)',parameters,function(err,results){

				if(err){
					reject(err);
				}
				else
				{
					clientID = results.insertId;
					resolve();
				}
			});

		});
	})
	.then(function(){//insert the family
		return new Promise(function(resolve,reject){

			//worker
			var familyFName = referralData.FamilyFName.value;
			familyFName = familyFName.charAt(0).toUpperCase() + familyFName.slice(1);//capitalize first letter
			var familyLName = referralData.FamilyLName.value;
			familyLName = familyLName.charAt(0).toUpperCase() + familyLName.slice(1);

			database.db.query('INSERT INTO ReferralPerson (FName,LName,Phone,Relationship) VALUES (?,?,?,?)',[familyFName,familyLName,referralData.FamilyPhone.value,referralData.FamilyRelationship.value],function(err,results){
				if(err){
					reject(err);
				}
				else
				{
					familyID = results.insertId;
					resolve();
				}
			});
		});
	})
	.then(function(){//insert referral
		return new Promise(function(resolve,reject){

			var hours = referralData.ClientHours.value ? referralData.ClientHours.value : null;
			var hourType = hours ? referralData.ClientHourType.value : null;
			var additionalInfo = referralData.ClientAdditionalInfo.value ? referralData.ClientAdditionalInfo.value : null;

			var parameters = [referralData.ReferralType.value,submitterPersonID,clientID,familyID,workerPersonID,hours,hourType,additionalInfo];

			database.db.query('INSERT INTO Referral (ReferralType,Submitter,Client,Family,Worker,Hours,HourType,AdditionalInfo) VALUES (?,?,?,?,?,?,?,?)',parameters,function(err,results){
				if(err){
					reject(err);
				}
				else
				{
					console.log(results.insertId);
					resolve();
				}
			});
		});
	})
	.then(function(){//insert referral
		callback(null,null);
	})
	.catch(function(err){
		console.log("caught error in promise: " + err);
		callback(err,null);
	});
	
};



//validates the post parameters to see if they are valid
//returns the same object that buildDefaultPrefill did but with any errors attached
//is-invalid is bootstrap 4 form color
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
		// if(!req.body.ClientHours)
		// {
		// 	response.ClientHours.error = 'is-invalid';
		// 	error = true;
		// }
		//end client

		//family
		if(req.body.ReferralType == 'EOR' || req.body.ReferralType == 'Respit' || req.body.FamilyFName){
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

//buids the object that is used by referral.ejs to prefill the page with values. Default them
//all to whatever was in the request.
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

