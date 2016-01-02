var os = require('os');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var cache_file = path.join('tmp', 'emoji.html');
var dest = path.join(__dirname, '..', 'dist');
var catalog = path.join(dest, 'emoji.json');

var columns = [
	{ index:  1, name: 'code', transform: parseText },
	{ index:  2, name: 'char', transform: parseText },
	{ index: 13, name: 'name', transform: parseText },
	{ index:  5, name: 'icon', transform: parseIcon },
	{ index: 14, name: 'year', transform: parseYear },
	{ index: 16, name: 'tags', transform: parseTags }
];

createCatalog();

function createCatalog(done) {
	var data = readCache();
	var rows = parseMarkup(data);
	var emoji = transcribeEmoji(rows);
	writeCatalog(emoji, function() {
		console.log(emoji.length + ' entries written to ' + catalog);
	});
}

function readCache(done) {
	console.log('Reading cached emoji data file...');
	return fs.readFileSync(cache_file);
}

function parseMarkup(body) {
	console.log('Parsing the markup...');
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

function transcribeEmoji(rows) {
	console.log('Transcribing emoji details...');
	return rows.map(function(cells) {
		var spec = {};
		columns.forEach(function(col) {
			var cell = cells[col.index];
			spec[col.name] = col.transform(cell);
		});
		return spec;
	});
}

function parseText(text) {
	if (text) {
		return text;
	}
	return '';
}

function parseTags(text) {
	if (text) {
		return text.split(', ');
	}
	return '';
}

function parseYear(text) {
	if (text) {
		return text.match(/\d{4}/)[0];
	}
	return '';
}

function parseIcon(text) {
	if (text && text !== 'missing') {
		return text.match(/src="(.+)"/)[1];
	}
	return '';
}

function writeCatalog(data, done) {
	console.log('Writing JSON catalog...');
	var json = JSON.stringify(data, null, 4);
	fs.mkdir(dest, function() {
		fs.writeFile(catalog, json, function(err) {
			if (err) handleError(err);
			done();
		});
	});
}

function handleError(err) {
	console.error(err);
	os.exit(1);
}