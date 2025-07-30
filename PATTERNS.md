# Mandatory Code Patterns - Readiwi v4.0

**Purpose**: Exact code structures required for consistency and autonomous development
**Rule**: Follow these patterns exactly - no deviation allowed

## Component Pattern (Copy exactly)

```typescript
import { cn } from '@/core/utils/cn';

interface ComponentNameProps {
  // Required props with JSDoc
  propName: Type; // @description Purpose of this prop
  
  // Optional standard props
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  className,
  'data-testid': testId,
  children,
  ...props
}) => {
  // 1. State hooks (if needed)
  const [localState, setLocalState] = useState<Type>(initialValue);
  
  // 2. Store subscriptions (if needed)
  const { data, actions } = useStoreName();
  
  // 3. Event handlers with useCallback for performance
  const handleEvent = useCallback((params: Types) => {
    try {
      // Implementation with error handling
      actions.actionName(params);
    } catch (error) {
      console.error(`Error in ${ComponentName}.handleEvent:`, error);
    }
  }, [dependencies]);
  
  // 4. Effects (if needed)
  useEffect(() => {
    // Effect implementation
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
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

ComponentName.displayName = 'ComponentName';
export default ComponentName;
```

## Store Pattern (Zustand - Copy exactly)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const useStoreName = create<StoreNameState>()(
  persist(
    (set, get) => ({
      // Initial state
      dataField: initialValue,
      loading: false,
      error: null,
      lastUpdated: 0,
      
      // Computed selectors
      get selectorName() {
        return computation based on get();
      },
      
      // Synchronous actions
      syncAction: (params) => {
        set((state) => ({
          ...state,
          dataField: newValue,
          lastUpdated: Date.now(),
        }));
      },
      
      // Asynchronous actions with error handling
      asyncAction: async (params) => {
        set({ loading: true, error: null });
        
        try {
          const result = await serviceCall(params);
          set((state) => ({
            ...state,
            dataField: result,
            loading: false,
            lastUpdated: Date.now(),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      
      // Reset action
      reset: () => {
        set({
          dataField: initialValue,
          loading: false,
          error: null,
          lastUpdated: 0,
        });
      },
    }),
    {
      name: 'storeName-storage',
      partialize: (state) => ({
        dataField: state.dataField,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

export default useStoreName;
```

## Plugin Pattern (ALL features must implement)

```typescript
import { Plugin, ComponentRegistry, RouteRegistry, StoreRegistry, ServiceRegistry } from '@/core/types/plugin';

interface FeatureNamePlugin extends Plugin {
  // Plugin-specific properties
}

class FeatureNamePlugin implements Plugin {
  id = 'feature-name';
  name = 'Feature Name';
  version = '1.0.0';
  dependencies = ['dependency-plugin-id'];
  enabled = true;

  async initialize(): Promise<void> {
    // Initialize plugin resources
  }

  async activate(): Promise<void> {
    // Activate plugin functionality
  }

  async deactivate(): Promise<void> {
    // Deactivate plugin functionality
  }

  async cleanup(): Promise<void> {
    // Clean up plugin resources
  }

  registerComponents(): ComponentRegistry {
    return {
      'feature-component': () => import('./components/FeatureComponent'),
    };
  }

  registerRoutes(): RouteRegistry {
    return {
      '/feature': () => import('./pages/FeaturePage'),
    };
  }

  registerStores(): StoreRegistry {
    return {
      'feature-store': () => import('./stores/feature-store'),
    };
  }

  registerServices(): ServiceRegistry {
    return {
      'feature-service': () => import('./services/feature-service'),
    };
  }
}

export default new FeatureNamePlugin();
```

## Error Handling Pattern

```typescript
// Custom error class
class FeatureNameError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FeatureNameError';
  }
}

// Error boundary component
const FeatureNameErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<FeatureNameErrorFallback />}
      onError={(error, errorInfo) => {
        console.error(`[FeatureName] Error:`, error);
        // Log to error tracking
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

## Test Pattern (Follow exactly)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ComponentName from '../ComponentName';

expect.extend(toHaveNoViolations);

describe('ComponentName', () => {
  const defaultProps = {
    propName: mockValue,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByTestId('component-test-id')).toBeInTheDocument();
      expect(screen.getByText('expected-text')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles interaction correctly', async () => {
      const mockHandler = jest.fn();
      render(<ComponentName {...defaultProps} onEvent={mockHandler} />);
      
      await userEvent.click(screen.getByTestId('interactive-element'));
      
      expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
    });
  });

  describe('Accessibility', () => {
    it('meets WCAG AA standards', async () => {
      const { container } = render(<ComponentName {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

## Database Pattern (IndexedDB with Dexie)

```typescript
import Dexie, { Table } from 'dexie';

interface Entity {
  id?: number;
  // Entity properties
  createdAt: Date;
  updatedAt: Date;
}

class Database extends Dexie {
  entities!: Table<Entity>;

  constructor() {
    super('DatabaseName');
    
    this.version(1).stores({
      entities: '++id, field1, field2, createdAt, updatedAt',
    });
  }
}

export const db = new Database();

// Repository pattern
export class EntityRepository {
  async create(entity: Omit<Entity, 'id'>): Promise<number> {
    const now = new Date();
    return await db.entities.add({
      ...entity,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findById(id: number): Promise<Entity | undefined> {
    return await db.entities.get(id);
  }

  async findAll(): Promise<Entity[]> {
    return await db.entities.orderBy('updatedAt').reverse().toArray();
  }

  async update(id: number, updates: Partial<Entity>): Promise<void> {
    await db.entities.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    await db.entities.delete(id);
  }
}
```

## Styling Pattern (Tailwind + CSS Variables)

```typescript
// Component styling with design tokens
const baseClasses = [
  'flex items-center gap-2',
  'p-4 rounded-lg',
  'bg-surface border border-border',
  'text-text-primary',
  'transition-colors duration-200',
  'hover:bg-surface-hover',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
].join(' ');

// Conditional styling
const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
};

// Size variants
const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
```

## File Naming Conventions

```
Components:     ComponentName.tsx
Stores:         feature-store.ts  
Services:       feature-service.ts
Types:          feature-types.ts
Tests:          ComponentName.test.tsx
Utilities:      utility-name.ts
Constants:      CONSTANT_NAME.ts
```

## Import/Export Pattern

```typescript
// Named exports for utilities
export const utilityFunction = () => {};
export const CONSTANT_VALUE = 'value';

// Default export for components/stores
export default ComponentName;

// Re-exports from index files
export { default as ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

---

**Rules**: 
- Copy these patterns exactly when implementing
- No deviation from structure or naming
- All patterns are mandatory for consistency
- Test every component using the test pattern