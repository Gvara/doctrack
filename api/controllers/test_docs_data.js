const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');
const io  		= require('../../server');
const checkAuth = require('../middleware/check-auth');
//const webpack   = require('webpack');
//const webpackDevMiddleware = require('webpack-dev-middleware');
//const webpackConfig = require('./webpack.config.js');

const Document = require('../../models/test_doc');

exports.docs_get_onload = (req, res, next) => {
	const currentPage = (typeof req.query.page == "undefined") ? 1 : req.query.page;

  	Document.paginate({}, { select: '_id name startDate endDate', page: currentPage, limit: 6 })
		.then(results => {
			if (currentPage <= results.pages) {
				const docs = results.docs.map(result => {
					return {
						_id			: result._id,
						name		: result.name,
						startDate   : result.startDate,
						endDate     : result.endDate,
						request		: {
							type: 'GET',
							url:  req.protocol + '://' + req.get('host') + req.originalUrl + result._id
						}
					}
				});

				results.docs = docs;

				res.status(200).json(results);
			} else {
				res.status(404).json({message: "No valid entry found for provided query"});
			}
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.docs_get_page = (req, res, next) => {
	console.log(req.query);
	res.status(200).json('1');
}

exports.doc_get_by_id = (req, res, next) => {
	const id = req.params.id;

	Document.findById(id)
		.select('_id name startDate endDate')
		.exec()
		.then(result => {
			console.log("Result from database", result);

			if (result) {
				res.status(200).json({
					_id			: result._id,
					name		: result.name,
					startDate   : result.startDate,
					endDate     : result.endDate,
					request: {
						type: 'GET',
						description: 'GET_ALL_DOCUMENTS',
						url:  req.protocol + '://' + req.get('host') + req.originalUrl.slice(0, req.originalUrl.lastIndexOf('/'))
					}
				});
			} else {
				res.status(404).json({message: "No valid entry found for provided ID"});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
}

exports.doc_create = (req, res, next) => {
	const doc = new Document({
		_id			: new mongoose.Types.ObjectId(),
		name		: req.body.name,
		startDate   : req.body.startDate,
		endDate 	: req.body.endDate
	});
	/*
	io.sockets.emit('chat message', {   _id 		: new mongoose.Types.ObjectId(), 
										name 		: req.body.name, 
										startDate   : req.body.startDate,
										endDate 	: req.body.endDate});
	*/

	doc.save()
		.then(result => {
			console.log(result);

			res.status(201).json({
				message: 'Document create success',
				createdDoc: {
					name 		: result.name,
					startDate   : req.body.startDate,
					endDate 	: req.body.endDate,
					_id 		: result._id,
					request: {
						type: 'GET',
						url: req.protocol + '://' + req.get('host') + req.originalUrl + result._id
					}
				}
			});
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.doc_delete_by_id = (req, res, next) => {
	const id = req.params.id;

	Document.remove({ _id: id })
		.exec()
		.then(result => {
			res.status(200).json({
				message: 'Doc deleted',
				request: {
					type: 'POST',
					url:  req.protocol + '://' + req.get('host') + req.originalUrl.slice(0, req.originalUrl.lastIndexOf('/')),
					body: { name: 'String', age: 'Number' }
				}
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
}

/*
io.on('connection', function (socket) {
	console.log('connection -', socket);
});
*/
