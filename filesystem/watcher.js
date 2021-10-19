'use strict';
const fs = require('fs');

const filename = process.argv[2];
const { spawn } = require('child_process');
if (!filename) {
	throw new Error('Please provide a filename to watch');
}
fs.watch(filename, () => {
	const ls = spawn('ls', ['-l', '-h', filename]);
	let output = '';

	// chunk is a buffer, so this is secretly calling chunk.toString()
	// under the hood
	ls.stdout.on('data', chunk => output += chunk);
	
	ls.stdout.on('close', () => {
		const parts = output.split(/\s+/);
		console.log([parts[0], parts[4], parts[8]]);
	})
});

console.log(`Now watching ${filename} for changes!`);