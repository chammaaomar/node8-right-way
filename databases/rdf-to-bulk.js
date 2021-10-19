'use strict';
const dir = require('node-dir');
const parseRDF = require('./lib/parse-rdf');

const dirname = process.argv[2];

dir.readFiles(dirname, { match: /\.rdf$/, exclude: ['pg0.rdf'] }, (err, content, next) => {
	if (err) throw err;
	const doc = parseRDF(content);
	console.log(JSON.stringify({ index: { _id: `pg${doc.id}` } }));
	console.log(JSON.stringify(doc));
	next();
})