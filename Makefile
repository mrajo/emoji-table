usage:
	@echo - buildList: builds the emoji list from cached parse of unicode charts.
	@echo - buildHash: builds the emoji hash from cached parse of unicode charts.
	@echo - updateChart: downloads updated copy of Full Emoji Table.
	@echo - updateParse: reparses Full Emoji Table.
	@echo - clean: removes the built artifacts.

clean:
	@rm -rf dist lib docs tmp

buildList:
	@node src/buildList.js

buildHash:
	@node src/buildHash.js

updateCharts:
	@node src/updateCharts.js

updateParse:
	@node src/updateParse.js

.PHONY: usage clean buildList buildHash updateCharts updateParse
