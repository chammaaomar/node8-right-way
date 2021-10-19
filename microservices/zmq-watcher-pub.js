'use strict';
const fs = require('fs');
const zmq = require('zeromq');
const filename = process.argv[2];

const publisher = zmq.socket('pub');

if (!filename) {
	throw new Error('usage: node zmq-watcher-sub.js filename-to-watch');
}

fs.watch(filename, () => {
	// zeromq only handles bytes, we need to serialize and
	// deserialize the object
	// Send a message to any and all subscribers
	publisher.send(JSON.stringify({
		type: 'changed',
		file: filename,
		timestamp: Date.now()
	}));
});

publisher.bind('tcp://*:60400', err => {
	if (err) {
		throw err;
	}
	console.log('Listening for zmq subscribers...');
});