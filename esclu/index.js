'use strict';

const fs = require('fs');
const request = require('request');
const { program } = require('commander');
const pkg = require('./package.json');

const fullUrl = (path = '') => {
	const opts = program.opts();
	let url = `http://${opts.host}:${opts.port}/`;
	if (opts.index) {
		url += `${opts.index}/`;
	}
	if (opts.type) {
		url += `${opts.type}/`;
	}
	return url + path.replace(/^\/*/, '');
}

const handleResponse = (err, res, body) => {
	const opts = program.opts();
	if (opts.json) {
		console.log(JSON.stringify(err || body));
	}
	else {
		if (err) throw err;
		console.log(body);
	}
}

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-o, --host [hostname]', 'hostname', 'localhost')
	.option('-p, --port [number]', 'port number', '9200')
	.option('-j, --json', 'format output as JSON')
	.option('-i, --index <name>', 'which index to use')
	.option('-t, --type <type>', 'default type for bulk operations');

program
	.command('url [path]')
	.description('generate the URL for the options and the path (default is /)')
	.action((path = '/') => console.log(fullUrl(path)));

program
	.command('get [path]')
	.description('perform an HTTP GET request for path (default is /)')
	.action((path = '/') => {
		const opts = program.opts();
		const httpOpts = {
			url: fullUrl(path),
			json: opts.json,
		};
		request(httpOpts, handleResponse)
	});

program
	.command('create-index')
	.description('create an index')
	.action(() => {
		const opts = program.opts();
		if (!opts.index) {
			const msg = 'No index specified! Use --index <name>';
			if (opts.json) return console.log({ err: msg });
			throw new Error(msg);
		}
		return request.put(fullUrl(), handleResponse);
	});

program
	.command('list-indices')
	.alias('li')
	.description('get a list of indices in this cluster')
	.action(() => {
		const path = program.opts().json ? '_all' : '_cat/indices?v';
		return request({ url: fullUrl(path), json: program.opts().json }, handleResponse);
	})

program.parse(process.argv);