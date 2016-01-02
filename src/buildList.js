var build = require('./buildBase');
var path = require('path');
var output = path.join(build.dest, 'emoji_list.json');

createList();

function createList(done) {
	var emoji = transcribeEmoji(build.emoji_data);
	build.writeCatalog(emoji, output, function() {
		console.log(emoji.length + ' entries written to ' + path.relative('.', output));
	});
}

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