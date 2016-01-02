usage:
	@echo - build ......... builds the emoji table from the unicode charts.
	@echo - clean ......... removes the built artifacts.

prepublish: clean build

clean:
	@rm -rf dist lib docs

buildList:
	@node src/buildList.js

buildHash:
	@node src/buildHash.js

updateChart:
	@node src/updateChart.js

updateParse:
	@node src/updateParse.js

.PHONY: usage clean build
