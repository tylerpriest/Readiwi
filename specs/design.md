# Narrato v4.0 - Complete System Design

**Version**: 4.0.0  
**Created**: 2025-07-29  
**Purpose**: Complete technical architecture and system design for autonomous development  
**Dependencies**: requirements.md, design-system.md, data-architecture.md

## Architecture Overview

Narrato v4.0 is designed as a modern, offline-first web application with a focus on autonomous development, innovation opportunities, and production-ready quality. The architecture emphasizes modularity, performance, and accessibility.

### System Design Principles

- **Innovation-Driven**: Challenges AI agents to create fundamentally better solutions
- **Offline-First**: All core functionality works without internet connectivity
- **Mobile-First**: Optimized for mobile devices with responsive design
- **Accessibility-First**: WCAG 2.1 AA compliance built into every component
- **Performance-First**: 60fps interactions with Core Web Vitals targets
- **Modular Architecture**: Plugin-based features with clear boundaries

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 14 App Router                   │
├─────────────────────────────────────────────────────────────────┤
│  Authentication  │  Library  │  Reader  │  Audio  │  Settings  │
├─────────────────────────────────────────────────────────────────┤
│                     Zustand State Management                   │
├─────────────────────────────────────────────────────────────────┤
│  Position Tracking  │  Import System  │  Parser Management    │
├─────────────────────────────────────────────────────────────────┤
│                    IndexedDB (Dexie)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Modular Plugin-Based File Structure

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
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── stores/             # Auth state management
│   │   │   └── auth-store.ts
│   │   ├── services/           # Auth business logic
│   │   │   ├── auth-service.ts
│   │   │   └── session-manager.ts
│   │   ├── types/              # Auth type definitions
│   │   │   └── auth-types.ts
│   │   ├── plugin.ts           # Plugin registration
│   │   └── index.ts            # Plugin exports
│   │
│   ├── book-library/           # Library management plugin
│   │   ├── components/
│   │   │   ├── BookGrid.tsx
│   │   │   ├── BookCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── stores/
│   │   │   └── library-store.ts
│   │   ├── services/
│   │   │   ├── library-service.ts
│   │   │   └── search-service.ts
│   │   ├── types/
│   │   │   └── library-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── reader/                 # Reading interface plugin
│   │   ├── components/
│   │   │   ├── ReaderLayout.tsx
│   │   │   ├── ChapterContent.tsx
│   │   │   ├── ReaderHeader.tsx
│   │   │   └── ChapterNavigation.tsx
│   │   ├── stores/
│   │   │   └── reader-store.ts
│   │   ├── services/
│   │   │   ├── reader-service.ts
│   │   │   └── chapter-service.ts
│   │   ├── types/
│   │   │   └── reader-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── settings/               # Settings management plugin
│   │   ├── components/
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── SettingItem.tsx
│   │   │   └── SettingCategory.tsx
│   │   ├── stores/
│   │   │   └── settings-store.ts
│   │   ├── services/
│   │   │   └── settings-service.ts
│   │   ├── types/
│   │   │   └── settings-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── book-import/            # Book import plugin
│   │   ├── components/
│   │   │   ├── ImportDialog.tsx
│   │   │   ├── ImportProgress.tsx
│   │   │   └── ImportQueue.tsx
│   │   ├── stores/
│   │   │   └── import-store.ts
│   │   ├── services/
│   │   │   ├── import-service.ts
│   │   │   └── queue-manager.ts
│   │   ├── types/
│   │   │   └── import-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── parser-management/      # Parser system plugin
│   │   ├── components/
│   │   │   ├── ParserManager.tsx
│   │   │   └── ParserCard.tsx
│   │   ├── stores/
│   │   │   └── parser-store.ts
│   │   ├── services/
│   │   │   ├── parser-manager.ts
│   │   │   └── parsers/
│   │   │       ├── royal-road.ts
│   │   │       ├── readnovelfull.ts
│   │   │       ├── freewebnovel.ts
│   │   │       └── generic.ts
│   │   ├── types/
│   │   │   └── parser-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── position-tracking/      # Position tracking plugin (INNOVATION CHALLENGE)
│   │   ├── components/
│   │   │   └── PositionIndicator.tsx
│   │   ├── stores/
│   │   │   └── position-store.ts
│   │   ├── services/
│   │   │   ├── position-tracker.ts    # INNOVATION OPPORTUNITY
│   │   │   ├── restoration-engine.ts  # INNOVATION OPPORTUNITY
│   │   │   └── accuracy-monitor.ts
│   │   ├── types/
│   │   │   └── position-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── reading-customization/  # Reading customization plugin
│   │   ├── components/
│   │   │   ├── CustomizationPanel.tsx
│   │   │   ├── FontSelector.tsx
│   │   │   └── ThemeSelector.tsx
│   │   ├── stores/
│   │   │   └── customization-store.ts
│   │   ├── services/
│   │   │   └── customization-service.ts
│   │   ├── types/
│   │   │   └── customization-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   ├── audio-system/           # Audio/TTS plugin
│   │   ├── components/
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── AudioControls.tsx
│   │   │   └── VoiceSelector.tsx
│   │   ├── stores/
│   │   │   └── audio-store.ts
│   │   ├── services/
│   │   │   ├── tts-service.ts
│   │   │   ├── audio-sync.ts        # INNOVATION OPPORTUNITY
│   │   │   └── voice-manager.ts
│   │   ├── types/
│   │   │   └── audio-types.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   │
│   └── search-discovery/       # Advanced search plugin
│       ├── components/
│       │   ├── AdvancedSearch.tsx
│       │   └── SearchResults.tsx
│       ├── stores/
│       │   └── search-store.ts
│       ├── services/
│       │   ├── search-engine.ts     # INNOVATION OPPORTUNITY
│       │   └── indexing-service.ts
│       ├── types/
│       │   └── search-types.ts
│       ├── plugin.ts
│       └── index.ts
│
├── styles/                     # Global styles and design system
│   ├── globals.css            # Global CSS with design tokens
│   ├── components.css         # Component-specific styles
│   └── themes.css             # Theme definitions
│
└── tests/                     # Testing infrastructure
    ├── unit/                  # Unit tests by plugin
    │   ├── authentication/
    │   ├── book-library/
    │   └── [other-plugins]/
    ├── integration/           # Integration tests
    └── e2e/                   # End-to-end tests
```

## Innovation Challenges

### Position Tracking Innovation Challenge
**Current Problem**: Position tracking loses position after inactivity, achieves only 88% accuracy (target: 95%), produces excessive console logging
**Innovation Opportunity**: Design a fundamentally better approach than current scroll-based tracking - consider text-based positioning, content fingerprinting, intelligent save timing
**Success Target**: 95%+ accuracy with zero position loss, minimal performance impact
**Reference**: See `current-state-analysis.md` for detailed problem analysis

### Parser System Innovation Challenge
**Current Problem**: Site-specific parsers that break when sites change, brittle parsing logic
**Innovation Opportunity**: Create adaptive parsing that works across sites with automatic adaptation
**Success Target**: 95%+ import success rate across all supported sites

### Audio Synchronization Innovation Challenge
**Current Problem**: Approximate sync that sometimes fails, no real-time highlighting
**Innovation Opportunity**: Precise audio-text mapping with real-time highlighting and perfect synchronization
**Success Target**: Perfect synchronization with sub-second accuracy

## Component Architecture

### Core Components
- **Authentication System**: Secure user management with session persistence
- **Book Library**: Advanced search, filtering, and organization
- **Reader Interface**: Optimized reading experience with customization
- **Settings System**: Comprehensive configuration with real-time preview
- **Audio System**: Text-to-speech with position synchronization

### Enhancement Components
- **Import System**: Multi-site book importing with progress tracking
- **Parser Management**: Extensible parsing system with fallback strategies
- **Position Tracking**: Revolutionary position persistence system
- **Customization**: Real-time reading experience personalization

## Data Flow Architecture

```
User Action → Component → Store → Service → Database
     ↑                                        ↓
UI Update ← Component ← Store ← Service ← Data Layer
```

### State Management Strategy
- **Zustand**: Primary state management with persistence
- **React Context**: Component-specific state and providers
- **IndexedDB**: Offline-first data persistence
- **Local Storage**: Settings and preferences backup

## Performance Architecture

### Bundle Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Eliminate unused code automatically
- **Dynamic Imports**: Load features on demand
- **Service Worker**: Caching and offline functionality

### Runtime Performance
- **Virtual Scrolling**: Handle large book libraries efficiently
- **Memoization**: Optimize React rendering with React.memo
- **Debouncing**: Optimize search and position tracking
- **Web Workers**: Offload heavy processing from main thread

## Security Architecture

### Data Protection
- **Input Validation**: All user inputs validated and sanitized
- **Content Security Policy**: Strict CSP headers for XSS protection
- **Authentication**: Secure session management with token rotation
- **Local Storage**: No sensitive data in browser storage

### Privacy Design
- **Local-First**: All data stored locally by default
- **Optional Sync**: Cloud sync only when user explicitly enables
- **Minimal Data**: Collect only necessary data for functionality
- **User Control**: Full control over data sharing and deletion

## Accessibility Architecture

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full functionality via keyboard
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Focus Management**: Clear focus indicators and logical tab order

### Inclusive Design
- **Responsive Typography**: Scales from 12px to 24px
- **High Contrast Mode**: Support for user preferences
- **Reduced Motion**: Respect user motion preferences
- **Multiple Input Methods**: Touch, mouse, keyboard, voice

## Testing Architecture

### Comprehensive Testing Strategy
- **Unit Tests**: 85%+ coverage with Jest and React Testing Library
- **Integration Tests**: Component interactions and data flow
- **E2E Tests**: Critical user journeys with Playwright
- **Accessibility Tests**: Automated WCAG compliance with axe-core
- **Performance Tests**: Core Web Vitals and benchmark validation

### Quality Gates
- **Pre-commit**: Type checking, linting, unit tests
- **Pre-build**: Integration tests, bundle analysis, security audit
- **Pre-deployment**: E2E tests, accessibility tests, performance validation

## Deployment Architecture

### Build Process
- **TypeScript Compilation**: Strict mode with no any types
- **Bundle Optimization**: Minimize size while maintaining performance
- **Asset Optimization**: Images, fonts, and CSS optimization
- **Progressive Enhancement**: Core functionality without JavaScript

### Environment Strategy
- **Development**: Hot reloading with comprehensive error reporting
- **Staging**: Production-like environment for final validation
- **Production**: Optimized build with monitoring and error tracking

## Innovation Framework

### AI Agent Challenges
Instead of prescriptive implementation, the design presents **innovation challenges**:

1. **Position Tracking Challenge**: Create a system that never loses position
2. **Parser Innovation Challenge**: Build adaptive parsing that works across sites
3. **Audio Sync Challenge**: Achieve perfect audio-text synchronization
4. **Performance Challenge**: Maintain 60fps with large libraries
5. **Accessibility Challenge**: Exceed WCAG standards with innovative solutions

### Success Validation
Each innovation challenge includes:
- **Clear problem definition** with current limitations
- **Ambitious success criteria** that exceed current capabilities
- **Innovation freedom** to completely rethink approaches
- **Comprehensive validation** to prove superiority

## Plugin Architecture

### Plugin Interface
Each plugin follows a standardized interface for consistent integration:

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  
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
```

### Plugin Benefits
- **Modular Development**: Each feature is self-contained
- **Easy Testing**: Plugins can be tested in isolation
- **Flexible Deployment**: Features can be enabled/disabled
- **Clear Boundaries**: No cross-plugin dependencies
- **Innovation Freedom**: Each plugin can be completely reimagined

## Future Architecture Considerations

### Scalability Enhancements
- **Microservices**: Extract services for user accounts and sync
- **CDN Integration**: Global content delivery for better performance
- **Database Sharding**: Handle large user bases efficiently
- **Caching Layers**: Multi-level caching for optimal performance

### Platform Extensions
- **Mobile Apps**: React Native with shared business logic
- **Browser Extensions**: One-click import from web novel sites
- **Desktop Apps**: Electron wrapper for native experience
- **API Platform**: Public API for third-party integrations

### Advanced Features
- **Machine Learning**: Personalized recommendations and reading analytics
- **Social Features**: Reading communities and book sharing
- **Advanced Audio**: Custom voice training and audio bookmarks
- **Collaboration**: Shared reading lists and annotations

---

**Implementation Guidelines**: Use this design as the foundation for all development decisions. Focus on innovation challenges rather than prescriptive solutions. Validate all implementations against the success criteria defined in each challenge.