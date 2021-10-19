'use strict';
const assert = require('assert');
const { EventEmitter } = require('events');
const LDJClient = require('../lib/ldj-client');

describe('LDJClient', () => {
	let stream = null;
	let client = null;

	beforeEach(() => {
		stream = new EventEmitter();
		client = LDJClient.connect(stream);
	})

	it('Should emit a message event from a single data event', done => {
		client.on('message', msg => {
			assert.deepStrictEqual(msg, { foo: 'bar' });
			done();
		})
		stream.emit('data', '{ "foo": "bar" }\n');
	})

	it('Should emit a message event from a message split over multiple data events', done => {
		client.on('message', msg => {
			assert.deepStrictEqual(msg, { bar: 'baz' });
			done();
		})
		// simulate a behaviour where the message boundary doesn't line up
		// with the data / chunk boundary
		const firstChunk = '{ "bar';
		const secondChunk = '": "baz" }\n';

		stream.emit('data', firstChunk);
		process.nextTick(() => stream.emit('data', secondChunk));
	})
});