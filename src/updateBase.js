var os = require('os');
var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

// TODO: download this chart as well
// http://www.unicode.org/~scherer/emoji4unicode/snapshot/full.html
var update = module.exports = {
	dest: path.join(__dirname, '..', 'tmp')
};

update.charts = [
	{
		name: 'full',
		url: 'http://www.unicode.org/emoji/charts/full-emoji-list.html',
		html_cache: path.join(update.dest, 'emoji.html'),
		parse_cache: path.join(update.dest, 'emoji_raw.json'),
		parse_columns: [ 0, 1, 2, 5, 13, 14, 16 ]
	},
	{
		name: 'addon',
		url: 'http://www.unicode.org/~scherer/emoji4unicode/snapshot/full.html',
		html_cache: path.join(update.dest, 'addon.html'),
		parse_cache: path.join(update.dest, 'addon_raw.json'),
		parse_columns: [ 1, 6 ]
	}
];

update.downloadCharts = function () {
	update.charts.forEach(function(chart) {
		var tasks = [
			async.apply(update.downloadChart, chart, null),
			update.writeChartCache
		];
		async.waterfall(tasks);
	});
};

update.createParsedCache = function (done) {
	// all charts need to be downloaded and parsed before 'done' is called
	var tasks = [];
	update.charts.forEach(function(chart) {
		tasks.push(function (done) {
			var _chart = chart;
			async.waterfall([
				async.apply(update.readChartCache, _chart),
				update.downloadChart,
				update.writeChartCache,
				update.parseMarkup,
				update.writeParsedCache
			], done);
		});
	});
	async.waterfall(tasks, done);
};

update.downloadChart = function (chart, data, done) {
	if (data == null) {
		console.log('Downloading chart: ' + chart.name + '...');
		request.get(chart.url, function(err, resp, body) {
			if (err || resp.statusCode >= 400) update.handleError(err);
			done(null, chart, body, true);
		});
	} else {
		done(null, chart, data, false);
	}
};

update.readChartCache = function (chart, done) {
	fs.readFile(chart.html_cache, function (err, data) {
		if (!err) {
			console.log('Reading cache: ' + chart.name + '...');
		}
		done(null, chart, data);
	});
};

update.writeChartCache = function (chart, data, downloaded, done) {
	if (downloaded) {
		console.log('Saving copy of chart: ' + chart.name + '...');
		fs.mkdir(update.dest, function() {
			fs.writeFile(chart.html_cache, data, function(err) {
				if (err) update.handleError(err);
				done(null, chart, data);
			});
		});
	} else {
		done(null, chart, data);
	}
};

update.parseMarkup = function (chart, data, done) {
	console.log('Parsing markup: ' + chart.name + '...');
	var $ = cheerio.load(data);
	var rows = $('table tr').slice(1);
	var parsed = rows.map(function(i, row) {
		if ($('td', row).length <= 1) return;
		return $('td', row).map(function(i, cell) {
			if ($(cell).text()) {
				return $(cell).text();
			}
			return $(cell).html();
		});
	}).get();
	done(null, chart, parsed);
};

update.writeParsedCache = function (chart, data, done) {
	console.log('Saving parse: ' + chart.name + '...');
	var json = JSON.stringify(data, chart.parse_columns, 4);
	fs.mkdir(update.dest, function() {
		fs.writeFile(chart.parse_cache, json, function(err) {
			if (err) update.handleError(err);
			done();
		});
	});
};

update.handleError = function (err) {
	console.error(err);
	os.exit(1);
};