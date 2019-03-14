const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const testDocSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
	name		: { type: String, required: true },
	startDate	: { type: Date, required: true },
	endDate		: { type: Date, required: true }
});

testDocSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('TestDocs', testDocSchema);