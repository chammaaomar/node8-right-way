'use strict';
const fs = require('fs');
const zmq = require('zeromq');

const responder = zmq.socket('rep');

// A request comes in asking for file contents from the filesystem
responder.on('message', data => {
	const req = JSON.parse(data);
	console.log(`Received request to get path: ${req.path}`)
	fs.readFile(req.path, (err, content) => {
		if (err) {
			return responder.send(JSON.stringify({
				err,
				timestamp: Date.now(),
				pid: process.pid,
			}))
		}
		responder.send(JSON.stringify({
			content: content.toString(),
			timestamp: Date.now(),
			pid: process.pid,
		}))
	})
})

responder.bind('tcp://127.0.0.1:60401', err => {
	if (err) throw err;
	console.log('Listening for filesystem zmq requests...');
})

// to gracefully close connections to requesters
process.on('SIGINT', () => {
	responder.close();
	console.log('Shutting down responder');
})