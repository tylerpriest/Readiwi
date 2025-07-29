# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Narrato v4.0** is a web-based audiobook reader for web novels designed for autonomous development by AI agents. This is a specifications-only repository containing comprehensive documentation for building a modern, accessible, and high-performance reading application.

### Key Characteristics
- **Specification-driven development**: Complete documentation before implementation
- **AI-autonomous development**: Designed for Claude Code CLI autonomous implementation  
- **Accessibility-first**: WCAG 2.1 AA compliance is mandatory
- **Mobile-first**: Optimized for mobile reading experience
- **Offline-first**: IndexedDB with optional cloud sync
- **Plugin architecture**: Modular features as plugins

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.0+ in strict mode (no `any` types allowed)
- **Styling**: Tailwind CSS 3.0+ with custom design system
- **State Management**: Zustand 4.0+ with persistence middleware
- **Database**: IndexedDB with Dexie 3.0+ for offline-first storage
- **Testing**: Jest 29+ with React Testing Library, Playwright 1.40+ for E2E
- **Audio**: Web Speech API (browser native) with fallback support
- **UI Components**: Radix UI primitives with custom styling

### Core Plugin Architecture
The application uses a mandatory plugin-based architecture where ALL features must implement the Plugin interface:

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
  
  registerComponents(): ComponentRegistry;
  registerRoutes(): RouteRegistry;
  registerStores(): StoreRegistry;
  registerServices(): ServiceRegistry;
}
```

### File Structure Pattern
```
src/
├── app/                    # Next.js App Router
├── core/                   # Core system (always enabled)
│   ├── components/         # Base UI components
│   ├── stores/            # Core state management
│   ├── services/          # Core services
│   ├── utils/             # Core utilities
│   └── types/             # Core type definitions
└── plugins/               # All features as plugins
    ├── authentication/
    ├── book-library/
    ├── reader/
    ├── position-tracking/  # Innovation challenge feature
    └── [feature-name]/
```

## Development Requirements

### Mandatory Code Patterns

**Component Pattern** (MUST follow exactly):
```typescript
interface ComponentNameProps {
  propName: Type; // @description Purpose of this prop
  className?: string;
  'data-testid'?: string;
}

const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  className,
  'data-testid': testId,
  ...props
}) => {
  // 1. State hooks (if needed)
  // 2. Store subscriptions (if needed)
  // 3. Event handlers with useCallback
  // 4. Effects (if needed)
  // 5. Render with accessibility and performance optimization
  
  return (
    <element
      className={cn(baseClasses, className)}
      role="appropriate-role"
      aria-label="descriptive-label"
      data-testid={testId}
      {...props}
    >
      {/* Component content */}
    </element>
  );
};

ComponentName.displayName = 'ComponentName';
export default ComponentName;
```

**Store Pattern** (MUST follow exactly):
```typescript
interface StoreNameState {
  // Data fields with explicit types
  dataField: Type;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Actions
  syncAction: (params: Types) => void;
  asyncAction: (params: Types) => Promise<void>;
  reset: () => void;
  
  // Selectors (computed values)
  get selectorName(): Type;
}
```

### Quality Requirements
- **Test Coverage**: Minimum 85% across all code
- **Accessibility**: 100% WCAG 2.1 AA compliance 
- **Performance**: Core Web Vitals all green (LCP <2.5s, FID <100ms, CLS <0.1)
- **Bundle Size**: Initial bundle <250KB gzipped
- **TypeScript**: Strict mode, no `any` types allowed

### Innovation Challenge: Position Tracking
The current position tracking system has critical issues:
- Only 88% accuracy (target: 95%+)
- Position loss after 10+ seconds inactivity
- Excessive console logging
- Mobile/desktop inconsistencies

**Your task**: Completely reimagine the position tracking approach. Don't be constrained by the current scroll-based implementation. Consider:
- Text fingerprinting and content-aware positioning
- Multi-strategy restoration with graceful fallbacks
- Intelligent save timing (not fixed intervals)
- Novel web APIs for better reliability

## Key Features to Implement

### Core Features (Required)
1. **Authentication System** - User registration, login, session management
2. **Book Library Management** - Grid/list views, search, filtering, sorting
3. **Basic Reader Interface** - Chapter navigation, responsive design
4. **Settings System** - Persistent configuration with validation

### Enhancement Features
1. **Book Import System** - URL-based import with progress tracking
2. **Position Tracking** - Revolutionary 95%+ accuracy system (Innovation Challenge)
3. **Reading Customization** - Fonts, themes, layout options
4. **Search & Discovery** - Advanced search with fuzzy matching

### Audio Features
1. **Text-to-Speech** - Web Speech API integration
2. **Audio Controls** - Global audio bar, background playback
3. **Audio Sync** - Text highlighting during playback

## Testing Strategy

### Required Test Types
- **Unit Tests**: 85%+ coverage, component logic, store actions
- **Integration Tests**: Component interactions, store integrations
- **E2E Tests**: Critical user journeys, cross-browser compatibility  
- **Accessibility Tests**: WCAG 2.1 AA compliance with axe-core
- **Performance Tests**: Core Web Vitals validation

### Test Patterns
All components must have tests following the exact template pattern with:
- Rendering tests
- Interaction tests  
- Accessibility tests (with jest-axe)
- Performance tests

## Implementation Guidelines

### Before Starting Development
1. Read MASTER_SPEC.md for complete requirements
2. Review data-architecture.md for database schema
3. Check design-system.md for UI tokens and patterns
4. Follow testing-strategy.md for test requirements

### Development Flow
1. Implement plugin interface for each feature
2. Use exact code patterns (no deviation allowed)
3. Write tests before implementation (TDD)
4. Validate against acceptance criteria
5. Ensure 100% WCAG 2.1 AA compliance
6. Meet all performance benchmarks

### Error Handling
All errors must follow the classification system:
- **Severity**: LOW/MEDIUM/HIGH/CRITICAL
- **Category**: VALIDATION/NETWORK/STORAGE/PERMISSION/SYSTEM/UNKNOWN
- Use comprehensive error boundaries and logging

### Performance Optimization
- Bundle splitting and code splitting
- Efficient IndexedDB queries with proper indexing
- Responsive images and lazy loading
- Service Worker for offline functionality
- Memory management for large libraries (1000+ books)

## Validation Criteria

### Code Quality Gates
- TypeScript strict mode with no `any` types
- All ESLint rules pass
- Prettier formatting applied
- 85%+ test coverage
- Zero accessibility violations
- Performance benchmarks met

### Feature Completion Criteria
Each feature is only complete when:
- All acceptance criteria met and tested
- WCAG 2.1 AA compliance verified
- Performance requirements satisfied
- Error scenarios handled gracefully
- Documentation updated

### Innovation Validation (Position Tracking)
The position tracking innovation must prove:
- 95%+ accuracy across all content types
- Zero position loss in any usage scenario
- Minimal performance impact (<1% CPU, <5MB memory)
- Superiority over current implementation through comprehensive testing

## Important Notes

### What This Repository Contains
- Complete specifications and documentation
- Design system and architectural patterns
- Test strategies and quality requirements
- Feature registry and implementation guidance

### What This Repository Does NOT Contain
- No actual application code (this is specifications only)
- No package.json or build configuration
- No existing codebase to maintain or modify

### Your Role
When implementing this project:
1. Create the Next.js application from scratch
2. Follow the exact patterns and requirements specified
3. Implement all core features using the plugin architecture
4. Achieve all quality benchmarks (performance, accessibility, testing)
5. Focus on the position tracking innovation challenge

Remember: This is autonomous development with comprehensive specifications. Every pattern, requirement, and acceptance criterion has been carefully designed for consistent, high-quality implementation.