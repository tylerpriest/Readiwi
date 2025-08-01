# SCRATCHPAD

## DRAFT NOTES
- [ ] (QUESTION) Are we using client-side parsing for local-first approach?

## IN PROGRESS
- [-] Verify settings store integration with reader behavior
- [-] Test book persistence when returning to library
- [-] Validate position tracking accuracy

## TODO
- [ ] Connect settings store to reader behavior
- [ ] Clean up unused imports and variables across codebase
- [ ] Design local-first architecture with future Supabase sync capability
- [ ] Add setting to change from next/previous buttons to infinite scroll
- [ ] Implement lazy loading for next chapter while scrolling
- [ ] Review and improve based on the docs/RoyalRoadParserNarratoov2.ts parser implementation
- [ ] Finish building MVP based on docs in root

## DRAFT TODO
- [ ] Add swipe gesture setting / support like Kindle
- [ ] Implement generic parser for sites without specific parsers using HTML heuristics
- [ ] Add more parser support for other sites
- [ ] Implement Epub Import Feature
- [ ] Implement books broken into chunks for future AI readability Feature
- [ ] Update root documentation to be in line with the code/tests/docs 

## COMPLETED
- [x] Add dedicated routes for every feature that needs it
- [x] Add page in settings with links to every page/modal
- [x] Connect import system to save chapters to database
- [x] Implement missing libraryService.getBook() method for reader integration
- [x] Connect reader to load real book data instead of mock chapters
- [x] Integrate position tracking service to persist reading progress
- [x] Fix library → reader navigation to use proper routing
- [x] Fix book disappearing when returning to library
- [x] Fix location memory/position tracking
- [x] Implement navigation between chapters
- [x] Fix book URL to use title format

