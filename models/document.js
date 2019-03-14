const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
	_id			 : mongoose.Schema.Types.ObjectId,
	author		 : { type: String },
	date	 	 : { type: String }
});

const taskSchema = mongoose.Schema({
	_id			  : mongoose.Schema.Types.ObjectId,
	name		  : { type: String },
	author		  : { type: String },
	startDate	  : { type: String },
	endDate		  : { type: String },
	index 		  : { type: Number },
	isDone		  : { type: Boolean, default: false },
	responsibleId : [],
	responsible   : [{
					  type: mongoose.Schema.Types.ObjectId, 
					  ref: 'User', 
					  required: true
					}],
	comments 	 : [commentSchema]
});

const stageSchema = mongoose.Schema({
	_id			  : mongoose.Schema.Types.ObjectId,
	name		  : { type: String, default: 'Крок' },
	author		  : { type: String },
	number 	      : { type: Number },
	startDate	  : { type: String },
	duration	  : { type: Number },
	endDate		  : { type: String },
	index 		  : { type: Number },
	isActive	  : { type: Boolean },
	isDone	  	  : { type: Boolean, default: false },
	responsibleId : [],
	responsible   : [{
					  type: mongoose.Schema.Types.ObjectId, 
					  ref: 'User', 
					  required: true
					}],
	tasks 		 : [taskSchema],
	comments 	 : [commentSchema]
});

const documentSchema = mongoose.Schema({
	_id			 : mongoose.Schema.Types.ObjectId,
	ownerId 	 : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	name		 : { type: String, required: true },
	image 		 : { type: String, default: 'test.img' },
	startDate	 : { type: String, required: true },
	endDate		 : { type: String, required: true },
	isDone	  	 : { type: Boolean, default: false },
	index 		 : { type: Number },
	stages 		 : [stageSchema],
	comments 	 : [commentSchema]
});

module.exports = mongoose.model('Document', documentSchema);