#!/usr/bin/env nodejs
/*
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(9085, 'localhost');
console.log('Server running at http://localhost:9085/');
*/

const http   = require('http');
const app    = require('./app');
const server = http.createServer(app);
const io     = require('socket.io')(server);
const port   = process.env.port || 9085;

module.exports = io;

/*
app.get('/app/', function (req, res) {
	if (req.params.id == 'client.js') {
		res.sendFile(path.join(__dirname, 'client.js'));
	}
	else if (req.params.id == 'favicon.ico') {
		res.sendStatus(404); 
	}
	else {
		//users.push(req.params.id);
		res.sendFile(path.join(__dirname, '../api.html'));
	}
});
*/

io.on('connection', socket => {
  	socket.on('message', body => {
  		console.log(body);

		socket.broadcast.emit('message', {body});
  	});
});

server.listen(port);