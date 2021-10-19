'use strict';
const fs = require('fs');

fs.writeFileSync('target.txt', 'hello world\n', (err) => {
	if (err) throw err;
	console.log('File saved!');
})