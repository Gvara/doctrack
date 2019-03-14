const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');

const User = require('../../models/user');

exports.user_singnup = (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then(result => {
			if (result.length >= 1) {
				return res.status(409).json({
					message: 'Mail exists'
				});
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err
						});
					} else {
						const user = new User({
							_id			: new mongoose.Types.ObjectId(),
							name		: req.body.name,
							email		: req.body.email,
							password	: hash,
							age			: req.body.age
						});

						user.save()
							.then(result => {
								console.log(result);

								res.status(201).json({
									message: 'User create success',
									createdUser: {
										name	: result.name,
										email	: req.body.email,
										age		: result.age,
										_id		: result._id,
										request	: {
											type: 'GET',
											url : req.protocol + '://' + req.get('host') + req.originalUrl + result._id
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
				});
			}
		});
}

exports.user_login = (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then(user => {
			if (user.length < 1) {
				return res.status(401).json({
					authCode : false,
					message  : 'Auth failed'
				});
			} else {
				bcrypt.compare(req.body.password, user[0].password, (err, result) => {
					if (err) {
						return res.status(401).json({
							authCode : false,
							message  : 'Auth failed',
						});
					}

					if (result) {
						var token = jwt.sign(
							{
								email	: user[0].email,
								userId 	: user[0]._id
							}, 'gvaraNode',
							{
								expiresIn: '12h'
							}
						);

						var bearer = "Bearer ";
						token = bearer.concat(token);

						res.cookie('Authorization', token);
						//res.setHeader('Authorization', token);

						return res.status(200).json({
							authCode : true,
							message  : 'Auth successful',
							token	 : token
						});
					}

					res.status(401).json({
						authCode : false,
						message  : 'Auth failed'
					});
				});
			}
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.user_check_token = (req, res, next) => {
	try {
		const token = req.cookies.Authorization.split(" ")[1];

		console.log(req.cookies);

		const decoded = jwt.verify(token, 'gvaraNode');
		req.userData = decoded;
		
		return res.status(200).json({
			authCode : true
		});
	} catch (error) {
		console.log("error -", error);

		return res.status(401).json({
			authCode : false,
			message  : 'Auth failed',
			err      : error
		});
	}
};
