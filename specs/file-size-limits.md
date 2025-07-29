# File Size Limits and Best Practices

This document outlines file size best practices for the Readiwi codebase, a Next.js 14 application with React, TypeScript, and Tailwind CSS.

## File Size Guidelines

### JavaScript/TypeScript Files

#### Components
- **React Components**: 150-300 lines max
  - Single responsibility principle
  - Extract custom hooks if logic exceeds 50 lines
  - Split large components into smaller, composable parts

#### Hooks
- **Custom Hooks**: 50-100 lines max
  - Focus on single concern (data fetching, state management, etc.)
  - Extract complex logic into utility functions

#### Pages
- **Next.js Pages**: 200 lines max
  - Keep pages thin - delegate to components and hooks
  - Use layout components for shared structure

#### Utilities
- **Utility Functions**: 30-50 lines per function
  - Pure functions with single responsibility
  - Group related utilities in files of 200-300 lines max

#### Stores (Zustand)
- **Store Files**: 300-500 lines max
  - Split large stores by domain (auth, books, settings)
  - Use store slices for complex state

#### API Routes
- **Route Handlers**: 100-200 lines max
  - Extract business logic to service functions
  - Keep routes focused on HTTP concerns

### CSS/Styling

#### Tailwind CSS
- **Component Files**: Prefer Tailwind utilities over custom CSS
- **Global CSS**: 500 lines max in `globals.css`
- **Custom CSS**: Extract to component-level CSS modules if needed

### Assets

#### Images
- **Icons**: SVG preferred, <10KB each
- **Images**: Optimize with Next.js Image component
  - Development images: <500KB
  - Production images: <200KB
  - Use WebP format when possible

#### Fonts
- **Web Fonts**: <100KB per font file
- **Font Families**: Limit to 2-3 font families max

### Data Files

#### Mock Data
- **Mock Files**: 100-300 lines max
- **Test Data**: Split large datasets into multiple files
- **JSON Files**: <50KB for development, <10KB for production

#### Configuration
- **Config Files**: 100 lines max
- **Environment Files**: 50 variables max

## File Organization Rules

### Directory Structure
```
components/
├── ui/              # Small, reusable components (50-100 lines)
├── common/          # Shared components (100-200 lines)
├── [feature]/       # Feature-specific components (150-300 lines)

lib/
├── hooks/           # Custom hooks (50-100 lines)
├── utils/           # Utility functions (200-300 lines per file)
├── stores/          # Zustand stores (300-500 lines)
└── parsers/         # Parser modules (200-400 lines)
```

### Splitting Guidelines

#### When to Split Components
- **Line count**: >300 lines
- **Multiple responsibilities**: Extract sub-components
- **Complex state**: Move to custom hooks
- **Reusability**: Create shared components

#### When to Split Utilities
- **Related functions**: Group by domain
- **File size**: >300 lines total
- **Import frequency**: Highly-used functions in separate files

#### When to Split Stores
- **Domain separation**: Auth, books, settings, etc.
- **File size**: >500 lines
- **Team boundaries**: Different teams working on different features

## Performance Considerations

### Bundle Size Impact
- **Component chunks**: Aim for <50KB per route chunk
- **Shared chunks**: Common components <100KB
- **Dynamic imports**: Use for large, optional features

### Runtime Performance
- **Large lists**: Implement virtualization for >100 items
- **Heavy components**: Use React.memo and useMemo strategically
- **Data processing**: Move heavy operations to Web Workers

## Monitoring and Enforcement

### Tools
- **Bundle Analyzer**: `npm run build && npx @next/bundle-analyzer`
- **ESLint Rules**: Configure max-lines rules
- **Git Hooks**: Check file sizes in pre-commit

### Metrics to Track
- **Individual file sizes**: Alert on >500 lines
- **Bundle sizes**: Monitor chunk size growth
- **Build time**: Watch for increases indicating complexity

### Code Review Checklist
- [ ] No single file >500 lines
- [ ] Components have single responsibility
- [ ] Large assets are optimized
- [ ] Complex logic is extracted to utilities
- [ ] Store updates don't affect unrelated state

## Refactoring Strategies

### Large Component Breakdown
1. Identify distinct UI sections
2. Extract sub-components
3. Move state to custom hooks
4. Create shared utility functions

### Store Optimization
1. Split by feature domain
2. Use selectors for performance
3. Implement store slices
4. Extract computed values

### Asset Optimization
1. Use Next.js Image optimization
2. Implement lazy loading
3. Compress and convert to modern formats
4. Remove unused assets

---

**Note**: These are guidelines, not rigid rules. Consider the specific context and team needs when applying these limits. The goal is maintainability, performance, and developer experience.