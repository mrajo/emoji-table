var os = require('os');
var fs = require('fs');
var path = require('path');
var update = require('./updateBase');

var build = module.exports = {
	dest: path.join(__dirname, '..', 'dist')
};

var emoji_cache = '../tmp/emoji_raw.json';
var addon_cache = '../tmp/addon.json';

build.parseText = function (text) {
	if (text) {
		return text;
	}
	return '';
};

build.parseTags = function (text) {
	if (text) {
		return text.split(', ');
	}
	return '';
};

build.parseYear = function (text) {
	if (text) {
		return text.match(/\d{4}/)[0];
	}
	return '';
};

build.parseIcon = function (text) {
	if (text && text !== 'missing') {
		return text.match(/src="(.+)"/)[1];
	}
	return '';
};

build.parseAddonCode = function (text) {
	var code = text.match(/U\+[0-9A-Z]+( U\+[0-9A-Z]+)?/);
	if (code) {
		return code[0];
	}
	return '';
}

build.writeCatalog = function (data, output, done) {
	console.log('Writing JSON catalog...');
	var json = JSON.stringify(data, null, 4);
	fs.mkdir(build.dest, function() {
		fs.writeFile(output, json, function(err) {
			if (err) build.handleError(err);
			done();
		});
	});
};

build.handleError = function (err) {
	console.error(err);
	os.exit(1);
};

build.columns = [
	{ index:  1, name: 'code', transform: build.parseText },
	{ index:  2, name: 'char', transform: build.parseText },
	{ index: 13, name: 'name', transform: build.parseText },
	{ index:  5, name: 'icon', transform: build.parseIcon },
	{ index: 14, name: 'year', transform: build.parseYear },
	{ index: 16, name: 'tags', transform: build.parseTags }
];

build.loadEmoji = function (done) {
	try {
		build.emoji_data = require(emoji_cache);
		build.addon_data = require(addon_cache);
		done();
	} catch (e) {
		update.createParsedCache(function () {
			build.addonData(function () {
				build.emoji_data = require(emoji_cache);
				build.addon_data = require(addon_cache);
				done();	
			});
		});
	}
};

build.addonData = function (done) {
	var raw = require(path.join(update.dest, 'addon_raw.json'));
	var columns = [
		{ index: 1, name: 'code', transform: build.parseAddonCode },
		{ index: 6, name: 'google', transform: build.parseText }
	];
	var emoji = {};
	var code;

	raw.forEach(function(cells) {
		var spec = {};
		columns.forEach(function(col) {
			var cell = cells[col.index];
			spec[col.name] = col.transform(cell);
		});
		code = spec.code;
		delete spec.code;
		emoji[code] = spec;
	});

	// write addon data to cache folder
	build.writeCatalog(emoji, path.join(update.dest, 'addon.json'), done);
};