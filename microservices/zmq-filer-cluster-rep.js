'use strict';
const fs = require('fs');
const cluster = require('cluster');
const zmq = require('zeromq');

const numWorkers = require('os').cpus().length;

if (cluster.isMaster) {
	const router = zmq.socket('router').bind('tcp://127.0.0.1:60401');
	const dealer = zmq.socket('dealer').bind('ipc://filer-dealer.ipc');

	router.on('message', (...frames) => dealer.send(frames));
	dealer.on('message', (...frames) => router.send(frames));

	cluster.on('online', worker => {
		console.log(`Worker ${worker.process.pid} is online`);
	})

	for (let i = 0; i < numWorkers; i++) {
		cluster.fork();
	}
} else {
	// workers; these handle the actual work and communicate with the
	// dealer through IPC which is backed by UNIX socket
	const responder = zmq.socket('rep').connect('ipc://filer-dealer.ipc');

	responder.on('message', data => {
		const req = JSON.parse(data);
		console.log(`${process.pid}: Processing request for: ${req.path}`);
		fs.readFile(req.path, (err, content) => {
			if (err) {
				return responder.send(JSON.stringify({
					err,
					timestamp: Date.now(),
					pid: process.pid,
				}))
			}
			return responder.send(JSON.stringify({
				content: content.toString(),
				timestamp: Date.now(),
				pid: process.pid,
			}))
		})
	})
}