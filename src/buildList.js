var build = require('./buildBase');
var path = require('path');
var output = path.join(build.dest, 'emoji_list.json');

build.loadEmoji(function () {
	console.log('Building list...');

	//build base emoji data
	var emoji = transcribeEmoji(build.emoji_data);

	// incorporate addon data to handle alternate hangouts unicode
	Object.keys(build.addon_data).forEach(function (key) {
		var orig_emoji = emoji.find(function(elem) {
			return elem.code === key;
		});

		if (orig_emoji) {
			var new_emoji = Object.assign({}, orig_emoji);
			new_emoji.code = build.addon_data[key].google;
			emoji.push(new_emoji);
		}
	});

	build.writeCatalog(emoji, output, function() {
		console.log(emoji.length + ' entries written to ' + path.relative('.', output));
	});
});

function transcribeEmoji(rows) {
	console.log('Transcribing emoji details...');
	return rows.map(function(cells) {
		var spec = {};
		build.columns.forEach(function(col) {
			var cell = cells[col.index];
			spec[col.name] = col.transform(cell);
		});
		return spec;
	});
}