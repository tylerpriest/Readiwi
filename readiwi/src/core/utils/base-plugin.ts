import {
  Plugin,
  ComponentRegistry,
  RouteRegistry,
  StoreRegistry,
  ServiceRegistry,
} from '@/core/types/plugin';

class EmptyComponentRegistry implements ComponentRegistry {
  components = new Map<string, React.ComponentType<any>>();

  register(): void {
    // Default empty implementation
  }

  get(): React.ComponentType<any> | undefined {
    return undefined;
  }

  getAll(): Map<string, React.ComponentType<any>> {
    return new Map();
  }
}

class EmptyRouteRegistry implements RouteRegistry {
  routes = new Map<string, any>();

  register(): void {
    // Default empty implementation
  }

  get(): any {
    return undefined;
  }

  getAll(): Map<string, any> {
    return new Map();
  }
}

class EmptyStoreRegistry implements StoreRegistry {
  stores = new Map<string, any>();

  register(): void {
    // Default empty implementation
  }

  get(): any {
    return undefined;
  }

  getAll(): Map<string, any> {
    return new Map();
  }
}

class EmptyServiceRegistry implements ServiceRegistry {
  services = new Map<string, any>();

  register(): void {
    // Default empty implementation
  }

  get(): any {
    return undefined;
  }

  getAll(): Map<string, any> {
    return new Map();
  }
}

export abstract class BasePlugin implements Plugin {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly version: string;
  public abstract readonly dependencies: string[];
  public enabled = false;

  // Default lifecycle implementations
  async initialize(): Promise<void> {
    console.log(`Initializing plugin: ${this.name}`);
  }

  async activate(): Promise<void> {
    console.log(`Activating plugin: ${this.name}`);
    this.enabled = true;
  }

  async deactivate(): Promise<void> {
    console.log(`Deactivating plugin: ${this.name}`);
    this.enabled = false;
  }

  async cleanup(): Promise<void> {
    console.log(`Cleaning up plugin: ${this.name}`);
  }

  // Default registry implementations (can be overridden)
  registerComponents(): ComponentRegistry {
    return new EmptyComponentRegistry();
  }

  registerRoutes(): RouteRegistry {
    return new EmptyRouteRegistry();
  }

  registerStores(): StoreRegistry {
    return new EmptyStoreRegistry();
  }

  registerServices(): ServiceRegistry {
    return new EmptyServiceRegistry();
  }

  // Utility method for plugin logging
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const prefix = `[${this.name}]`;
    switch (level) {
      case 'info':
        console.log(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      case 'error':
        console.error(prefix, message);
        break;
    }
  }

  // Utility method for error handling
  protected handleError(error: unknown, context?: string): Error {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const fullMessage = context ? `${context}: ${message}` : message;
    this.log(fullMessage, 'error');
    return new Error(fullMessage);
  }
}