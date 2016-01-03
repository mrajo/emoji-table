var os = require('os');
var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var update = module.exports = {
	dest: path.join(__dirname, '..', 'tmp'),
	chart_url: 'http://www.unicode.org/emoji/charts/full-emoji-list.html'
};

update.chart_cache = path.join(update.dest, 'emoji.html');
update.parse_cache = path.join(update.dest, 'emoji_raw.json');

update.downloadChart = function (data, done) {
	if (data == null) {
		console.log('Downloading the emoji chart...');
		request.get(update.chart_url, function(err, resp, body) {
			if (err || resp.statusCode >= 400) update.handleError(err);
			done(null, body);
		});
	} else {
		done(null, data);
	}
};

update.createParsedCache = function (done) {
	var tasks = [
		update.readChartCache,
		update.downloadChart,
		update.writeChartCache,
		update.parseMarkup,
		update.writeParsedCache
	];
	async.waterfall(tasks, done);
};

update.readChartCache = function (done) {
	fs.readFile(update.chart_cache, function (err, data) {
		if (!err) {
			console.log('Reading cached emoji data file...');
		}
		done(null, data);
	});
};

update.parseMarkup = function (body, done) {
	console.log('Parsing markup...');
	var $ = cheerio.load(body);
	var rows = $('table tr td').parents().slice(1);
	var parsed = rows.map(function(i, row) {
			return $(row).find('td').map(function(i, cell) {
				if ($(cell).text()) {
					return $(cell).text();
				}
				return $(cell).html();
			});
		}).get();
	done(null, parsed);
};

update.writeChartCache = function (data, done) {
	if (data != null) {
		console.log('Saving copy of emoji chart...');
		fs.mkdir(update.dest, function() {
			fs.writeFile(update.chart_cache, data, function(err) {
				if (err) update.handleError(err);
				done(null, data);
			});
		});
	} else {
		done(null, data);
	}
};

update.writeParsedCache = function (data, done) {
	console.log('Saving parsed emoji data...');
	var json = JSON.stringify(data, [ 0, 1, 2, 5, 13, 14, 16 ], 4);
	fs.mkdir(update.dest, function() {
		fs.writeFile(update.parse_cache, json, function(err) {
			if (err) update.handleError(err);
			done();
		});
	});
};

update.handleError = function (err) {
	console.error(err);
	os.exit(1);
};