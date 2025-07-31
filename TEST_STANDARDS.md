# Test Standards for Functional Applications
**Readiwi v4.0 - BDD/ATDD Compliance Guidelines**

## 🚨 MANDATORY TESTING RULES

### Rule #1: NO MOCK TESTING
```typescript
// ❌ FORBIDDEN - This is testing mock behavior, not user value
describe('Auth Service', () => {
  test('should return mock user data', async () => {
    const mockUser = { id: 'fake-123', email: 'fake@test.com' };
    expect(await mockAuthService.login()).toEqual(mockUser);
  });
});

// ✅ REQUIRED - This tests real user capability
describe('USER STORY: User Authentication', () => {
  test('User can log in and access their account', async () => {
    // Given: Real user account exists in database
    const realUser = await createRealUserAccount('user@example.com', 'password123');
    
    // When: User attempts to log in with correct credentials
    const result = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    // Then: User is authenticated and can access protected resources
    expect(result.user.id).toBe(realUser.id);
    expect(result.accessToken).toBeDefined();
    expect(await userCanAccessProtectedResource(result.accessToken)).toBe(true);
  });
});
```

### Rule #2: REAL DATA ONLY
```typescript
// ❌ FORBIDDEN - Using fake/generated data
const mockBook = {
  id: 'fake-book-123',
  title: 'Generated Test Book',
  content: 'Lorem ipsum fake content...'
};

// ✅ REQUIRED - Using real external data
test('User can import a book from Royal Road', async () => {
  // Given: Real Royal Road book URL
  const realBookUrl = 'https://www.royalroad.com/fiction/21220/mother-of-learning';
  
  // When: User imports the book
  const importedBook = await bookImportService.importBook(realBookUrl);
  
  // Then: Real book data is retrieved and stored
  expect(importedBook.title).toBe('Mother of Learning'); // Real title
  expect(importedBook.chapters.length).toBeGreaterThan(100); // Real chapter count
  expect(importedBook.chapters[0].content).toContain('Zorian'); // Real content
});
```

### Rule #3: USER OUTCOME FOCUS
```typescript
// ❌ FORBIDDEN - Testing internal implementation
test('should call database.save() method', async () => {
  const spy = jest.spyOn(database, 'save');
  await libraryService.addBook(book);
  expect(spy).toHaveBeenCalled();
});

// ✅ REQUIRED - Testing user-visible outcome
test('User can add a book to their library and find it later', async () => {
  // Given: User has an empty library
  const userId = await createRealUser();
  const initialLibrary = await libraryService.getUserBooks(userId);
  expect(initialLibrary).toHaveLength(0);
  
  // When: User adds a book to their library
  const bookToAdd = await importRealBook();
  await libraryService.addBook(userId, bookToAdd);
  
  // Then: User can see the book in their library
  const updatedLibrary = await libraryService.getUserBooks(userId);
  expect(updatedLibrary).toHaveLength(1);
  expect(updatedLibrary[0].title).toBe(bookToAdd.title);
  
  // And: User can search for and find the book
  const searchResults = await libraryService.searchBooks(userId, bookToAdd.title);
  expect(searchResults).toContainEqual(expect.objectContaining({
    title: bookToAdd.title
  }));
});
```

## 📋 TEST CATEGORIES BY PRIORITY

### 1. USER STORY TESTS (Highest Priority)
**Purpose**: Validate complete user workflows deliver real value
**Requirements**: 
- Must use real backends, real databases, real APIs
- Must test end-to-end user scenarios
- Must verify actual user benefits are delivered

```typescript
describe('USER STORY: Reading Experience', () => {
  test('User can read a book and return to exact position later', async () => {
    // Given: User has imported a real book and is reading
    const user = await createRealUser();
    const book = await importRealBook();
    await startReading(user, book, { chapter: 5, position: 1247 });
    
    // When: User closes app and reopens it later
    await simulateAppRestart();
    const resumedPosition = await getReadingPosition(user, book);
    
    // Then: User returns to exact same position
    expect(resumedPosition.chapter).toBe(5);
    expect(resumedPosition.position).toBe(1247);
    expect(await userCanContinueReading(user, book)).toBe(true);
  });
});
```

### 2. INTEGRATION TESTS
**Purpose**: Verify real services work together correctly
**Requirements**:
- Real external API calls
- Real database operations
- Real file system operations

```typescript
describe('INTEGRATION: Book Import → Library → Reader', () => {
  test('Imported book appears in library and is readable', async () => {
    // Real Royal Road import
    const book = await bookImportService.importBook(realRoyalRoadUrl);
    
    // Real database storage
    await libraryService.addBook(realUserId, book);
    
    // Real retrieval and reading
    const libraryBooks = await libraryService.getUserBooks(realUserId);
    const readableBook = await readerService.openBook(libraryBooks[0].id);
    
    expect(readableBook.chapters[0].content).toBeTruthy();
  });
});
```

### 3. UNIT TESTS (Pure Functions Only)
**Purpose**: Test isolated logic with no external dependencies
**Allowed**: Pure functions, utilities, validators
**Forbidden**: Anything that touches databases, APIs, or files

```typescript
describe('UNIT: Text Processing Utilities', () => {
  test('extractChapterTitle extracts title correctly', () => {
    const html = '<h1 class="chapter-title">Chapter 1: The Beginning</h1>';
    const result = extractChapterTitle(html);
    expect(result).toBe('Chapter 1: The Beginning');
  });
});
```

## 🚫 FORBIDDEN TEST PATTERNS

### Mock Service Testing
```typescript
// ❌ NEVER DO THIS
const mockAuthService = {
  login: jest.fn().mockResolvedValue({ user: 'fake' })
};
```

### Fake Data Generation
```typescript
// ❌ NEVER DO THIS
const generateFakeBook = () => ({
  title: 'Fake Book ' + Math.random(),
  content: 'Lorem ipsum...'
});
```

### Internal Implementation Testing
```typescript
// ❌ NEVER DO THIS
expect(service.methodWasCalled).toBe(true);
expect(database.save).toHaveBeenCalledWith(expectedData);
```

## ✅ REQUIRED TEST PATTERNS

### Real User Scenarios
```typescript
// ✅ ALWAYS DO THIS
test('User achieves real goal with real benefit', async () => {
  // Real setup, real actions, real verification
});
```

### Real External Dependencies
```typescript
// ✅ ALWAYS DO THIS
const realApiResponse = await fetch('https://real-api.com/endpoint');
const realDatabaseResult = await database.realCollection.find(realQuery);
```

### Error Handling with Real Failures
```typescript
// ✅ ALWAYS DO THIS
test('User gets helpful error when real service is unavailable', async () => {
  // Temporarily disable real service
  await disableNetworkAccess();
  
  // Verify user gets appropriate error message
  const result = await bookImportService.importBook(realUrl);
  expect(result.error).toContain('Network unavailable');
  expect(result.suggestedAction).toContain('Try again later');
});
```

## 🎯 TEST SUCCESS CRITERIA

### For Each User Story Test:
1. **Real User Value**: Test demonstrates actual benefit to real users
2. **Real Data Flow**: Uses real backends, databases, APIs throughout
3. **Real Error Scenarios**: Handles actual failure modes users encounter
4. **Real Performance**: Validates acceptable response times under realistic load

### For Each Integration Test:
1. **Real Service Calls**: No mocked external dependencies
2. **Real Data Persistence**: Actual database read/write operations
3. **Real Network Operations**: HTTP requests to actual endpoints
4. **Real State Management**: Persistent state across real app restarts

### Overall Test Suite Requirements:
- **85%+ Coverage** of real user scenarios (not code coverage)
- **Zero Mock Dependencies** in production test paths
- **Real Environment Testing** with actual external services
- **Performance Validation** under realistic usage patterns

## 🚨 ENFORCEMENT MECHANISMS

### Pre-Commit Hooks
```bash
# Reject commits with mock testing patterns
if grep -r "mock\|fake\|stub" src/**/*.test.ts; then
  echo "❌ COMMIT REJECTED: Mock testing detected"
  echo "Use real implementations and test real user scenarios"
  exit 1
fi
```

### CI/CD Pipeline Checks
- Scan test files for forbidden patterns
- Require real database connections for integration tests
- Validate external API calls are made during test execution
- Block deployment if mock services detected in production paths

### Code Review Requirements
- All tests must demonstrate real user value
- No approval for tests using mock data or services
- Integration tests must show real external service calls
- Performance tests must use realistic data volumes