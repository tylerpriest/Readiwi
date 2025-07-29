import {
  Plugin,
} from '@/core/types/plugin';


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
  registerComponents(): Record<string, React.ComponentType<any>> {
    return {};
  }

  registerRoutes(): Record<string, any> {
    return {};
  }

  registerStores(): Record<string, any> {
    return {};
  }

  registerServices(): Record<string, any> {
    return {};
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