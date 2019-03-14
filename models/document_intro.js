const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const document_introSchema = mongoose.Schema({
	_id			 : mongoose.Schema.Types.ObjectId,
	docId        : { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
	ownerId 	 : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	name		 : { type: String, required: true },
	image 		 : { type: String, default: 'test_intro.img' },
	startDate	 : { type: String, required: true },
	endDate		 : { type: String, required: true },
	isDone	  	 : { type: Boolean, default: false },
	currentStage : { 
				     _id  		   : { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
				     name 		   : { type: String, default: 'test_stage' },
				     number 	   : { type: String },
				     startDate	   : { type: String },
				     duration	   : { type: Number },
					 endDate	   : { type: String },
					 responsibleId : [],
					 responsible : [{
					 				    type: mongoose.Schema.Types.ObjectId, 
					 				    ref: 'User', 
					 				    required: true
					 				  }]
				   }
});

document_introSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Document_intro', document_introSchema);