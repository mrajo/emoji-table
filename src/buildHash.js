var build = require('./buildBase');
var path = require('path');
var output = path.join(build.dest, 'emoji_hash.json');

build.loadEmoji(function () {
	console.log('Building list...');
	var emoji = transcribeEmoji(build.emoji_data);
	build.writeCatalog(emoji, output, function() {
		console.log(Object.keys(emoji).length + ' entries written to ' + path.relative('.', output));
	});
});

function transcribeEmoji(rows) {
	console.log('Transcribing emoji details...');
	var code, emoji = {};
	rows.forEach(function(cells) {
		var spec = {};
		build.columns.forEach(function(col) {
			var cell = cells[col.index];
			spec[col.name] = col.transform(cell);
		});
		code = spec.code;
		delete spec.code;
		emoji[code] = spec;
	});
	return emoji;
}