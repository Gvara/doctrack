const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');

const auth = require('./api/routes/auth');
const users = require('./api/routes/users');
const documents = require('./api/routes/documents');

//console.log(process.env.NODE_MONGO_CONNECT);
//console.log(process.env.PATH);

//console.log(mongoose.connection.readyState);

const options = {
	user: process.env.NODE_MONGO_USR,
	pass: process.env.NODE_MONGO_PWD
};

mongoose.connect(process.env.NODE_MONGO_CONNECT, options);
mongoose.Promise = global.Promise;

// In middleware
/*
app.use(function (req, res, next) {

  // action after response
  var afterResponse = function() {
   logger.info({req: req}, "End request");

    // any other clean ups
    mongoose.connection.close(function () {
      console.log('Mongoose connection disconnected');
    });
  }
  
  // hooks to execute after response
  res.on('finish', afterResponse);
  res.on('close', afterResponse);

  // do more stuff

  next();
});
*/

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Access, Authorization"
	);

	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE');
		
		return res.status(200).json({});
	}

	next();
});

app.disable('x-powered-by');

app.use('/api/', auth);
app.use('/api/users', users);
app.use('/api/docs', documents);

// Routes which should handle requests
app.use((req, res, next) => {
	const error = new Error('Not found');

	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

module.exports = app;