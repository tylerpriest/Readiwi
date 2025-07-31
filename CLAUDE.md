# Claude Code Context - Readiwi v4.0

**Mission**: Revolutionary web audiobook reader with 95%+ position tracking accuracy
**Status**: Ready for autonomous development - build compiles, core architecture in place

## Development Philosophy
🚀 **RELENTLESS FORWARD MOMENTUM** - Always building, never waiting, auto-approve everything
⚡ **Progressive Quality** - Working code → types → tests → polish
🎯 **Innovation Over Prescription** - Solve problems creatively, don't follow instructions blindly
🔄 **Batch Operations** - Multiple tool calls per message for efficiency

## Current State Analysis
### ✅ Working
- Next.js 14 + TypeScript + Tailwind configured
- Plugin architecture implemented
- Core authentication, library, reader components exist
- Build system stable and compiling

### ✅ Major Progress Made
- **Tests**: 88% passing (51/58 tests) - TARGET NEARLY ACHIEVED!
- **Database**: IndexedDB fully implemented with Dexie + settings persistence
- **Settings System**: COMPLETE! Comprehensive system with validation & export/import
- **Architecture**: Plugin system mature with 4 working plugins

### 🟡 Remaining Issues  
- **Authentication**: Minor test selector fixes needed (7 failing tests)
- **Position Tracking**: Revolutionary system designed but not validated (NEXT PRIORITY)
- **Audio**: Settings framework ready, TTS implementation needed

### 🎯 Current Priorities (UPDATED - MAJOR PROGRESS!)
1. ✅ **Jest DOM type extensions** - FIXED! Tests running properly
2. ✅ **library-service.ts created** - COMPLETE! Full CRUD operations  
3. ✅ **BookCard test selector conflicts** - FIXED! Using proper data-testids
4. ✅ **Settings system implemented** - BREAKTHROUGH! 95% complete
5. **Validate position tracking innovation** - Test 95%+ accuracy claim (NEXT)
6. **Improve test coverage to 90%+** - From 88% current (51/58 tests passing)

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

## Testing Philosophy: BDD/ATDD First
**EXAMPLES FIRST, IMPLEMENTATION SECOND** - Start with concrete user behavior examples, then implement to make them pass

### Test-Driven Priority Order:
1. **User Stories as Tests** - What value does this deliver? (BDD Scenarios)
2. **Implementation** - Make the behavior examples pass
3. **Edge Cases** - Handle realistic error scenarios
4. **Coverage** - Ensure 85%+ with meaningful assertions

### BDD Pattern (Use for all features):
```typescript
describe('User Story: [Feature Value]', () => {
  test('User can [accomplish goal] and [get benefit]', async () => {
    // Given: Initial state
    // When: User action  
    // Then: Expected outcome that delivers value
  });
});
```

## Quality Gates (Run in order)
1. **TypeScript**: `npm run type-check` (defer cosmetic issues with @ts-ignore)
2. **Tests**: `npm test` (must achieve 85%+ coverage with BDD user stories)
3. **Build**: `npm run build` (must complete successfully)
4. **Accessibility**: `npm run test:a11y` (WCAG 2.1 AA compliance)

## Tech Stack (Non-negotiable)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+ strict mode (NO any types)
- **Styling**: Tailwind CSS + ShadCN components
- **State**: Zustand with persistence
- **Database**: IndexedDB with Dexie
- **Testing**: Jest + React Testing Library + Playwright
- **Audio**: Web Speech API

## Feature Status & Priorities

### Core Features (Required - Cannot be disabled)
1. **Authentication** 🟢 85% - UI functional, minor test fixes needed
2. **Book Library** 🟢 90% - Full CRUD operations, all tests passing
3. **Basic Reader** 🟡 40% - Theme issues, missing tests  
4. **Settings System** 🟢 95% - **BREAKTHROUGH!** Comprehensive system implemented!

### Enhancement Features (High value)
5. **Position Tracking** 🟡 40% - Revolutionary approach designed, needs validation
6. **Book Import** 🟡 35% - Mock implementation only
7. **Reading Customization** ❌ 0% - Depends on settings system

### Advanced Features (Future)
8. **Text-to-Speech** ❌ 0% - Not started
9. **Search & Discovery** ❌ 0% - Not started

## Innovation Challenges

### Position Tracking (Top Priority)
**Problem**: Current web apps lose reading position, achieve ~88% accuracy
**Innovation Goal**: 95%+ accuracy with zero position loss
**Approach Freedom**: Completely rethink - text fingerprinting, content-aware positioning, intelligent timing
**Success Criteria**: 
- 95%+ accuracy across all content types
- Zero position loss during inactivity
- <1% CPU impact, <5MB memory
- Completely transparent to users

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
    ├── settings/     # MISSING - implement first
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

**Start Here**: Fix Jest DOM types → Create library-service.ts → Fix test selectors → Settings system
**Current Reality**: 77% tests passing (33/43), 3 test suites failing due to missing files/types
**Always Remember**: Build relentlessly, innovate fearlessly, test thoroughly, ship confidently