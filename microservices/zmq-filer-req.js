'use strict';
const zmq = require('zeromq');
const filename = process.argv[2];

if (!filename) {
	throw new Error('usage: node zmq-filer-req.js path/to/file');
}

const requester = zmq.socket('req');

requester.on('message', data => {
	const res = JSON.parse(data);
	if (res.err) {
		return console.error('Received error:', res.err);
	}
	console.log('Received response:', res);
});

requester.connect('tcp://localhost:60401');
console.log(`Sending request for filename: ${filename}`)
for (let i = 0; i < 15; i++) {
	requester.send(JSON.stringify({
		path: filename,
	}));
}