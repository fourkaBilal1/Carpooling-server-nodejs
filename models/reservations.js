const mongoose = require('mongoose')


const ReservationSchema = new mongoose.Schema({
	emailOffer : String,
	emailDemand : String,
	idOffer : String,
	idDemand : String,
	DateSys : {type : Date , default: new Date() },
	Etat : {type: String , default: "waiting"},
	NbPlaces : Number
}) 


const Reserve = mongoose.model('reservation',ReservationSchema)


module.exports = Reserve
