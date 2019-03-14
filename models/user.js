const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
	email		: { 
					type: String, 
					required: true, 
					match:  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
				  },
	password	: { type: String, required: true },
	status		: { type: Boolean, default: true, required: true },
	privileges	: [],
	contact 	: {
					name 		: { type: String, required: true },
					lastname 	: { type: String },
					position 	: { type: String },
					phone 		: { type: Number }
				  },
	deputies	: [{
				     type: mongoose.Schema.Types.ObjectId, 
				     ref: 'User', 
				     required: true
				  }]
});

module.exports = mongoose.model('User', userSchema);