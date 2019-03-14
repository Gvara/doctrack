const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const User = require('../../models/user');

exports.users_get_all = (req, res, next) => {
	User.find()
		.select('_id name email status')
		.exec()
		.then(results => {
			console.log("Results from database", results);

			const response = {
				count: results.length,
				users: results.map(result => {
					return {
						_id		: result._id,
						login	: result.email,
						name	: result.name,
						status  : result.status,
						request	: {
							type: 'GET',
							url:  req.protocol + '://' + req.get('host') + req.originalUrl + result._id
						}
					}
				})
			};

			res.status(200).json(response);
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.user_get_by_id = (req, res, next) => {
	const id = req.params.id;

	User.findById(id)
		.select('_id name email status')
		.exec()
		.then(result => {
			console.log("Result from database", result);

			if (result) {
				res.status(200).json({
					user: result,
					request: {
						type: 'GET',
						description: 'GET_ALL_USERS',
						url:  req.protocol + '://' + req.get('host') + req.originalUrl.slice(0, req.originalUrl.lastIndexOf('/'))
					}
				});
			} else {
				res.status(404).json({message: "No valid entry found for provided ID"})
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
}

exports.user_delete_by_id = (req, res, next) => {
	const id = req.params.id;

	User.remove({ _id: id })
		.exec()
		.then(result => {
			res.status(200).json({
				message: 'User deleted',
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
