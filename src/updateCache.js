var os = require('os');
var fs = require('fs');
var path = require('path');
var request = require('request');

var url = 'http://www.unicode.org/emoji/charts/full-emoji-list.html';
var dest = path.join(__dirname, '..', 'tmp');
var cache_file = path.join(dest, 'emoji.html');

downloadChart();

function downloadChart() {
	console.log('Downloading the emoji chart...');
	request.get(url, function(err, resp, body) {
		if (err || resp.statusCode >= 400) handleError(err);
		writeCachedFile(body);
	});
}

function writeCachedFile(data) {
	console.log('Saving copy of emoji list...');
	fs.mkdir(dest, function() {
		fs.writeFile(cache_file, data, function(err) {
			if (err) handleError(err);
		});
	});
}

function handleError(err) {
	console.error(err);
	os.exit(1);
}