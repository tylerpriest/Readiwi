# NARRATO AI MASTER SPECIFICATION v4.0

**Version**: 4.0.0  
**Created**: 2025-07-29  
**Purpose**: Complete AI-agent specification for autonomous development  
**Target Agent**: Claude Code CLI for production-ready rebuild  

## SYSTEM_CONTEXT

### Project Identity
- **Name**: Narrato
- **Type**: Web-based audiobook reader for web novels
- **Architecture**: Next.js 14 single-page application with IndexedDB storage
- **Target Users**: Web novel readers seeking accessible reading/listening experience
- **Development Model**: Autonomous AI development with human validation

### Core Mission
Transform web novels into accessible, immersive audiobook experiences with:
- Seamless text-to-speech integration with position synchronization
- Reliable reading position tracking (95%+ accuracy)
- Mobile-first responsive design optimized for touch
- WCAG 2.1 AA accessibility compliance (100%)
- Offline-first functionality with cloud sync capabilities

### Success Metrics
- **Performance**: Core Web Vitals all green (LCP <2.5s, FID <100ms, CLS <0.1)
- **Accessibility**: 100% WCAG 2.1 AA compliance across all features
- **User Experience**: 45+ minute average session duration
- **Reliability**: 95%+ position tracking accuracy, 99.9% uptime
- **Quality**: 85%+ test coverage for all features with automated validation

## TECHNICAL_STACK

### Required Technologies
```json
{
  "framework": "Next.js 14+ with App Router",
  "language": "TypeScript 5.0+ in strict mode",
  "styling": "Tailwind CSS 3.0+ with custom design system",
  "stateManagement": "Zustand 4.0+ with persistence middleware",
  "database": "IndexedDB with Dexie 3.0+ for offline-first storage",
  "testing": {
    "unit": "Jest 29+ with React Testing Library",
    "e2e": "Playwright 1.40+ with cross-browser testing",
    "accessibility": "axe-core with jest-axe for WCAG validation"
  },
  "audio": "Web Speech API (browser native) with fallback support",
  "ui": "Radix UI primitives with custom styling and full accessibility"
}
```

### Forbidden Technologies
- jQuery (use modern React patterns)
- Lodash (use native JavaScript methods)
- Bootstrap (use Tailwind CSS with custom design system)
- Redux (use Zustand for state management)
- Any types in TypeScript (strict mode required)
- Inline styles (use Tailwind classes and CSS custom properties)

### Performance Constraints
- **Bundle Size**: Initial bundle <250KB gzipped
- **Memory Usage**: <50MB for typical reading sessions
- **Render Performance**: 60fps on mobile devices, 16ms render budget
- **Network**: Offline-first, minimal external requests, efficient caching

## PLUGIN_ARCHITECTURE

### Plugin Interface
```typescript
// MANDATORY PATTERN: All features must implement this plugin interface
interface Plugin {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  enabled: boolean;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Registration methods
  registerComponents(): ComponentRegistry;
  registerRoutes(): RouteRegistry;
  registerStores(): StoreRegistry;
  registerServices(): ServiceRegistry;
}

// Plugin registry for managing all features
interface PluginRegistry {
  plugins: Map<string, Plugin>;
  enabledPlugins: Set<string>;
  
  register(plugin: Plugin): void;
  enable(pluginId: string): Promise<void>;
  disable(pluginId: string): Promise<void>;
  getEnabled(): Plugin[];
  getDependencies(pluginId: string): string[];
}
```

## ARCHITECTURE_PATTERNS

### Modular Plugin-Based File Structure
```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout with plugin providers
│   ├── page.tsx                  # Home page (library view)
│   ├── read/[bookId]/            # Reader routes
│   └── settings/                 # Settings routes
│
├── core/                         # Core system (always enabled)
│   ├── components/               # Base UI components
│   │   ├── ui/                  # Primitive components (Button, Input, etc.)
│   │   ├── layout/              # Layout components (Header, Sidebar)
│   │   └── common/              # Shared components (Modal, Toast)
│   ├── stores/                  # Core state management
│   │   ├── app-store.ts         # Global app state
│   │   └── plugin-registry.ts   # Plugin management
│   ├── services/                # Core services
│   │   ├── database.ts          # IndexedDB setup and core operations
│   │   ├── storage.ts           # Storage management
│   │   └── validation.ts        # Data validation
│   ├── utils/                   # Core utilities
│   │   ├── cn.ts               # Class name utility
│   │   ├── logger.ts           # Logging system
│   │   └── performance.ts      # Performance monitoring
│   └── types/                   # Core type definitions
│       ├── plugin.ts           # Plugin interface definitions
│       └── database.ts         # Database type definitions
│
├── plugins/                     # All features as plugins
│   ├── authentication/         # Authentication plugin
│   │   ├── components/         # Auth-specific components
│   │   ├── stores/             # Auth state management
│   │   ├── services/           # Auth business logic
│   │   ├── types/              # Auth type definitions
│   │   ├── plugin.ts           # Plugin registration
│   │   └── index.ts            # Plugin exports
│   │
│   ├── book-library/           # Library management plugin
│   ├── reader/                 # Reading interface plugin
│   ├── settings/               # Settings management plugin
│   ├── book-import/            # Book import plugin
│   ├── parser-management/      # Parser system plugin
│   ├── position-tracking/      # Position tracking plugin (INNOVATION CHALLENGE)
│   ├── reading-customization/  # Reading customization plugin
│   ├── audio-system/           # Audio/TTS plugin
│   └── search-discovery/       # Advanced search plugin
│
├── styles/                     # Global styles and design system
└── tests/                     # Testing infrastructure
    ├── unit/                  # Unit tests by plugin
    ├── integration/           # Integration tests
    └── e2e/                   # End-to-end tests
```

### Component Pattern
```typescript
// MANDATORY PATTERN: All components must follow this exact structure
interface [ComponentName]Props {
  // Explicit prop types with JSDoc comments
  [propName]: [Type]; // @description Purpose of this prop
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const [ComponentName]: React.FC<[ComponentName]Props> = ({
  [propName],
  className,
  'data-testid': testId,
  ...props
}) => {
  // 1. State hooks (if needed)
  const [localState, setLocalState] = useState<[Type]>([initialValue]);
  
  // 2. Store subscriptions (if needed)
  const { [data], [actions] } = use[StoreName]();
  
  // 3. Event handlers with useCallback for performance
  const handle[Event] = useCallback(([params]: [Types]) => {
    try {
      // Implementation with comprehensive error handling
      [actions].[actionName]([params]);
    } catch (error) {
      console.error(`Error in ${[ComponentName]}.handle${[Event]}:`, error);
      // Handle error appropriately with user feedback
    }
  }, [[dependencies]]);
  
  // 4. Effects (if needed)
  useEffect(() => {
    // Effect implementation with cleanup
    return () => {
      // Cleanup function
    };
  }, [[dependencies]]);
  
  // 5. Render with accessibility and performance optimization
  return (
    <[element]
      className={cn([baseClasses], className)}
      role="[appropriate-role]"
      aria-label="[descriptive-label]"
      data-testid={testId}
      {...props}
    >
      {/* Component content with proper semantic structure */}
    </[element]>
  );
};

// MANDATORY: Display name for debugging and React DevTools
[ComponentName].displayName = '[ComponentName]';
export default [ComponentName];
```##
# Store Pattern
```typescript
// MANDATORY PATTERN: All Zustand stores must follow this structure
interface [StoreName]State {
  // Data fields with explicit types
  [dataField]: [Type];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Actions
  [syncAction]: ([params]: [Types]) => void;
  [asyncAction]: ([params]: [Types]) => Promise<void>;
  reset: () => void;
  
  // Selectors (computed values)
  get [selectorName](): [Type];
}

const use[StoreName] = create<[StoreName]State>((set, get) => ({
  // Initial state
  [dataField]: [initialValue],
  loading: false,
  error: null,
  lastUpdated: 0,
  
  // Computed selectors
  get [selectorName]() {
    return [computation based on state];
  },
  
  // Synchronous actions
  [syncAction]: ([params]) => {
    set((state) => ({
      ...state,
      [dataField]: [newValue],
      lastUpdated: Date.now(),
    }));
  },
  
  // Asynchronous actions with comprehensive error handling
  [asyncAction]: async ([params]) => {
    set({ loading: true, error: null });
    
    try {
      const result = await [serviceCall]([params]);
      set((state) => ({
        ...state,
        [dataField]: result,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({
        loading: false,
        error: errorMessage,
      });
      throw error; // Re-throw for component error handling
    }
  },
  
  // Reset action
  reset: () => {
    set({
      [dataField]: [initialValue],
      loading: false,
      error: null,
      lastUpdated: 0,
    });
  },
}));

export default use[StoreName];
```

### Error Handling Pattern
```typescript
// MANDATORY PATTERN: All error handling must follow this structure
class [FeatureName]Error extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = '[FeatureName]Error';
  }
}

// Error boundary for feature isolation
const [FeatureName]ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<[FeatureName]ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error(`[FeatureName] Error:`, error);
        // Log to error tracking service
        logError({
          error,
          errorInfo,
          feature: '[FeatureName]',
          timestamp: new Date(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Async error handling hook
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setError(null);
      return await asyncFn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    }
  }, []);
  
  return { error, executeAsync };
};
```

## FEATURE_MODULES

### Core Features (Always Enabled - Required)

#### Authentication System
```typescript
// FEATURE: authentication
// DEPENDENCIES: []
// STATUS: required

interface AuthenticationState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  reset: () => void;
}

interface User {
  id: string;
  email: string;
  username: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

// VALIDATION CRITERIA:
// - User can register with email and password validation
// - User can login with valid credentials and session persistence
// - User session persists across browser sessions with secure token storage
// - User can logout and clear all session data securely
// - Invalid credentials show clear, accessible error messages
// - All authentication forms have proper validation and WCAG AA compliance
// - Password reset functionality works with secure email verification
```

#### Book Library Management
```typescript
// FEATURE: book-library
// DEPENDENCIES: []
// STATUS: required

interface BookLibraryState {
  books: Book[];
  selectedBook: Book | null;
  libraryView: 'grid' | 'list' | 'compact';
  sortBy: 'title' | 'author' | 'dateAdded' | 'lastRead';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  filters: LibraryFilters;
  loading: boolean;
  error: string | null;
  
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  selectBook: (book: Book | null) => void;
  setLibraryView: (view: 'grid' | 'list' | 'compact') => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<LibraryFilters>) => void;
  reset: () => void;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  sourceUrl?: string;
  totalChapters: number;
  chapters: Chapter[];
  tags: string[];
  status: 'ready' | 'importing' | 'error';
  isFavorite: boolean;
  readingProgress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  lastReadAt?: Date;
}

interface LibraryFilters {
  status: string[];
  tags: string[];
  favorites: boolean;
  dateRange: { start?: Date; end?: Date };
}

// VALIDATION CRITERIA:
// - User can view books in grid, list, and compact layouts
// - User can sort books by title, author, date added, and last read
// - User can search books by title, author, and tags with real-time results
// - User can filter books by status, tags, favorites, and date range
// - User can select books for reading with keyboard and mouse
// - User can delete books with confirmation dialog
// - Book metadata is stored and retrieved correctly from IndexedDB
// - Library interface is fully accessible with screen readers
// - Library performance remains smooth with 1000+ books
```

#### Basic Reader Interface
```typescript
// FEATURE: basic-reader
// DEPENDENCIES: [book-library]
// STATUS: required

interface BasicReaderState {
  currentBook: Book | null;
  currentChapter: Chapter | null;
  chapters: Chapter[];
  chapterIndex: number;
  loading: boolean;
  error: string | null;
  
  openBook: (bookId: string, chapterId?: string) => Promise<void>;
  navigateToChapter: (chapterIndex: number) => Promise<void>;
  navigateNext: () => Promise<void>;
  navigatePrevious: () => Promise<void>;
  reset: () => void;
}

interface Chapter {
  id: string;
  bookId: string;
  index: number;
  title: string;
  content: string;
  wordCount: number;
  estimatedReadingTime: number; // in minutes
}

// VALIDATION CRITERIA:
// - User can open books and view chapter content with proper formatting
// - User can navigate between chapters with next/previous buttons
// - User can navigate chapters with keyboard shortcuts (arrow keys, page up/down)
// - Chapter content is displayed with proper typography and spacing
// - Chapter loading shows appropriate loading states and error handling
// - Basic reader interface is fully accessible with screen readers
// - Chapter navigation announces changes to assistive technologies
// - Reader maintains 60fps scrolling performance on mobile devices
```

#### Settings System
```typescript
// FEATURE: settings-system
// DEPENDENCIES: []
// STATUS: required

interface SettingsState {
  settings: Record<string, unknown>;
  loading: boolean;
  error: string | null;
  
  getSetting: <T>(key: string, defaultValue: T) => T;
  setSetting: <T>(key: string, value: T) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<void>;
  reset: () => void;
}

// VALIDATION CRITERIA:
// - Settings can be stored and retrieved reliably from IndexedDB
// - Settings persist across browser sessions and device restarts
// - Settings can be reset to defaults with user confirmation
// - Settings can be exported/imported as JSON with validation
// - Settings interface is accessible with proper labels and descriptions
// - Settings changes apply immediately with visual feedback
// - Invalid settings show clear error messages and correction guidance
```

### Core Enhancement Features (Important Optional)

#### Book Import System - Innovation Challenge
```typescript
// FEATURE: book-import
// DEPENDENCIES: [book-library, parser-management]
// STATUS: optional

interface BookImportState {
  importQueue: ImportJob[];
  currentImport: ImportJob | null;
  loading: boolean;
  error: string | null;
  
  importBook: (url: string, options?: ImportOptions) => Promise<void>;
  cancelImport: (jobId: string) => void;
  retryImport: (jobId: string) => Promise<void>;
  clearCompleted: () => void;
  reset: () => void;
}

interface ImportJob {
  id: string;
  url: string;
  status: 'pending' | 'analyzing' | 'importing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalChapters?: number;
  processedChapters: number;
  bookId?: string;
  bookTitle?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ImportOptions {
  skipExistingChapters: boolean;
  downloadImages: boolean;
  processHtml: boolean;
  maxConcurrentRequests: number;
}

// INNOVATION OPPORTUNITY: Create adaptive import system that works across sites
// CONSIDER: Machine learning for parsing, automatic site adaptation, intelligent error recovery
// CURRENT PROBLEM: Site-specific parsers break when sites change structure

// VALIDATION CRITERIA:
// - Import success rate achieves 95%+ across all supported sites
// - Import system adapts automatically to site changes
// - Failed imports provide actionable error messages with automatic retry
// - Import progress is shown with real-time visual feedback
// - Multiple imports can be queued and processed efficiently
// - Import interface is fully accessible with progress announcements
```

#### Position Tracking System - Innovation Challenge
```typescript
// FEATURE: position-tracking
// DEPENDENCIES: [basic-reader, settings-system]
// STATUS: optional
// INNOVATION OPPORTUNITY: Completely rethink position tracking approach

// CURRENT PROBLEM: Existing position tracking loses position after inactivity, 
// achieves only 88% accuracy (target: 95%), produces excessive logging
// See current-state-analysis.md for detailed problem analysis

// CHALLENGE: Design a fundamentally better approach than scroll-based tracking
// CONSIDER: Text fingerprinting, content-aware positioning, intelligent timing

interface PositionTrackingSystem {
  // Design your own interface - don't be constrained by current approach
  // Focus on solving the core problem: reliable position persistence
  
  // CORE REQUIREMENTS (how you achieve these is up to you):
  // - 95%+ accuracy in position restoration
  // - Zero position loss during inactivity
  // - Minimal performance impact on reading
  // - Works across all content types and devices
  // - Completely transparent to users
}

// VALIDATION CRITERIA:
// - Position restoration achieves 95%+ accuracy across all content types
// - No position loss occurs during any usage scenario (including inactivity)
// - Position tracking has minimal performance impact (<1% CPU, <5MB memory)
// - System works reliably offline and syncs when online
// - Users never notice position tracking working, but always return to exact position
// - Comprehensive testing proves superiority over current implementation

// INNOVATION FREEDOM:
// - Completely redesign the data structures
// - Use novel positioning algorithms (text-based, content-aware, etc.)
// - Implement intelligent save timing (not fixed intervals)
// - Create multi-strategy restoration with graceful fallbacks
// - Consider modern web APIs for better reliability
```

## VALIDATION_CRITERIA

### Code Quality Requirements
```typescript
// MANDATORY: All code must pass these validation checks

interface CodeQualityChecks {
  typescript: {
    strictMode: true;
    noAnyTypes: true;
    explicitReturnTypes: true;
    noImplicitReturns: true;
  };
  
  react: {
    functionalComponents: true;
    propsInterface: true;
    displayName: true;
    keyPropForLists: true;
    useCallbackForEventHandlers: true;
  };
  
  accessibility: {
    wcagAACompliance: true;
    ariaLabels: true;
    keyboardNavigation: true;
    colorContrast: 4.5; // minimum ratio
    focusManagement: true;
  };
  
  performance: {
    bundleSize: 250; // KB max
    renderTime: 16; // ms max
    memoryUsage: 50; // MB max
    coreWebVitals: {
      lcp: 2500, // ms max
      fid: 100, // ms max
      cls: 0.1, // max
    };
  };
  
  testing: {
    unitTestCoverage: 85; // % minimum
    integrationTests: true;
    accessibilityTests: true;
    e2eTests: true;
    performanceTests: true;
  };
}
```

### Acceptance Criteria Format
```markdown
# MANDATORY: All features must have acceptance criteria in this format

## Feature: [Feature Name]

### User Story
As a [user type], I want [functionality] so that [benefit].

### Acceptance Criteria
1. GIVEN [initial condition] WHEN [action] THEN [expected result]
2. GIVEN [initial condition] WHEN [action] THEN [expected result]
3. GIVEN [initial condition] WHEN [action] THEN [expected result]

### Error Scenarios
1. GIVEN [error condition] WHEN [action] THEN [error handling]
2. GIVEN [error condition] WHEN [action] THEN [error handling]

### Accessibility Requirements
1. WHEN using keyboard navigation THEN all interactive elements are accessible
2. WHEN using screen reader THEN all content is properly announced
3. WHEN checking color contrast THEN all text meets WCAG AA standards

### Performance Requirements
1. WHEN loading the feature THEN it loads in <2.5 seconds
2. WHEN using the feature THEN memory usage stays <50MB
3. WHEN bundling the feature THEN it adds <50KB to bundle size
```

## TESTING_REQUIREMENTS

### Unit Test Pattern
```typescript
// MANDATORY: All components must have tests following this pattern
describe('[ComponentName]', () => {
  // Test data setup
  const mockProps = {
    [propName]: [mockValue],
  };
  
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks and clear state
    jest.clearAllMocks();
  });
  
  // Rendering tests
  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<[ComponentName] {...mockProps} />);
      
      expect(screen.getByTestId('[component-test-id]')).toBeInTheDocument();
      expect(screen.getByText('[expected-text]')).toBeInTheDocument();
    });
    
    it('applies custom className', () => {
      const customClass = 'custom-class';
      render(<[ComponentName] {...mockProps} className={customClass} />);
      
      expect(screen.getByTestId('[component-test-id]')).toHaveClass(customClass);
    });
  });
  
  // Interaction tests
  describe('Interactions', () => {
    it('handles [interaction] correctly', async () => {
      const mockHandler = jest.fn();
      render(<[ComponentName] {...mockProps} on[Event]={mockHandler} />);
      
      await user.[interaction](screen.getByTestId('[interactive-element]'));
      
      expect(mockHandler).toHaveBeenCalledWith([expectedArgs]);
    });
  });
  
  // Accessibility tests
  describe('Accessibility', () => {
    it('meets WCAG AA standards', async () => {
      const { container } = render(<[ComponentName] {...mockProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    it('supports keyboard navigation', async () => {
      render(<[ComponentName] {...mockProps} />);
      
      const element = screen.getByTestId('[interactive-element]');
      element.focus();
      
      expect(element).toHaveFocus();
      
      await user.keyboard('{Enter}');
      // Assert expected behavior
    });
  });
  
  // Performance tests
  describe('Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now();
      
      render(<[ComponentName] {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 16ms (60fps)
      expect(renderTime).toBeLessThan(16);
    });
  });
});
```

## ERROR_HANDLING

### Error Classification
```typescript
// MANDATORY: All errors must be classified and handled appropriately
enum ErrorSeverity {
  LOW = 'low',           // Non-blocking, user can continue
  MEDIUM = 'medium',     // Affects functionality, user should be notified
  HIGH = 'high',         // Blocks functionality, requires user action
  CRITICAL = 'critical'  // System failure, requires immediate attention
}

enum ErrorCategory {
  VALIDATION = 'validation',     // User input validation errors
  NETWORK = 'network',          // Network and API errors
  STORAGE = 'storage',          // Database and storage errors
  PERMISSION = 'permission',    // Authentication and authorization errors
  SYSTEM = 'system',           // System and runtime errors
  UNKNOWN = 'unknown'          // Unclassified errors
}

interface ErrorInfo {
  message: string;
  code: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}
```

### Error Handling Patterns
```typescript
// MANDATORY: Use these patterns for all error handling

// 1. Component Error Handling
const useErrorHandler = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  
  const handleError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      code: error.name,
      severity: classifyErrorSeverity(error),
      category: classifyErrorCategory(error),
      context,
      timestamp: new Date(),
      sessionId: getSessionId(),
    };
    
    setError(errorInfo);
    logError(errorInfo);
    
    // Show user notification based on severity
    if (errorInfo.severity === ErrorSeverity.HIGH || errorInfo.severity === ErrorSeverity.CRITICAL) {
      showErrorNotification(errorInfo);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return { error, handleError, clearError };
};

// 2. Async Operation Error Handling
const useAsyncOperation = <T>(operation: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  
  const execute = useCallback(async () => {
    setLoading(true);
    clearError();
    
    try {
      const result = await operation();
      setData(result);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [operation, handleError, clearError]);
  
  return { data, loading, error, execute };
};
```

## DEPLOYMENT_PROCESS

### Build Validation
```bash
# MANDATORY: All builds must pass these validation steps

# 1. Type checking
npm run type-check

# 2. Linting
npm run lint

# 3. Unit tests
npm run test:unit

# 4. Integration tests
npm run test:integration

# 5. E2E tests
npm run test:e2e

# 6. Accessibility tests
npm run test:a11y

# 7. Performance audit
npm run audit:performance

# 8. Bundle size check
npm run audit:bundle-size

# 9. Security scan
npm run audit:security

# 10. Build production
npm run build
```

### Deployment Checklist
```markdown
# MANDATORY: Complete this checklist before deployment

## Pre-Deployment
- [ ] All tests pass (unit, integration, E2E, accessibility)
- [ ] Code coverage meets minimum threshold (85%)
- [ ] Performance audit passes (Core Web Vitals green)
- [ ] Bundle size within limits (<250KB gzipped)
- [ ] Security scan passes (no high/critical vulnerabilities)
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Feature flags configured correctly
- [ ] Database migrations tested (if applicable)

## Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Verify all features work correctly
- [ ] Check performance metrics
- [ ] Deploy to production
- [ ] Verify production deployment

## Post-Deployment
- [ ] Monitor error rates and performance
- [ ] Verify user flows work correctly
- [ ] Check accessibility compliance
- [ ] Monitor Core Web Vitals
- [ ] Verify offline functionality
```

---

**IMPLEMENTATION INSTRUCTIONS**: Follow this specification exactly. Use the provided patterns without deviation. Validate against all criteria before considering any feature complete. Test comprehensively at every step. Maintain 85%+ test coverage and 100% WCAG 2.1 AA compliance.