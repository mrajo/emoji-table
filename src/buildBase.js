var os = require('os');
var fs = require('fs');
var path = require('path');

var build = module.exports = {
	dest: path.join(__dirname, '..', 'dist'),
	emoji_data: require('../tmp/emoji_raw.json'),
	parseText: function (text) {
		if (text) {
			return text;
		}
		return '';
	},
	parseTags: function (text) {
		if (text) {
			return text.split(', ');
		}
		return '';
	},
	parseYear: function (text) {
		if (text) {
			return text.match(/\d{4}/)[0];
		}
		return '';
	},
	parseIcon: function (text) {
		if (text && text !== 'missing') {
			return text.match(/src="(.+)"/)[1];
		}
		return '';
	},
	writeCatalog: function (data, output, done) {
		console.log('Writing JSON catalog...');
		var json = JSON.stringify(data, null, 4);
		fs.mkdir(build.dest, function() {
			fs.writeFile(output, json, function(err) {
				if (err) build.handleError(err);
				done();
			});
		});
	},
	handleError: function (err) {
		console.error(err);
		os.exit(1);
	}
};

build.columns = [
	{ index:  1, name: 'code', transform: build.parseText },
	{ index:  2, name: 'char', transform: build.parseText },
	{ index: 13, name: 'name', transform: build.parseText },
	{ index:  5, name: 'icon', transform: build.parseIcon },
	{ index: 14, name: 'year', transform: build.parseYear },
	{ index: 16, name: 'tags', transform: build.parseTags }
];