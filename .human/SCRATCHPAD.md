Draft Ideas
1. Epub Import Feature
2. Books broken into chunks for future AI readability Feature

--- 

- [x] Please add dedicated routes for every feature that needs it that doesnt have one and if they dont need it explain why          

- [x] And a page in settings page that has links to every page or modal pop up we have 


----

 🎉 The import system is now fully connected to your library!

  Try importing again and you should see:

  1. ✅ Import completes successfully (fixed chapter parsing)
  2. ✅ Book gets saved to your library automatically
  3. ✅ Success message shows "Added to your library"
  4. ✅ Auto-redirect back to library after 2 seconds
  5. ✅ Book appears in your library view with all metadata

  What happens now:
  - The imported book data gets converted to the library format
  - Book metadata (title, author, chapters, etc.) gets saved to
  IndexedDB
  - The book appears immediately in your library
  - You can click on it to start reading (once chapter saving is
  implemented)

  Next steps to complete the system:
  - [x] Save individual chapters to the database (currently just book
  metadata is saved)
  - [x] Add chapter navigation and reading functionality
  - [ ] Add more parser support for other sites

  Try the import now - your books should appear in the library! 📚

----

       - [ ] Clean up unused imports and variables across codebase
     - [ ] Design local-first architecture with future Supabase sync
       capability
     - [ ] Implement generic parser for sites without specific parsers using
       HTML heuristics

----

       ⏺ Update Todos
  ⎿  - [x] Connect import system to save chapters to database, not just book
       metadata
     - [x] Implement missing libraryService.getBook() method for reader
       integration
     - [x] Connect reader to load real book data instead of mock chapters
     - [x] Integrate position tracking service to persist reading progress
     - [x] Fix library → reader navigation to use proper routing
     - [ ] Connect settings store to reader behavior
     - [ ] Implement user-aware data operations for multi-user support

     ---

     Is hthe parsing happening Client-side is preferable for Readiwi's     │
│   local-first                                                             │
╰──────────────────

---

Next steps to complete the system:
- [x] Save individual chapters to the database (currently just book
  metadata is saved)
- [x] Add chapter navigation and reading functionality
- [ ] Add more parser support for other sites


- [x] When you go back to the library the book is missing again

- [x] It is not remembering location 

- [ ] It is lazy loading the next chapter while scrolling

Check v2.ts parser for ideas as it works pretty well

Can we hot load?

---

- [x] Navigation 

- [x] Book URL just title finish it
We want it to be like this
https://www.royalroad.com/fiction/125163/just-add-mana/chapter/2442662/chapter-1-mana-overload

### Finish off building MVP with docs in root

----

- [x] Implement navigation

Is there a setting to change from pressing next previous and changing to lazy load infinite scroll?

Is there a setting to have swipe like kindle ?