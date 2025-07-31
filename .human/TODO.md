- [ ] Layout this TODO.md in a way that works best for you (and keeps it easy / makes it easier for me to use)
- [ ] Remember to check TODO.md periodically record this in Claude.md or somewhere to make sure it happens, and that when you tick it off it gets moved below the ones still todo     
- [ ] Can you integrate with Vercel so you can send builds to them and get the results

- [ ] Clean up unused imports and variables across codebase
- [ ] Design local-first architecture with future Supabase sync
- [ ] Plan Book Import implementation using existing IndexedDB

- [ ] Create a Team member that realistic checking 
- [ ] Import books is next feature to work on check .human/WebNovel Parsers.md for link to githubs for apps that do this and directly to their plugins, webtoepub is very well done so focus on that.
- [x] Commit
- [x] Add a rule to periodically check .human/TODO.md for notes from me and if its a question, answer it in the TODO.md but make it clear that it is an answer
- [x] Import books is its own "plugin" yes?
  **ANSWER (Claude):** Yes, import books is already implemented as its own plugin in `/src/plugins/book-import/`. It follows the standardized plugin architecture with components, services, and stores. This allows it to be enabled/disabled independently.
- [x] And you should have the ability to enable/disable different webnovel site parsers from parser settings
  **ANSWER (Claude):** Yes, this should be implemented as sub-plugins or parser modules within the book-import plugin. Each parser (RoyalRoad, Webnovel, etc.) can be individually enabled/disabled through settings, similar to how WebToEpub handles it.
- [x] We should also have a general parser for sites that we dont have a specific parser for 
  **ANSWER (Claude):** Agreed. A generic parser that can handle basic HTML extraction patterns would be valuable. It could use heuristics to detect chapters, titles, and content based on common patterns (heading tags, content divs, etc.).
- [x] Will this happen client side or server side ? Or both ? Or Is there a better question to ask
  **ANSWER (Claude):** Client-side is preferable for Readiwi's local-first architecture. This avoids CORS issues, reduces server costs, and keeps user data private. However, we need to handle:
  - CORS restrictions (use browser extension APIs or proxy if needed)
  - Rate limiting (built-in delays between requests)
  - Large content processing (stream parsing, background workers)
  -  Better question: "How do we handle CORS and rate limiting for client-side scraping?"
