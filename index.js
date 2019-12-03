const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')
const log4js = require('log4js');
const dateFormat = require('dateformat');




app.use(session({
	secret: 'sdjkdfhsjksdh3jk33223jkhdfsdf',
	saveUninitialized : true,
	resave: true,
	cookie: {
	    maxAge: 99999999
	  }
}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const mongoose = require('mongoose')
mongoose.Promise = Promise
var db  = mongoose.connect('mongodb://localhost:27017/angulardb')
.then(() => console.log('Mongoose up'))
const User = require('./models/users')
const Reservation = require('./models/reservations.js')
app.use(bodyParser.json())
/*****************************************************************/
/*--------------------------Login--------------------------------*/
/*****************************************************************/
app.post('/api/login', async (req,res) => {
	const email = req.body.email
	const password = req.body.password
	console.log(email,password)
	const resp = await User.findOne({email,password})
	



	if(!resp){
		//logs--------------------
		log4js.configure({
		    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
		    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
		});
		const logger = log4js.getLogger();
		//------------------------


		console.log("incorrect details")
		res.json({ success: false, message: "Incorrect details"})
		logger.info('Request: /api/login , user '+email+' does not exist //Incorrect details// log4js!');

	}else{
		//logs--------------------
		log4js.configure({
		    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
		    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
		});
		const logger = log4js.getLogger();
		//------------------------

		logger.info('Request: /api/login , user: '+ resp.email +' is connected, log4js!');
		console.log("logging you in ")
		resp.connection = true
		User.update({"_id" : resp._id},resp, function(err, res) {
		    if (err) throw err;
		    console.log("1 document updated");
		  });
		//make a session and set user to logged in 
		res.json({success: true,message: email})
		req.session.user = email
		req.session.save()

	}
})
/*****************************************************************/
/*-----------------------get session-----------------------------*/
/*****************************************************************/
app.get('/api/isLoggedIn',(req,res) =>{
	res.json({status: !!req.session.user})})
/*****************************************************************/
/*-----------------------destroy session-------------------------*/
/*****************************************************************/
app.get('/api/logout',(req,res) =>{
	req.session.destroy()
	res.json({success: true})
	console.log("logging you out ")
})
/*****************************************************************/
/*-----------------------destroy sessionC-------------------------*/
/*****************************************************************/
app.post('/api/logoutC', async (req,res) =>{

	


	console.log("your email at logout is ",req.body.email)
	const usere =  await User.findOne({ email: req.body.email})
	if(!usere){
		//logs--------------------
		log4js.configure({
		    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
		    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
		});
		const logger = log4js.getLogger();
		//------------------------

		logger.info('Request: /api/logoutC , user: '+ req.body.email +' does not exist, log4js!');


		res.json({success: false})
		return
	}


	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	
	console.log("user' s connection before is: ", usere.connection)

	usere.connection = false
	console.log("user' s connection is: ", usere.connection)
	console.log(usere)
	User.update({"_id" : usere._id},usere, function(err, res) {
	    if (err) throw err;
	    console.log("1 document updated");
	  });
	logger.info('Request: /api/logoutC , user: '+ usere.email +' is disconnected, log4js!');

	res.json({success: true})

	console.log("logging you out ")
})


/*****************************************************************/
/*--------------------------add a demand-------------------------*/
/*****************************************************************/
app.post('/api/demand',async (req,res) => {
	console.log("we are on demande =================================")
	const email = req.body.email
	const From = req.body.From
	const To = req.body.To
	const datetimepicker = req.body.datetimepicker
	const NbPlaces = req.body.NbPlaces
	const resp = await User.findOne({email})
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	if(!resp){
		console.log("login first")
		res.json({success: false,message: "login first",id : "none"})
		logger.info('Request: /api/demand , user: '+ email +' is making a demand for carpooling but he\'s disconnected, log4js!');

	}else{
		console.log("demand is loading")
		//make an update and add from and to
		console.log(email,From,To);
		var myquery =  {"_id" : resp._id };
  		var newvalues = {"$push": { "demands": {"From" : From , "To" : To, "DateDem": datetimepicker, "NbPlaces" : NbPlaces } }};
		User.update({ "_id" : resp._id }, newvalues, function(err, res) {
		    if (err) throw err;
		    console.log("1 document updated");
		  });
		logger.info('Request: /api/demand , user: '+ email +' made a demand for carpooling, log4js!');

		res.json({success: true,message: "gooood update", id: "4" })
	}
	req.session.user = email
	req.session.save()	
})
/*****************************************************************/
/*--------------------------accept a demand-------------------------*/
/*****************************************************************/
app.post('/api/acceptDemand',async (req,res) => {
	const idReservation = req.body.idReservation
	const reservationA = await Reservation.find({"_id" : idReservation})
	const resp = await User.findOne({"email":reservationA[0].emailDemand})
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------

	if(!resp){
		console.log("No users for this demand")
		res.json({success: false,message: "No users for this demand or user was deleted",id : "none"})
		logger.info('Request: /api/acceptDemand , user-demander: '+ reservationA[0].emailDemand +' does not exist or was deleted, log4js!');

	}else{
		console.log("accept demand is loading")
		//make an update and add from and to
		
		var myquery =  {"_id" : resp._id };
		reservationA[0].Etat = "accepted";
		var newvaluesR = reservationA[0];
		Reservation.update({"_id" : idReservation},newvaluesR, function(err, res) {
		    if (err) throw err;
		    console.log("1 reservation's document updated");
		  });
  		var newvalues = {};
  		console.log("respID : "+ resp._id)
  		console.log("resid"+ reservationA[0].idDemand )
		User.update({
			 "_id" : resp._id , "demands._id": reservationA[0].idDemand 
		}, {
	 		$set: { "demands.$.Etat" : "accepted" },$push: { "notifications": { Description: "votre reservation est acceptee par le conducteur",
													 			TimeOfNotification :  new Date() ,
																Seen: false,	
																Type : "accepted",
																Responded : true,
																Important : true,
																idConcerned : reservationA[0].idDemand } }
	 	}, function(err, res) {
		    if (err) throw err;
		    console.log("1 user's document updated");
		  });
		User.update({
				"email" : reservationA[0].emailOffer , "offers._id": reservationA[0].idOffer 
			}, {
				$inc: { "offers.$.RsPlaces" : -reservationA[0].NbPlaces}
		 	}, function(err, res) {
			    if (err) throw err;
			    console.log("1 user's document updated");
			  });

		logger.info('Request: /api/acceptDemand , user: '+ reservationA[0].emailDemand +' demand is accepted by user :'+reservationA[0].emailOffer+' for the ID = '+ reservationA[0].idOffer+' \'s offer, log4js!');


		console.log("goooooooooooooooooooood")
		res.json({success: true,message: "gooood update", id: "7" })
	}

})
/*****************************************************************/
/*--------------------------reject a demand-------------------------*/
/*****************************************************************/
app.post('/api/rejectDemand',async (req,res) => {
	const idReservation = req.body.idReservation
	const reservationA = await Reservation.find({"_id" : idReservation})
	const resp = await User.findOne({"email":reservationA[0].emailDemand})
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	if(!resp){
		console.log("No users for this demand")
		res.json({success: false,message: "No users for this demand or user was deleted",id : "none"})
		logger.info('Request: /api/rejectDemand , user-demander: '+ reservationA[0].emailDemand +' does not exist or was deleted, log4js!');

	}else{
		console.log("reject demand is loading")
		//make an update and add from and to
		
		var myquery =  {"_id" : resp._id };
		reservationA[0].Etat = "rejected";
		var newvaluesR = reservationA[0];
		Reservation.update({"_id" : idReservation},newvaluesR, function(err, res) {
		    if (err) throw err;
		    console.log("1 reservation's document updated");
		  });
  		var newvalues = {};
  		console.log("respID : "+ resp._id)
  		console.log("resid"+ reservationA[0].idDemand )
		User.update({
			 "_id" : resp._id , "demands._id": reservationA[0].idDemand 
		}, {
	 		$set: { "demands.$.Etat" : "rejected" },$push: { "notifications": { Description: "votre reservation est refusee par le conducteur",
													 			TimeOfNotification :  new Date() ,
																Seen: false,	
																Type : "rejected",
																Responded : true,
																Important : true,
																idConcerned: reservationA[0].idDemand  }}
	 	}, function(err, res) {
		    if (err) throw err;
		    console.log("1 user's document updated");
		  });
		logger.info('Request: /api/rejectDemand , user: '+ reservationA[0].emailDemand +' demand is rejected by user :'+reservationA[0].emailOffer+' for the ID = '+ reservationA[0].idOffer+' \'s offer, log4js!');

		res.json({success: true,message: "gooood update", id: "7" })
	}
})

/*****************************************************************/
/*--------------------------cancel a demand-------------------------*/
/*****************************************************************/
app.post('/api/cancelDemand',async (req,res) => {
	const idDemand = req.body.idDemand
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const reservationA = await Reservation.find({"idDemand" : idDemand})
	if(reservationA.length === 0){
		console.log("no reservation for this demand")
		res.json({success: false,message: "No reservation for this demand or reservation was deleted",id : "none"})
		logger.info('Request: /api/cancelDemand , demand:'+ idDemand+' has no reservation or its reservation was deleted, log4js!');

	}else{
		console.log("there is a reservation for this demand")
		reservationA[0].Etat = "canceledD";
		var newvaluesR = reservationA[0];
		Reservation.update({"idDemand" : idDemand},newvaluesR, function(err, res) {
		    if (err) throw err;
		    console.log("1 reservation's document updated");
		  });

		const resp = await User.findOne({"email":reservationA[0].emailDemand})
		if(!resp){
			console.log("No users for this demand")
			res.json({success: false,message: "No users for this demand or user was deleted",id : "none"})
			logger.info('Request: /api/cancelDemand , user: '+ reservationA[0].emailDemand +' , No user with this email , log4js!');

		}else{
				User.update({
					"_id" : resp._id , "demands._id": reservationA[0].idDemand 
				}, {
			 		$set: { "demands.$.Etat" : "canceled" }
			 	}, function(err, res) {
				    if (err) throw err;
				    console.log("1 user's document updated");
				  });
				res.json({success: true,message: "gooood cancel D", id: "7" })
				//==============
				User.update({
					"email" : reservationA[0].emailOffer , "offers._id": reservationA[0].idOffer 
				}, {
					$inc: { "offers.$.RsPlaces" : +reservationA[0].NbPlaces}
			 	}, function(err, res) {
				    if (err) throw err;
				    console.log("1 user's document updated");
				  });
				logger.info('Request: /api/cancelDemand , reservation: '+ reservationA[0]._id +' between offerer: '+ reservationA[0].emailOffer+' and  demander: '+ reservationA[0].emailDemand  +'  has been canceled by demander, log4js!');

		}
	}
})
/*****************************************************************/
/*--------------------------Get my demands----------------------*/
/*****************************************************************/
app.post('/api/GetMyDemands',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	console.log("hana jit",email)
	const user = await User.findOne({email})

	if(!user){
		res.json('User was deleted')
		logger.info('Request: /api/GetMyDemands , user: '+ email+'  does not exist or was deleted, log4js!');
		return
	}
	logger.info('Request: /api/GetMyDemands , user: '+ email+'\'s demands are sent to Client server, log4js!');
	req.session.user = email
	req.session.save()
	res.json(user)
})
/*****************************************************************/
/*--------------------------Get my Notifications----------------------*/
/*****************************************************************/
app.post('/api/user/notification',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	var uns =0; 
	console.log("hana jit notif",email)
	const userN = await User.findOne({email})

	if(!userN){
		res.json({success : false, user :'User was deleted'})
				logger.info('Request: /api/user/notification , user: '+ email+'  does not exist or was deleted, log4js!');
		return
	}
	userN.notifications.forEach( function(element, index) {
		if(element.Seen == false){
			uns = uns+1
		}
	});
	logger.info('Request: /api/user/notification , user: '+ email+'\'s Notifications are sent to Client server, log4js!');
	req.session.user = email
	req.session.save()
	res.json({success : false, user : userN , unseen: uns} )

})
/*****************************************************************/
/*--------------------------Get my Notifications number----------------------*/
/*****************************************************************/
app.post('/api/user/notificationNumber',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	var uns =0; 
	
	const userN = await User.findOne({email})

	if(!userN){
		logger.info('Request: /api/user/notificationNumber , user: '+ email+'  does not exist or was deleted, log4js!');
		res.json({success : false, user :'User was deleted'})
		return
	}
	userN.notifications.forEach( function(element, index) {
		if(element.Seen == false){
			uns = uns+1
		}
	});
	logger.info('Request: /api/user/notificationNumber , user: '+ email+'\'s number of Notifications is sent to Client server, log4js!');
	req.session.user = email
	req.session.save()
	res.json(uns)

})
/*****************************************************************/
/*--------------------------Get my Notifications seen----------------------*/
/*****************************************************************/
app.post('/api/user/notificationSeen',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	var uns =0; 
	
	const userN = await User.findOne({email})

	if(!userN){
		logger.info('Request: /api/user/notificationSeen , user: '+ email+'  does not exist or was deleted, log4js!');
		res.json(false)
		return
	}
	userN.notifications.forEach( function(element, index) {
		element.Seen = true;
	});

	console.log("id is ", userN._id)
	User.update({
					"_id" : userN._id  
				},userN, function(err, res) {
				    if (err) throw err;
				    console.log("1 user's document updated");
				  });


	logger.info('Request: /api/user/notificationSeen , user: '+ email+'\'s Notifications are set to SEEN, log4js!');



	req.session.user = email
	req.session.save()
	res.json(true)

})



/*****************************************************************/
/*--------------------------Get last demand----------------------*/
/*****************************************************************/
app.post('/api/demand/last',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	console.log("we are on demande last =================================")
	const email = req.body.email
	const resp = await User.findOne({email})
	if(!resp){
		console.log("login first")
		res.json({success: false,message: "login first",id : "none"})
		logger.info('Request: /api/demand/last , user: '+ email+'  does not exist or was deleted, log4js!');
	}else{
		console.log("demand is loading")
		//make an update and add from and to
		console.log(resp.email);
		const idlast = resp.demands[resp.demands.length-1]._id
		logger.info('Request: /api/demand/last , user: '+ email+'\'s last demand is sent to Client server, log4js!');
		res.json({success: true,message: "gooood get last", id: idlast})
	}
	req.session.user = email
	req.session.save()
})
/*****************************************************************/
/**-------------------------make an offer-----------------------**/
/*****************************************************************/
app.post('/api/offer',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	console.log("we are on offer =================================")
	const email = req.body.email
	const From = req.body.From
	const To = req.body.To
	const NbPlaces = req.body.NbPl
	const Prix = req.body.Prix
	const datetimepicker = req.body.datetimepicker
	const DMY = dateFormat( new Date(datetimepicker), "yyyy-mm-dd").toString()
	const resp = await User.findOne({email})
	console.log("DMY is : ",DMY)
	if(!resp){
		console.log("login first")
		logger.info('Request: /api/offer , user: '+ email+'  does not exist or was deleted, log4js!');
		res.json({success: false,message: "login first"})
	}else{
		console.log("offer is loading")
		//make an update and add from and to
		console.log(email,From,To);
		var myquery =  { "_id" : resp._id };
  		var newvalues = {"$push": { "offers": {"From" : From , "To" : To,"NbPlaces": NbPlaces,"RsPlaces": NbPlaces,"Prix": Prix, "DateOffer": datetimepicker, "DMY": DMY /*dateFormat( new Date(datetimepicker), "yyyy-mm-dd").toString()*/} }};
		User.update({ "_id" : resp._id }, newvalues, function(err, res) {
		    if (err) throw err;
		    console.log("1 document updated");
		  });
		logger.info('Request: /api/offer , user: '+ email+'\'s has made an offer, log4js!');
		res.json({success: true,message: "gooood update for offer"})
		req.session.user = email
		req.session.save()	
	}
})
/*****************************************************************/
/*--------------------------cancel a offer-------------------------*/
/*****************************************************************/

app.post('/api/cancelOffer',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const idOffer = req.body.idOffer
	const emailOffer = req.body.emailOffer
	const reservationA = await Reservation.find({"idOffer" : idOffer})
	console.log("reservationA: ")
	console.log(idOffer)
	console.log(reservationA.length)
	if(reservationA.length === 0 ){
		console.log("no reservation for this offer")
		logger.info('Request: /api/cancelOffer , there is no reservation for this offerer: '+emailOffer+' and Id: '+idOffer+' , log4js!');
	}else{
		console.log("there is a reservation for this offer")
		
		reservationA[0].Etat = "canceledO";
		var newvaluesR = reservationA[0];
		Reservation.update({"idOffer" : idOffer},newvaluesR, function(err, res) {
		    if (err) throw err;
		    console.log("1 reservation's document updated");
		  });
		logger.info('Request: /api/cancelOffer , Reservation : '+reservationA[0]._id +' was canceled by offerer :'+ emailOffer+' , log4js!');

	}
	const resp = await User.findOne({"email":emailOffer})
	if(!resp){
		console.log("No users for this offer")
		res.json({success: false,message: "No users for this offer or user was deleted"})
		logger.info('Request: /api/cancelOffer , user: '+ emailOffer+'  does not exist or was deleted , log4js!');
	}else{
			User.update({
				"_id" : resp._id , "offers._id": idOffer 
			}, {
		 		$set: { "offers.$.Etat" : "canceled" }
		 	}, function(err, res) {
			    if (err) throw err;
			    console.log("1 user's document updated");
			  });
			logger.info('Request: /api/cancelOffer , user: '+ emailOffer+'\'s offer is canceled successfully , log4js!');
			res.json({success: true,message: "gooood cancel O" })
	}
})
/*****************************************************************/
/**-----------------registration of a conductor-----------------**/
/*****************************************************************/
app.post('/api/register/Conductor',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	const password = req.body.password
	const nom = req.body.nom
	const prenom = req.body.prenom
	const age = req.body.age
	const tel = req.body.tel
	const sexe = req.body.sexe
	const carDescri = req.body.carDescri
	const carPlaces = req.body.carPlaces
	const carMat = req.body.carMat
	const existingUser = await User.findOne({email})
	if(existingUser){
		logger.info('Request: /api/register/Conductor , user: '+ email+'  does not exist or was deleted , log4js!');
		res.json({success: false,message: "Email already in use"})
		return 
	}
	const user = new User({email,password,nom,prenom,age,tel,sexe})
	user.cars.push({"carDescri": carDescri, "carPlaces": carPlaces, "carMat": carMat })
	const result = await user.save()
	logger.info('Request: /api/register/Conductor , user: '+ email+'  has been registred successfully , log4js!');
	res.json({success: true,message: "Welcome!"})
})
/*****************************************************************/
/**-----------------registration of a car-----------------**/
/*****************************************************************/
app.post('/api/addCar',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	const carDescri = req.body.car
	const carPlaces = req.body.carPlaces
	const carMat = req.body.carMat
	const user = await User.findOne({email})
	

	var newvalues = {"$push": { "cars": {"carDescri": carDescri, "carPlaces": carPlaces, "carMat": carMat } }};
	User.update({ "_id" : user._id }, newvalues, function(err, res) {
	    if (err) throw err;
	    console.log("1 document updated");
	  });
	logger.info('Request: /api/addCar , user: '+ email+' has added a car successfully , log4js!');
	const result = await user.save()
	res.json({success: true,message: "car added !!!"})
	req.session.user = email
	req.session.save()
})


/*****************************************************************/
/**-----------------get Reservations according to an offer------**/
/*****************************************************************/
app.post('/api/reservation/getReservations',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const idOffer = req.body.idOffer
	console.log("*****************************************-----------offer-------------------***********  : ",idOffer)
	const reservationOffer = await Reservation.find({"idOffer" : idOffer})
	console.log("reservations for this id: ")
	console.log(reservationOffer)
	console.log("end of reservations for this id")
	res.json({success: true,listReservation: reservationOffer})
	logger.info('Request: /api/reservation/getReservations , reservation according to the id Offer: '+ idOffer+' have been sent successfully to the Client server , log4js!');
})


/*****************************************************************/
/**-----------------registration of a Reservation-----------------**/
/*****************************************************************/
app.post('/api/reservation',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const emailOffer = req.body.emailOffer
	const emailDemand = req.body.emailDemand
	const idOffer = req.body.idOffer
	const idDemand = req.body.idDemand
	const NbPlaces = req.body.NbPlaces

	const userDemand = await User.findOne({"email" : emailDemand})
	const userOffer = await User.findOne({"email" : emailOffer})
	const reservation = new Reservation(
		{"emailOffer" : emailOffer,"emailDemand" : emailDemand ,
		"idOffer" :idOffer,"idDemand" :idDemand,"NbPlaces" : NbPlaces})
	const resp = await User.findOne({"email":emailDemand})
	if(!resp){
		console.log("No users for this Demand")
		logger.info('Request: /api/reservation , user: '+ emailDemand+'  does not exist or was deleted , log4js!');
		res.json({success: false,message: "No users for this Demand or user was deleted",id : reservation._id})
	}else{
			User.update({
				"_id" : resp._id , "demands._id": idDemand 
			}, {
		 		$set: { "demands.$.Etat" : "waiting" },
		 	}, function(err, res) {
			    if (err) throw err;
			    console.log("1 user's document updated");
			  });
			logger.info('Request: /api/reservation , user: '+ emailDemand+'\'s demand statut has been set to waiting, log4js!');
	}

	const respOff = await User.findOne({"email":emailOffer});
	if(!respOff){
		console.log("No users for this offer")
		logger.info('Request: /api/reservation , user: '+ emailOffer+'  does not exist or was deleted , log4js!');
		res.json({success: false,message: "No users for this offer or user was deleted",id : reservation._id})
	}else{

		User.update({
				"_id" : respOff._id 
			}, {
		 		$push: { "notifications": { Description: "vous avez une nouvelle demande pour une offre de la part de "+ resp.nom+" "+resp.prenom,
												 			TimeOfNotification :  new Date() ,
															Seen: false,	
															Type : "reservation",
															Responded : false ,
															Important : true,
															idConcerned: idOffer  }}
		 	}, function(err, res) {
			    if (err) throw err;
			    console.log("1 user's document updated");
			  });
			logger.info('Request: /api/reservation , user: '+ emailOffer+' , a notification has added, log4js!');

	}

	const result = await reservation.save()
	console.log(result)
	res.json({success: true,message: "Welcome! reservation",id : reservation._id })
})
/*****************************************************************/
/**-----------Registraion of a passager-------------------------**/
/*****************************************************************/
app.post('/api/register',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	const password = req.body.password
	const nom = req.body.nom
	const prenom = req.body.prenom
	const age = req.body.age
	const tel = req.body.tel
	
	const sexe = req.body.sexe
	const conn = true
	const existingUser = await User.findOne({email})

	if(existingUser){
		logger.info('Request: /api/register , user: '+ email+'  does not exist or was deleted , log4js!');
		res.json({success: false,message: "Email already in use"})
		return 
	}
	logger.info('Request: /api/register , user: '+ email+' has been registred successfully , log4js!');
	const user = new User({email,password,nom,prenom,age,tel,sexe,conn })
	const result = await user.save()
	res.json({success: true,message: "Welcome!"})
})
/*****************************************************************/
/**-----------User exist               -------------------------**/
/*****************************************************************/
app.post('/api/user/exist',async (req,res) => {
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	const existingUser = await User.findOne({"email":email})
	if(existingUser){
		logger.info('Request: /api/user/exist , user: '+ email+'  does not exist or was deleted , log4js!');
		res.json({success: true,message: "Email already in use"})
		return 
	}
	logger.info('Request: /api/user/exist , user: '+ email+' exists !! , log4js!');
	res.json({success: false,message: "Exists!"})
})

/*****************************************************************/
/*---------------search user if user exist-----------------------*/
/*****************************************************************/
app.get('/api/data',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	console.log("req.session.user : "+req.session.user )
	const user = await User.findOne({ email: req.session.user})
	if(!user){
		res.json({status: false,message: 'User was deleted'})
		return
	}
	req.session.user = user.email
	req.session.save()
	res.json({status: true,email: req.session.user,quote: user.quote})
})


/*****************************************************************/
/*--------------- cooookies search user if user exist-----------------------*/
/*****************************************************************/
app.post('/api/datas',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	console.log("email : "+req.body.email )
	const user = await User.findOne({ email: req.body.email})

	if(!user){
		logger.info('Request: /api/datas , user: '+ req.body.email+'  does not exist or was deleted , log4js!');
		res.json({status: false,message: 'User was deleted'})
		return
	}
	
	if(user.connection){
		logger.info('Request: /api/datas , user: '+ req.body.email+'  is connected    , log4js!');
		res.json({status: true,email: user.email})
	}else{
		logger.info('Request: /api/datas , user: '+ req.body.email+'  is disconnected , log4js!');
		res.json({status: false,email: user.email})

	}
})
/*****************************************************************/
/*---------------has a car                 ----------------------*/
/*****************************************************************/
app.post('/api/user/hasCar',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const user = await User.findOne({ email: req.body.email})

	if(!user){
		logger.info('Request: /api/user/hasCar , user: '+ req.body.email+'  does not exist or was deleted , log4js!');
		res.json({ success : false, message : "no user"})
		return
	}
	if(user.cars.length == 0){
		logger.info('Request: /api/user/hasCar , user: '+ req.body.email+'  has not a car    , log4js!');
		res.json({ success : false, message : "has no cars"})
	}else{
		logger.info('Request: /api/user/hasCar , user: '+ req.body.email+'  has a car    , log4js!');
		res.json( {success : true, message : "has a car"})
	}
	req.session.user = user.email
	req.session.save()
})
/*****************************************************************/
/*---------------Car capacity             -----------------------*/
/*****************************************************************/
app.post('/api/car/capacity',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const user = await User.findOne({ email: req.body.email})

	if(!user){
		logger.info('Request: /api/car/capacity , user: '+ req.body.email+'  does not exist or was deleted , log4js!');
		res.json(-2)
		return
	}
	if(user.cars.length == 0){
		logger.info('Request: /api/car/capacity , user: '+ req.body.email+'  does not have a car , log4js!');
		res.json(-1)
	}else{
		logger.info('Request: /api/car/capacity , user: '+ req.body.email+'  has a car that can take '+user.cars[0].carPlaces+' places , log4js!');
		console.log("car capacity is : ",user.cars[0].carPlaces)
		res.json(user.cars[0].carPlaces)
	}
	req.session.user = user.email
	req.session.save()
})
/*****************************************************************/
/*---------------get whole data of a user user if user exist-----------------------*/
/*****************************************************************/
app.post('/api/user/data',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const user = await User.findOne({ email: req.body.email})

	if(!user){
		logger.info('Request: /api/user/data , user: '+ req.body.email+'  does not exist or was deleted , log4js!');
		res.json({UserData: 'User was deleted'})
		return
	}
	logger.info('Request: /api/user/data , user: '+ req.body.email+'\'informations have been sent to the Client server , log4js!');
	res.json(user)
})

/*****************************************************************/
/*----------search user with using email and get offers-------------*/
/*****************************************************************/
app.post('/api/listMyOffers',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const email = req.body.email
	console.log(email)
	console.log("this is my list offers request **********")
	const user = await User.findOne({email})

	if(!user){
		logger.info('Request: /api/listMyOffers , user: '+ req.body.email+'  does not exist or was deleted , log4js!');
		res.json({status: false,list: ['User was deleted']})
		return
	}
	logger.info('Request: /api/listMyOffers , user: '+ req.body.email+'\'s list of offers has been sent to the Client server , log4js!');
	req.session.user = email
	req.session.save()
	res.json({status: true,list : user})
})
/*****************************************************************/
/*----------list offers                             -------------*/
/*****************************************************************/
app.post('/api/offer/alreadyReserved',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const emailDemand = req.body.email
	var contained =false;


	const reservationsOffer = await Reservation.find({"emailDemand" : emailDemand })
	var notIn=[];
	 reservationsOffer.forEach( function(element, index) {
	 	notIn.forEach( function(elementN, indexN) {
	 		if(elementN == element.idOffer){
	 			contained = true
	 		}
	 	});


		if(contained){
			console.log(element.idOffer+" alredy pushed")
		}else{
			notIn.push(element.idOffer)
		}
		contained = false;
	});
	 console.log("not In : ",notIn)
	//const user = await User.find(query,{email: ,offers: {$elemMatch: {"From":From}}}) ;
	logger.info('Request: /api/offer/alreadyReserved , user: '+ req.body.email+'\'s list of offers where he has already reserved has been sent to the Client server , log4js!');
	res.json(notIn)
})






/*****************************************************************/
/*----------list offers                             -------------*/
/*****************************************************************/
app.post('/api/listOffer',async (req,res) =>{
	//logs--------------------
	log4js.configure({
	    appenders: { fileAppender: { type: 'file', filename: './logs/'+(new Date()).toISOString().slice(0,10) +'.log' } },
	    categories: { default: { appenders: ['fileAppender'], level: 'info' } }
	});
	const logger = log4js.getLogger();
	//------------------------
	const From = req.body.from
	const To = req.body.to
	const datetimepicker = req.body.datetimepicker
	const emailDemand = req.body.email
	const tommorow = new Date(datetimepicker)
	var DateBefore;
	var DateAfter;

	tommorow.setDate(tommorow.getDate()+1)
	DateAfter = dateFormat(tommorow , "yyyy-mm-dd")
	tommorow.setDate(tommorow.getDate()-2)
	DateBefore = dateFormat(tommorow , "yyyy-mm-dd")
	console.log("the day: ", dateFormat(datetimepicker , "yyyy-mm-dd"))
	console.log("the day after: ", dateFormat(DateAfter , "yyyy-mm-dd"))
	console.log("the day before: ", dateFormat(DateBefore , "yyyy-mm-dd"))
	const reservationsOffer = await Reservation.find({"emailDemand" : emailDemand })
	var notIn=[];
	 reservationsOffer.forEach( function(element, index) {
		notIn.push(element.idOffer )

	});
	 console.log("not In : ",notIn)
	//const user = await User.find(query,{email: ,offers: {$elemMatch: {"From":From}}}) ;
	console.log("date format is : " , dateFormat(datetimepicker , "yyyy-mm-dd"))

			//		            	{ $eq :['dateFormat($$offer.DateOffer, "yyyy-mm-dd")',dateFormat(datetimepicker , "yyyy-mm-dd")]},
	const user = await User.aggregate([
		
	    {$project: {
	    	email: 1,
	    	nom : 1,
			prenom : 1,
			age : 1,
			tel : 1,
			sexe : 1,
			cars: 1,
	        offers: {$filter: {
	            input: '$offers',
	            as: 'offer',
	            cond: {$and:[
				            	{ $eq :['$$offer.From', From]},
				            	{ $eq :['$$offer.To',To]},
				            	{ $in :[ '$$offer.DMY', [ dateFormat(datetimepicker , "yyyy-mm-dd"), DateBefore , DateAfter ] ]},
				            	{ $eq :['$$offer.Etat',"progress"]}
				      	    ]
	            	  }
	        }},
	        _id: 1
	        }},
	        { $match:{ $and : [
							 	{'offers.From': From,'offers.To':To},
							 	{'email': {$ne: emailDemand}}

						 	  ]
			  		 }  
			}
		])
	/*find(query).toArray(function(err, result) {
	    if (err) throw err;
	    console.log(result);
	    User.close();
	 })*/

	if(!user){
		logger.info('Request: /api/listOffer , user: there is no user-offerer that corresponds to the demand , log4js!');
		res.json({status: false,list: ['User was deleted']})
		return
	}
	console.log("start")
	console.log(user[0])
	console.log("end")
	logger.info('Request: /api/listOffer , user: a list of users that corresponds to the demand has been sent to the Client server , log4js!');
	res.json({status: true,list : user})
})




app.listen(1234, () => console.log('Server listening at 1234'))
module.exports = app
