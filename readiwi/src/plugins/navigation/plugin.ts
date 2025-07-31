import { BasePlugin } from '@/core/utils/base-plugin';
import { navigationService } from './services/navigation-service';
import { Sidebar, NavigationSection, NavigationItem } from './components';

export class NavigationPlugin extends BasePlugin {
  public readonly id = 'navigation';
  public readonly name = 'Navigation Plugin';
  public readonly version = '1.0.0';
  public readonly dependencies: string[] = [];

  async initialize(): Promise<void> {
    await super.initialize();
    
    try {
      await navigationService.initialize();
      this.log('Navigation service initialized successfully');
    } catch (error) {
      throw this.handleError(error, 'Failed to initialize navigation service');
    }
  }

  async activate(): Promise<void> {
    await super.activate();
    
    try {
      // Any additional activation logic can go here
      this.log('Navigation plugin activated successfully');
    } catch (error) {
      throw this.handleError(error, 'Failed to activate navigation plugin');
    }
  }

  async deactivate(): Promise<void> {
    await super.deactivate();
    
    try {
      // Any deactivation cleanup logic can go here
      this.log('Navigation plugin deactivated successfully');
    } catch (error) {
      throw this.handleError(error, 'Failed to deactivate navigation plugin');
    }
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    
    try {
      await navigationService.cleanup();
      this.log('Navigation service cleaned up successfully');
    } catch (error) {
      throw this.handleError(error, 'Failed to cleanup navigation service');
    }
  }

  registerComponents(): Record<string, React.ComponentType<any>> {
    return {
      Sidebar, 
      NavigationSection,
      NavigationItem,
    };
  }

  registerRoutes(): Record<string, any> {
    // Navigation plugin doesn't register any routes
    // It's meant to be used within other components/layouts
    return {};
  }

  registerStores(): Record<string, any> {
    // Store is already exported as a hook from the store file
    // Plugin registry doesn't need to manage Zustand stores directly
    return {};
  }

  registerServices(): Record<string, any> {
    return {
      navigationService,
    };
  }
}

// Export plugin instance
export const navigationPlugin = new NavigationPlugin();