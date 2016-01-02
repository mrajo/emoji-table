var os = require('os');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var dest = path.join(__dirname, '..', 'tmp');
var cache_chart = path.join(dest, 'emoji.html');
var cache_parse = path.join(dest, 'emoji_raw.json');

createParsedCache();

function createParsedCache() {
	var data = readCache();
	var parsed = parseMarkup(data);
	writeCachedFile(parsed);
}

function readCache() {
	console.log('Reading cached emoji data file...');
	return fs.readFileSync(cache_chart);
}

function parseMarkup(body) {
	console.log('Parsing markup...');
	var $ = cheerio.load(body);
	var rows = $('table tr td').parents().slice(1);
	return rows.map(function(i, row) {
		return $(row).find('td').map(function(i, cell) {
			if ($(cell).text()) {
				return $(cell).text();
			}
			return $(cell).html();
		});
	}).get();
}

function writeCachedFile(data) {
	console.log('Saving parsed emoji data...');
	var json = JSON.stringify(data, [ 0, 1, 2, 5, 13, 14, 16 ], 4);
	fs.mkdir(dest, function() {
		fs.writeFile(cache_parse, json, function(err) {
			if (err) handleError(err);
		});
	});
}

function handleError(err) {
	console.error(err);
	os.exit(1);
}