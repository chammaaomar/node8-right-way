'use strict';
const net = require('net');
const netClient = net.connect({ port: 60300 });
const ldjClient = require('./lib/ldj-client').connect(netClient);

ldjClient.on('message', msg => {
	if (msg.type == 'watching') {
		console.log(`Now watching: ${msg.file}`);
		return;
	}

	if (msg.type == 'changed') {
		const date = new Date(msg.timestamp);
		console.log(`File changed: ${date}`);
		return;
	}

	console.log(`Unrecognized message type: ${msg.type}`);
});