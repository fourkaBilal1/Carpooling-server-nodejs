const mongoose = require('mongoose')
const dateFormat = require('dateformat');

const CarSchema = new mongoose.Schema({
	carDescri: String,
	carPlaces: String,
	carMat : String
})

const DemandSchema = new mongoose.Schema({
	From: String,
	To: String,
	DateSys : {type : Date , default: new Date() },
	Etat : {type: String , default: "untreated"},
	DateDem : {type : Date , default: new Date() },
	NbPlaces : Number
})
const NotificationSchema = new mongoose.Schema({
	Description: String,
	TimeOfNotification : {type : Date , default: new Date() },
	Seen: Boolean,
	Type : {type: String , default: "unclassified"},
	Responded : Boolean,
	Important : Boolean,
	idConcerned : String
})
const OfferSchema = new mongoose.Schema({
	From: String,
	To: String,
	DateSys : {type : Date , default: new Date() },
	Etat : {type: String , default: "progress"},
	DateOffer : {type : Date , default: new Date() },
	DMY : {type : String /*, default: dateFormat(new Date(), "yyyy-mm-dd")*/ }  ,
	NbPlaces : Number,
	RsPlaces: Number,
	Prix : Number 
})

const UserSchema = new mongoose.Schema({
	email : String,
	password : String,
	nom : String,
	prenom : String,
	age : String,
	tel : String,
	sexe : String,
	connection: Boolean,
	cars: { type: [CarSchema] , default: []},
	demands: { type: [DemandSchema] , default: []},
	offers: { type: [OfferSchema] , default: []},
	notifications: {type:[NotificationSchema], default: []}
}) 


console.log('i m here')
const User = mongoose.model('user',UserSchema)


module.exports = User
