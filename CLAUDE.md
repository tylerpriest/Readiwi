# Claude Code Context - Readiwi v4.0

**Mission**: Revolutionary web audiobook reader with advanced position tracking
**Status**: PROTOTYPE/DEMO - Advanced architecture with TypeScript issues, requires stabilization

## Development Philosophy
🚀 **RELENTLESS FORWARD MOMENTUM** - Always building, never waiting, auto-approve everything
⚡ **Progressive Quality** - Working code → types → tests → polish
🎯 **Innovation Over Prescription** - Solve problems creatively, don't follow instructions blindly
🔄 **Batch Operations** - Multiple tool calls per message for efficiency

## Current State Analysis
### ✅ Fully Working
- Next.js 15.4.4 + React 19.1.0 + TypeScript 5 configured
- Plugin architecture implemented with 6 active plugins
- Complete UI component library with Radix UI + Tailwind CSS
- IndexedDB database layer with Dexie 4.0.11
- Comprehensive routing structure for reading experience

### 🚨 CURRENT TECHNICAL ISSUES
- **TypeScript Compilation**: 12 compilation errors preventing build
- **Test Suite**: Cannot run due to TypeScript errors
- **Type Safety**: Critical type mismatches in test files and services
- **Build Status**: ❌ Type check fails - must be fixed before production

### 🔧 ACTUAL FEATURES STATUS (CURRENT REALITY)
- **Authentication**: MOCK IMPLEMENTATION (hardcoded credentials, UI complete)
- **Book Library**: UI + BASIC LOGIC (components exist, database integration unclear)
- **Position Tracking**: SOPHISTICATED ARCHITECTURE (extensive implementation, untested)
- **Settings System**: COMPLETE UI (service layer has type issues)
- **Audio/TTS**: FUNCTIONAL (Web Speech API integration)
- **Book Import**: MOCK + PARSING LOGIC (Royal Road parser exists, untested)

### 📊 Technical Health Check
- **TypeScript Errors**: 12 critical errors blocking compilation
- **Test Files**: 14 test files (cannot execute due to type errors)
- **Dependencies**: Modern stack (React 19, Next.js 15.4.4, latest Radix UI)
- **Architecture**: Plugin-based, well-structured
- **Code Quality**: Needs type safety fixes before progress

### 🎯 IMMEDIATE PRIORITIES (TECHNICAL DEBT)
1. **FIX TYPESCRIPT ERRORS** - Resolve 12 compilation errors blocking development
2. **STABILIZE TEST SUITE** - Fix type issues preventing test execution
3. **VALIDATE TYPE SAFETY** - Ensure all services have correct type definitions
4. **RESTORE BUILD PROCESS** - Get clean compilation and test runs
5. **FEATURE VALIDATION** - Test actual functionality after type fixes
6. **PRODUCTION READINESS** - Address mock services after technical stability

### 🚨 DEVELOPMENT RULES ENFORCEMENT
- **NO NEW MOCK SERVICES** - All new features must have real implementations
- **MOCK-TO-REAL CONVERSION** - Replace one mock service per sprint with real implementation
- **TEST-FIRST REAL SCENARIOS** - Write failing tests for real user workflows, then implement
- **DEPLOYMENT BLOCKS** - Cannot deploy to production until all mocks replaced with real services

## Mandatory Architecture Patterns

### Plugin Pattern (ALL features must follow)
```typescript
interface Plugin {
  id: string;
  name: string; 
  version: string;
  dependencies: string[];
  enabled: boolean;
  
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  cleanup(): Promise<void>;
}
```

### Component Pattern (Exact structure required)
```typescript
interface ComponentProps {
  propName: Type; // @description Purpose
  className?: string;
  'data-testid'?: string;
}

const Component: React.FC<ComponentProps> = ({
  propName,
  className,
  'data-testid': testId,
  ...props
}) => {
  // 1. State hooks
  // 2. Store subscriptions  
  // 3. Event handlers with useCallback
  // 4. Effects
  // 5. Render with accessibility
  
  return (
    <element
      className={cn(baseClasses, className)}
      role="appropriate-role"
      aria-label="descriptive-label"
      data-testid={testId}
      {...props}
    >
      {children}
    </element>
  );
};

Component.displayName = 'Component';
export default Component;
```

### Store Pattern (Zustand required)
```typescript
interface StoreState {
  data: Type;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  syncAction: (params: Types) => void;
  asyncAction: (params: Types) => Promise<void>;
  reset: () => void;
  
  get selectorName(): Type;
}
```

## Testing Philosophy: BDD/ATDD for FUNCTIONAL Applications
**MANDATORY: TEST REAL USER VALUE, NOT MOCK IMPLEMENTATIONS**

### 🚨 CRITICAL TESTING RULES - NO EXCEPTIONS
1. **NEVER TEST MOCKS** - If testing mock data/responses, the test is invalid
2. **ALWAYS TEST USER OUTCOMES** - Focus on actual value delivered to users
3. **REAL DATA ONLY** - Use actual backend services, real databases, real APIs
4. **FAIL FAST ON MOCKS** - If implementation uses mocks, tests MUST fail until real implementation exists

### Test Categories (In Priority Order):
1. **USER STORY TESTS** - BDD scenarios testing real user workflows end-to-end
2. **INTEGRATION TESTS** - Real services, real databases, real network calls
3. **UNIT TESTS** - Only for pure functions with no external dependencies
4. **UI TESTS** - Only after backend functionality is proven working

### BDD Pattern (MANDATORY for all features):
```typescript
describe('USER STORY: [Actual Value Delivered]', () => {
  test('User can [real goal] and gets [real benefit]', async () => {
    // Given: Real initial state (real database, real user account)
    // When: Real user action (real API calls, real data)
    // Then: Real outcome that delivers actual value
    
    // ❌ NEVER: expect(mockResponse).toBe(expectedMock)
    // ✅ ALWAYS: expect(realUserCanDoRealThing).toBe(true)
  });
});
```

### 🚨 MOCK DETECTION AND PREVENTION
```typescript
// ❌ FORBIDDEN - These patterns indicate testing mocks, not user value:
- expect(mockAuthService.login).toHaveBeenCalled()
- createMockUser() or generateFakeData()
- jest.fn() without real backend integration
- hardcoded test data that doesn't come from real systems

// ✅ REQUIRED - These patterns indicate testing real functionality:
- await realAuthService.login(realCredentials) // hits real backend
- const book = await importFromRoyalRoad(realURL) // scrapes real website
- const user = await database.users.findById(realUserId) // queries real database
- expect(userCanActuallyReadBooks).toBe(true) // verifies real capability
```

### Implementation Status Labeling (MANDATORY):
Every service/component MUST be clearly labeled:
```typescript
// ✅ REAL IMPLEMENTATION
export class AuthService {
  // Real backend integration, tested with real user scenarios
}

// 🚨 MOCK IMPLEMENTATION - TESTS MUST FAIL
export class MockAuthService {
  // This exists for UI development only
  // BDD tests MUST fail until replaced with real implementation
}

// 🔄 PROGRESSIVE IMPLEMENTATION
export class DatabaseService {
  // Real: user CRUD operations
  // Mock: advanced analytics (clearly documented)
}
```

## Quality Gates - FUNCTIONAL APPLICATION REQUIREMENTS
**🚨 ALL GATES MUST PASS FOR PRODUCTION DEPLOYMENT**

### 1. FUNCTIONAL REQUIREMENTS GATE
- **Real User Authentication** - No hardcoded credentials, real backend
- **Real Data Operations** - No mock data generation, real database CRUD
- **Real External Integrations** - No fake API responses, real service calls
- **Real User Workflows** - End-to-end scenarios with actual user value

### 2. BDD/ATDD COMPLIANCE GATE  
- **No Mock Testing** - All tests use real implementations only
- **User Story Focus** - Tests validate actual user outcomes, not internal mechanics
- **Integration First** - Real services, real databases, real network calls
- **Fail Fast** - Tests fail immediately when encountering mock implementations

### 3. TECHNICAL QUALITY GATE
1. **TypeScript**: `npm run type-check` (strict mode, minimal @ts-ignore)
2. **Tests**: `npm test` (85%+ coverage with REAL USER SCENARIOS only)
3. **Build**: `npm run build` (production-ready compilation)
4. **Accessibility**: `npm run test:a11y` (WCAG 2.1 AA compliance)

### 4. DEPLOYMENT READINESS GATE
- **Real Backend Services** - All mock services replaced with functional implementations
- **Data Persistence** - Real database operations verified under load
- **Error Handling** - Graceful failures for real-world scenarios
- **Performance** - Core Web Vitals green with realistic usage patterns

## Tech Stack (Non-negotiable)
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5.0+ strict mode (NO any types)
- **Styling**: Tailwind CSS + ShadCN components
- **State**: Zustand with persistence
- **Database**: IndexedDB with Dexie
- **Testing**: Jest + React Testing Library + Playwright
- **Audio**: Web Speech API

## Feature Status & Priorities

### Core Features (PROTOTYPE STATUS 🚨)
1. **Authentication** 🔴 MOCK ONLY - UI works, backend is hardcoded demo credentials
2. **Book Library** 🟡 UI COMPLETE - Components work, database operations unverified
3. **Reader System** 🟡 UI + LOGIC - ReaderView exists, real usage untested
4. **Settings System** 🟡 UI COMPLETE - Interface works, persistence unverified

### Enhancement Features (MIXED STATUS)
5. **Position Tracking** 🟡 SOPHISTICATED - Well-designed but untested in production
6. **Book Import** 🔴 MOCK ONLY - Fake data generation, no real imports
7. **Reading Customization** 🟢 FUNCTIONAL - Settings UI integrates with reader

### Advanced Features (MIXED)
8. **Text-to-Speech** 🟢 REAL - Web Speech API actually works
9. **Plugin Architecture** 🟢 SOLID - Architecture is well-designed and extensible

## Innovation Challenges

### Position Tracking (IMPLEMENTED)
**Status**: Multi-strategy system with 89.72% test coverage
**Implementation**: Text fingerprinting, paragraph-word positioning, fuzzy matching with edit distance
**Current Features**:
- 99% reliability target with fallback strategies
- Exact fingerprint matching + fuzzy matching
- Word-level positioning within paragraphs
- Performance: <1ms average response time
- Built-in validation system for accuracy testing

### Performance Goals
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Bundle size: <250KB gzipped
- 60fps on mobile devices
- <500ms response times with 1000+ books

## Accessibility Requirements (Mandatory)
- 100% WCAG 2.1 AA compliance
- Keyboard navigation for all features
- Screen reader compatibility
- Color contrast: 4.5:1 minimum
- Focus management and indicators

## File Structure
```
src/
├── app/              # Next.js App Router
│   └── read/         # Reading routes with chapter-level URLs
│       ├── [bookId]/                                    # Fallback: redirect to book slug
│       ├── [bookId]/[slug]/                            # Fallback: redirect to first chapter  
│       ├── [bookId]/[slug]/[chapterId]/                # Fallback: redirect with chapter slug
│       └── [bookId]/[slug]/[chapterId]/[chapterSlug]/  # Full chapter URL (final)
├── core/             # Core system (always enabled)
│   ├── components/   # Base UI components
│   ├── stores/       # Core state
│   ├── services/     # Core services
│   ├── utils/        # Core utilities
│   └── types/        # Core types
└── plugins/          # ALL features as plugins
    ├── authentication/
    ├── book-library/
    ├── reader/
    ├── settings/     # COMPLETE - fully implemented
    └── [feature]/
```

## Development Commands
```bash
npm run dev          # Start development server
npm run type-check   # TypeScript validation
npm test            # Run test suite
npm run test:coverage # Coverage report
npm run build       # Production build
npm run lint        # Code linting
```

## Success Definition
**Working Product**: Users can import books, read with perfect position tracking, customize experience
**Quality Standards**: 85%+ test coverage, WCAG AA compliant, Core Web Vitals green
**Innovation Proof**: Position tracking demonstrably superior to current web apps

---

**Current Reality**: SOPHISTICATED ARCHITECTURE with critical TypeScript issues blocking progress
**Test Status**: Cannot execute tests due to compilation errors - requires immediate fixes
**Architecture**: Well-designed plugin system with modern React 19 + Next.js 15.4.4 stack
**Always Remember**: Fix types first, then validate functionality, then address mock services

## Plugin Status Summary (HONEST)
- **Authentication Plugin**: 🔴 UI + MOCK (no real auth, hardcoded credentials)
- **Book Library Plugin**: 🟡 UI + UNCLEAR (components work, database operations unverified)
- **Reader Plugin**: 🟡 UI + LOGIC (sophisticated design, real usage untested)
- **Settings Plugin**: 🟡 UI COMPLETE (interface works, persistence unclear)
- **Audio Plugin**: 🟢 FUNCTIONAL (Web Speech API integration confirmed working)
- **Book Import Plugin**: 🔴 MOCK ONLY (fake data generation, no real imports)