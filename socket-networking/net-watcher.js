#!/usr/bin/env node
'use strict';
const fs = require('fs');
const net = require('net');
const filename = process.argv[2];

if (!filename) {
	throw new Error('Error: filename is required');
}

net.createServer(connection => {
	// Info
	console.log('Subscriber connected');
	connection.write(JSON.stringify({ type: 'watching', file: filename }) + '\n');

	// set up
	const watcher = fs.watch(filename, () => connection.write(
		JSON.stringify({ type: 'changed', timestamp: Date.now() }) + '\n'
	));

	// clean up
	connection.on('close', () => {
		console.log('Subscriber disconnected');
		watcher.close();
	})
// can create a UNIX socket:
// listen('/tmp/watcher.sock', () => 'Listening on unix socket at /tmp/watcher.sock');
}).listen(60_300, () => 'Listening on unix socket at localhost:60300');