const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const DocumentIntro = require('../../models/document_intro');
const Document      = require('../../models/document');
const User 			= require('../../models/user');

exports.docs_get = (req, res, next) => {
	const token   = req.cookies.Authorization.split(" ")[1];
	const decoded = jwt.verify(token, 'gvaraNode');
	const userId  = decoded.userId;

	const currentPage = (typeof req.query.page == "undefined") ? 1 : req.query.page;

	// .paginate({ ownerId: userId }, { populate: { path: 'currentStage.responsibleId', select: '_id status name' }, page: currentPage, limit: 3 })

	DocumentIntro
		.paginate({}, { populate: { path: 'currentStage.responsible', select: '_id status name' }, page: currentPage, limit: 3 })
		.then(results => {
			console.log("Result from database", results);

			if (currentPage <= results.pages) {
				if (results) {
					const docs = results.docs.map(result => {
						return {
							_id 		 	: result._id,
							docId        	: result.docId,
							ownerId        	: result.ownerId,
							name 		 	: result.name,
							endDate 	 	: result.endDate,
							isDone			: result.isDone,
							currentStage 	: {
												_id				: result.currentStage._id,
												name 			: result.currentStage.name,
												number 			: result.currentStage.number,
												endDate 		: result.currentStage.endDate,
												responsibleId 	: result.currentStage.responsibleId,
												responsible 	: result.currentStage.responsible
										   	  }
						}
					});
	
					results.docs = docs;
	
					res.status(200).json(results);
				} else {
					res.status(404).json({message: "No valid entry found for this user id"});
				}
			} else {
				res.status(404).json({message: "No valid entry found for provided query"});
			}
			
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
}

exports.doc_get_by_id = (req, res, next) => {
	const id = req.params.id;

	// .select('_id ownerId name image startDate endDate stages')

	Document.findById(id)
		.populate('stages.responsible', '_id status name')
		.populate('stages.tasks.responsible', '_id status name')
		.exec()
		.then(result => {
			console.log("Result from database", result);

			if (result) {
				const stages = result.stages.map(result => {
					const tasks = result.tasks.map(result => {
						return {
							_id				: result._id,
							name			: result.name,
							author		  	: result.author,
							endDate			: result.endDate,
							index 		  	: result.index,
							isDone			: result.isDone,
							responsibleId 	: result.responsibleId,
							responsible 	: result.responsible
						}
					});

					return {
						_id 			: result._id,
						name       		: result.name,
						author		  	: result.author,
						number     		: result.number,
						duration  		: result.duration,
						index 		  	: result.index,
						isActive		: result.isActive,
						isDone			: result.isDone,
						responsibleId 	: result.responsibleId,
						responsible 	: result.responsible,
						current    		: result.current,
						tasks			: tasks
					}
				});

				res.status(200).json({
					_id 		: result._id,
					ownerId 	: result.ownerId,
					name 		: result.name,
					startDate   : result.startDate,
					endDate 	: result.endDate,
					isDone		: result.isDone,
					stages		: stages
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

exports.intro_doc_get_by_id = (req, res, next) => {
	const id = req.params.id;

	DocumentIntro.findOne({$or:[{_id: id}, {docId: id}]})
		.populate('currentStage.responsible', '_id status name')
		.exec()
		.then(result => {
			console.log("Result from database", result);

			if (result) {
				res.status(200).json({
					_id 		 	: result._id,
					docId        	: result.docId,
					ownerId        	: result.ownerId,
					name 		 	: result.name,
					endDate 	 	: result.endDate,
					isDone			: result.isDone,
					currentStage 	: {
										_id				: result.currentStage._id,
										name 			: result.currentStage.name,
										number 			: result.currentStage.number,
										endDate 		: result.currentStage.endDate,
										responsibleId 	: result.currentStage.responsibleId,
										responsible 	: result.currentStage.responsible
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
	const token   = req.cookies.Authorization.split(" ")[1];
	const decoded = jwt.verify(token, 'gvaraNode');
	const userId  = decoded.userId;

	const doc = new Document({
		_id			: new mongoose.Types.ObjectId(),
		ownerId 	: userId,
		name		: req.body.name,
		image 		: req.body.image,
		startDate  	: req.body.startDate,
		endDate 	: req.body.endDate,
		stages     	: {
						_id 			: new mongoose.Types.ObjectId(),
					    name       		: req.body.stage.name,
					    number     		: req.body.stage.number,
					    startDate  		: req.body.stage.startDate,
					    duration  		: req.body.stage.duration,
						endDate   		: req.body.stage.endDate,
						responsibleId 	: userId,
						responsible 	: userId,
						isActive    	: true,
						tasks			: {
							_id				: new mongoose.Types.ObjectId(),
							name			: req.body.stage.task.name,
							endDate			: req.body.stage.task.endDate,
							responsibleId	: userId,
							responsible 	: userId
						}
					  }
	});

	doc.save()
		.then(result => {
			const stages = result.stages.map(result => {
				const tasks = result.tasks.map(result => {
					return {
						_id				: result._id,
						name			: result.name,
						endDate			: result.endDate,
						isDone			: result.isDone,
						responsibleId 	: result.responsibleId
					}
				});

				return {
					_id 			: result._id,
					name       		: result.name,
					number     		: result.number,
					startDate  		: result.startDate,
					duration  		: result.duration,
					endDate   		: result.endDate,
					isActive		: result.isActive,
					isDone			: result.isDone,
					responsibleId 	: result.responsibleId,
					current    		: result.current,
					tasks			: tasks
				}
			});

			const createdDoc = {
				_id 		: result._id,
				ownerId 	: result.ownerId,
				name 		: result.name,
				image 		: result.image,
				startDate   : result.startDate,
				endDate 	: result.endDate,
				isDone		: result.isDone,
				stages		: stages
			}

			const docIntro = new DocumentIntro({
				_id			 	: new mongoose.Types.ObjectId(),
				docId        	: result._id,
				ownerId 	 	: userId,
				name		 	: req.body.name,
				image 		 	: req.body.image,
				startDate    	: req.body.startDate,
				endDate 	 	: req.body.endDate,
				currentStage 	: {
							    	_id        		: result.stages[0]._id,
							    	name       		: req.body.stage.name,
							    	number     		: req.body.stage.number,
							    	startDate 		: req.body.stage.startDate,
							    	duration 		: req.body.stage.duration,
								 	endDate   		: req.body.stage.endDate,
								 	responsibleId 	: userId,
								 	responsible 	: userId
				               	  }
			});

			docIntro.save()
				.then(result => {
					res.status(201).json({
						message: 'Document create success',
						createdDoc: createdDoc,
						createdDoc_intro: {
							_id 		 : result._id,
							docId        : result.docId,
							ownerId 	 : result.ownerId,
							name 		 : result.name,
							image 		 : result.image,
							startDate    : result.startDate,
							endDate 	 : result.endDate,
							isDone		 : result.isDone,
							currentStage : {
								_id        		: result.currentStage._id,
							    name       		: result.currentStage.name,
							    number     		: result.currentStage.number,
							    startDate 		: result.currentStage.startDate,
							    duration 		: result.currentStage.duration,
								endDate   		: result.currentStage.endDate,
								responsibleId 	: result.currentStage.responsibleId
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
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.stage_create = (req, res, next) => {
	const id 	  = req.params.id;
	const token   = req.cookies.Authorization.split(" ")[1];
	const decoded = jwt.verify(token, 'gvaraNode');
	const userId  = decoded.userId;

	const stage = {
		_id           : new mongoose.Types.ObjectId(),
		name          : req.body.name,
		author 		  : userId,
		number        : req.body.number,
		duration      : req.body.duration,
		isActive      : false,
		responsibleId : [userId],
		responsible   : [userId]
	}

	Document.findByIdAndUpdate(id, {$push: {stages: stage}}, {safe: true, upsert: true})
			.exec()
			.then(result => {
				Document.findById(id)
        				.populate('stages.responsible', '_id status name')
						.exec()
						.then(result => {
							const stages = result.stages.map(result => {
								const tasks = result.tasks.map(result => {
									return {
										_id				: result._id,
										name			: result.name,
										author       	: result.author,
										endDate			: result.endDate,
										isDone			: result.isDone,
										responsibleId 	: result.responsibleId,
										responsible 	: result.responsible
									}
								});
				
								return {
									_id 			: result._id,
									name       		: result.name,
									author       	: result.author,
									number     		: result.number,
									duration  		: result.duration,
									isActive		: result.isActive,
									isDone			: result.isDone,
									responsibleId 	: result.responsibleId,
									responsible 	: result.responsible,
									current    		: result.current,
									tasks			: tasks
								}
							});
				
							res.status(201).json(stages);
				
							//res.status(200).json(result);
				
							// strange work
							// Document.findOneAndUpdate(
							// 	{'stages._id': newId}, 
							// 	{stages:{$elemMatch:{_id: newId}}},
							// 	{$inc: {number: 1}})
							// 		.exec()
							// 		.then(result => {
							// 			res.status(200).json(result);
							// 		})
				
							// work!!!
							// Document.findOneAndUpdate( 
							// 	{"_id": id, "stages._id": stage._id},
							// 	{$inc: {'stages.$.number': 1}})
							// 		.exec()
							// 		.then(result => {
							// 			res.status(200).json(result);
							// 		})
						})
						.catch(err => {
							console.log(err);
						
							res.status(500).json({
								error: err
							});
						});
			})
			.catch(err => {
				console.log(err);
						
				res.status(500).json({
					error: err
				});
			});
}

exports.task_create = (req, res, next) => {
	const id 	  = req.params.id;
	const token   = req.cookies.Authorization.split(" ")[1];
	const decoded = jwt.verify(token, 'gvaraNode');
	const userId  = decoded.userId;

	const task = {
		_id           : new mongoose.Types.ObjectId(),
		name          : req.body.name,
		author 		  : userId,
		responsibleId : [userId],
		responsible   : [userId]
	}

	Document.findOneAndUpdate( 
		{'_id': id, 'stages._id': req.body.stageId},
		{$push: {'stages.$.tasks': task}})
			.exec()
			.then(result => {
				Document.find(
					{'stages._id': req.body.stageId},
					{stages: {$elemMatch: {_id: req.body.stageId}}})
						.populate('stages.tasks.responsible', '_id status name')
						.exec()
						.then(result => {
							const tasks = result[0].stages[0].tasks.map(result => {
								return {
									_id				: result._id,
									name			: result.name,
									author			: result.author,
									isDone			: result.isDone,
									responsibleId 	: result.responsibleId,
									responsible 	: result.responsible
								}
							});

							res.status(201).json(tasks);
						})
						.catch(err => {
							console.log(err);
						
							res.status(500).json({
								error: err
							});
						});
			})
			.catch(err => {
				console.log(err);
			
				res.status(500).json({
					error: err
				});
			});
}

exports.stage_done = (req, res, next) => {
	const id = req.params.id;
	
	Document.update(
		{'_id': id, 'stages._id': req.body.stageId}, 
		{$set: {'stages.$.isDone': true}})
			.exec()
			.then(result => {
				Document.findById(id)
        				.populate('stages.responsible', '_id status name')
						.exec()
						.then(result => {
							const stages = result.stages.map(result => {
								const tasks = result.tasks.map(result => {
									return {
										_id				: result._id,
										name			: result.name,
										author       	: result.author,
										endDate			: result.endDate,
										isDone			: result.isDone,
										responsibleId 	: result.responsibleId,
										responsible 	: result.responsible
									}
								});
				
								return {
									_id 			: result._id,
									name       		: result.name,
									author       	: result.author,
									number     		: result.number,
									duration  		: result.duration,
									isActive		: result.isActive,
									isDone			: result.isDone,
									responsibleId 	: result.responsibleId,
									responsible 	: result.responsible,
									current    		: result.current,
									tasks			: tasks
								}
							});
				
							res.status(201).json(stages);
						})
						.catch(err => {
							console.log(err);
						
							res.status(500).json({
								error: err
							});
						});
			})
			.catch(err => {
				console.log(err);
						
				res.status(500).json({
					error: err
				});
			});
}

exports.stage_update_multiselect = (req, res, next) => {
	const id = req.params.id;
	const updateOps = [];

	for (const ops of req.body.id) {
		updateOps.push(ops);
	}

	// for (const ops of req.body) {
	// 	updateOps[ops.propName] = ops.value;
	// }

	promise = new Promise((resolve, reject) => {
		updateOps.forEach(function(id, i, array) {
				Document.update(
					{'stages._id': id}, 
					{'stages.$.duration': req.body.duration, 
					 'stages.$.responsibleId': req.body.responsibleId,
					 'stages.$.responsible': req.body.responsibleId})
						.exec()
						.then(result => {
							if (i === array.length - 1) { 
       							resolve();
   							}
						})
						.catch(err => {
							console.log(err);
			
							res.status(500).json({
								error: err
							});
						});
		});
	});

	promise
		.then(result => {
			Document.findById(id)
        			.populate('stages.responsible', '_id status name')
					.exec()
					.then(result => {
						const stages = result.stages.map(result => {
							const tasks = result.tasks.map(result => {
								return {
									_id				: result._id,
									name			: result.name,
									author			: result.author,
									endDate			: result.endDate,
									index 			: result.index,
									isDone			: result.isDone,
									responsibleId 	: result.responsibleId,
									responsible 	: result.responsible
								}
							});
			
							return {
								_id 			: result._id,
								name       		: result.name,
								author			: result.author,
								number     		: result.number,
								duration  		: result.duration,
								index 			: result.index,
								isActive		: result.isActive,
								isDone			: result.isDone,
								responsibleId 	: result.responsibleId,
								responsible 	: result.responsible,
								current    		: result.current,
								tasks			: tasks
							}
						});
			
						res.status(200).json(stages);
					})
					.catch(err => {
						console.log(err);
					
						res.status(500).json({
							error: err
						});
					});
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.stage_change_position = (req, res, next) => {
	const id = req.params.id;
	var increment, endLoopIndex, loopIndex, setIndex;

	if (req.body.newIndex < req.body.oldIndex) {
		endLoopIndex = req.body.oldIndex;
		loopIndex    = req.body.newIndex;
		setIndex     = req.body.newIndex;
		increment    = 1;
	} else {
		endLoopIndex = req.body.newIndex + 1;
		loopIndex    = req.body.oldIndex;
		setIndex     = req.body.newIndex;
		increment    = -1;
	}

	promise = new Promise((resolve, reject) => {
		function asyncLoop(i) {
		    if (i < endLoopIndex) {
		    	Document.update(
					{'_id': id, 'stages.index': i},
					{$inc: {'stages.$.index': increment}})
						.exec()
						.then(result => {
		            		asyncLoop(i+1);
						})
						.catch(err => {
							console.log(err);
				
							res.status(500).json({
								error: err
							});
						});
		    } else {
		        resolve();
		    }
		}

		asyncLoop(loopIndex);
	});

	promise
	 	.then(result => {
			Document.update( 
				{'_id': id, 'stages._id': req.body.stageId},
				{$set: {'stages.$.index': setIndex}})
					.exec()
					.then(result => {
						Document.findById(id)
        					.populate('stages.responsible', '_id status name')
							.exec()
							.then(result => {
								const stages = result.stages.map(result => {
									const tasks = result.tasks.map(result => {
										return {
											_id				: result._id,
											name			: result.name,
											author       	: result.author,
											endDate			: result.endDate,
											index 			: result.index,
											isDone			: result.isDone,
											responsibleId 	: result.responsibleId,
											responsible 	: result.responsible
										}
									});
					
									return {
										_id 			: result._id,
										name       		: result.name,
										author       	: result.author,
										number     		: result.number,
										duration  		: result.duration,
										index 			: result.index,
										isActive		: result.isActive,
										isDone			: result.isDone,
										responsibleId 	: result.responsibleId,
										responsible 	: result.responsible,
										current    		: result.current,
										tasks			: tasks
									}
								});
	
								stages.sort(function(a, b) {
								  	return +(a.index > b.index) || +(a.index === b.index) - 1;
								});
					
								res.status(200).json(stages);
							})
							.catch(err => {
								console.log(err);
							
								res.status(500).json({
									error: err
								});
							});
					})
					.catch(err => {
						console.log(err);
					
						res.status(500).json({
							error: err
						});
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

	Document.remove({_id: id})
		.exec()
		.then(result => {
			DocumentIntro.remove({docId: id})
				.exec()
				.then(result => {
					res.status(200).json({
						message: 'Document deleted'
					});
				})
				.catch(err => {
					console.log(err);
		
					res.status(500).json({
						error: err
					});
				});
		})
		.catch(err => {
			console.log(err);

			res.status(500).json({
				error: err
			});
		});
}

exports.stage_delete_by_id = (req, res, next) => {
	const id = req.params.id;

	Document.update(
			{_id: id},
			{$pull: {stages: {_id: req.body.stageId}}},
			{safe: true})
				.exec()
				.then(result => {
					if (result.nModified) {
						Document.findById(id)
        						.populate('stages.responsible', '_id status name')
								.exec()
								.then(result => {
									const stages = result.stages.map(result => {
										const tasks = result.tasks.map(result => {
											return {
												_id				: result._id,
												name			: result.name,
												author			: result.author,
												endDate			: result.endDate,
												isDone			: result.isDone,
												responsibleId 	: result.responsibleId,
												responsible 	: result.responsible
											}
										});
						
										return {
											_id 			: result._id,
											name       		: result.name,
											author			: result.author,
											number     		: result.number,
											duration  		: result.duration,
											isActive		: result.isActive,
											isDone			: result.isDone,
											responsibleId 	: result.responsibleId,
											responsible 	: result.responsible,
											current    		: result.current,
											tasks			: tasks
										}
									});
						
									res.status(200).json(stages);
								})
								.catch(err => {
									console.log(err);
								
									res.status(500).json({
										error: err
									});
								});
					} else {
						res.status(200).json({
							message: 'Stage not deleted'
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

exports.task_delete_by_id = (req, res, next) => {
	const id = req.params.id;

	Document.update( 
			{'_id': id, 'stages.tasks._id': req.body.taskId},
			{$pull: {'stages.$.tasks': {_id: req.body.taskId}}},
			{safe: true})
				.exec()
				.then(result => {
					if (result.nModified) {
						Document.find(
							{'stages._id': req.body.stageId},
							{'stages': {$elemMatch: {_id: req.body.stageId}}})
								.populate('stages.tasks.responsible', '_id status name')
								.exec()
								.then(result => {
									const tasks = result[0].stages[0].tasks.map(result => {
										return {
											_id				: result._id,
											name			: result.name,
											author			: result.author,
											endDate			: result.endDate,
											isDone			: result.isDone,
											responsibleId 	: result.responsibleId,
											responsible 	: result.responsible
										}
									});
		
									res.status(200).json(tasks);
								})
								.catch(err => {
									console.log(err);
								
									res.status(500).json({
										error: err
									});
								});
					} else {
						res.status(200).json({
							message: 'Task not deleted'
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
