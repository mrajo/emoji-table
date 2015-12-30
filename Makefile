usage:
	@echo - build ......... builds the emoji table from the unicode charts.
	@echo - clean ......... removes the built artifacts.

prepublish: clean build

clean:
	@rm -rf dist lib docs

build:
	@node src/createCatalog.js

update:
	@node src/updateCache.js

.PHONY: usage clean build
