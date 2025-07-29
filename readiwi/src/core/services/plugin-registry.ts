import {
  Plugin,
  PluginRegistry,
  PluginMetadata,
  PluginStatus,
} from '@/core/types/plugin';

class ComponentRegistryImpl {
  public components = new Map<string, React.ComponentType<any>>();

  register(name: string, component: React.ComponentType<any>): void {
    this.components.set(name, component);
  }

  get(name: string): React.ComponentType<any> | undefined {
    return this.components.get(name);
  }

  getAll(): Map<string, React.ComponentType<any>> {
    return new Map(this.components);
  }
}

class RouteRegistryImpl {
  public routes = new Map<string, any>();

  register(path: string, route: any): void {
    this.routes.set(path, route);
  }

  get(path: string): any {
    return this.routes.get(path);
  }

  getAll(): Map<string, any> {
    return new Map(this.routes);
  }
}

class StoreRegistryImpl {
  public stores = new Map<string, any>();

  register(name: string, store: any): void {
    this.stores.set(name, store);
  }

  get(name: string): any {
    return this.stores.get(name);
  }

  getAll(): Map<string, any> {
    return new Map(this.stores);
  }
}

class ServiceRegistryImpl {
  public services = new Map<string, any>();

  register(name: string, service: any): void {
    this.services.set(name, service);
  }

  get(name: string): any {
    return this.services.get(name);
  }

  getAll(): Map<string, any> {
    return new Map(this.services);
  }
}

export class PluginRegistryImpl implements PluginRegistry {
  public plugins = new Map<string, Plugin>();
  public enabledPlugins = new Set<string>();
  private pluginMetadata = new Map<string, PluginMetadata>();
  private componentRegistry = new ComponentRegistryImpl();
  private routeRegistry = new RouteRegistryImpl();
  private storeRegistry = new StoreRegistryImpl();
  private serviceRegistry = new ServiceRegistryImpl();

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID '${plugin.id}' is already registered`);
    }

    // Validate dependencies
    for (const depId of plugin.dependencies) {
      if (!this.plugins.has(depId)) {
        throw new Error(`Plugin '${plugin.id}' depends on '${depId}' which is not registered`);
      }
    }

    this.plugins.set(plugin.id, plugin);
    this.pluginMetadata.set(plugin.id, {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      dependencies: plugin.dependencies,
      status: PluginStatus.LOADED,
      enabled: plugin.enabled,
      loadedAt: new Date(),
    });

    console.log(`Plugin '${plugin.name}' (${plugin.id}) registered successfully`);
  }

  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    if (this.enabledPlugins.has(pluginId)) {
      console.warn(`Plugin '${pluginId}' is already enabled`);
      return;
    }

    // Enable dependencies first
    for (const depId of plugin.dependencies) {
      if (!this.enabledPlugins.has(depId)) {
        await this.enable(depId);
      }
    }

    try {
      this.updatePluginStatus(pluginId, PluginStatus.INITIALIZING);
      
      await plugin.initialize();
      await plugin.activate();

      // Register plugin components, routes, stores, and services
      const components = plugin.registerComponents();
      const routes = plugin.registerRoutes();
      const stores = plugin.registerStores();
      const services = plugin.registerServices();

      // Merge registrations
      for (const [name, component] of Object.entries(components)) {
        this.componentRegistry.register(`${pluginId}.${name}`, component);
      }

      for (const [path, route] of Object.entries(routes)) {
        this.routeRegistry.register(`${pluginId}.${path}`, route);
      }

      for (const [name, store] of Object.entries(stores)) {
        this.storeRegistry.register(`${pluginId}.${name}`, store);
      }

      for (const [name, service] of Object.entries(services)) {
        this.serviceRegistry.register(`${pluginId}.${name}`, service);
      }

      this.enabledPlugins.add(pluginId);
      plugin.enabled = true;
      
      this.updatePluginStatus(pluginId, PluginStatus.ACTIVE);
      this.updatePluginMetadata(pluginId, { activatedAt: new Date() });

      console.log(`Plugin '${plugin.name}' (${pluginId}) enabled successfully`);
    } catch (error) {
      this.updatePluginStatus(pluginId, PluginStatus.ERROR);
      this.updatePluginMetadata(pluginId, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to enable plugin '${pluginId}': ${error}`);
    }
  }

  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    if (!this.enabledPlugins.has(pluginId)) {
      console.warn(`Plugin '${pluginId}' is not enabled`);
      return;
    }

    // Check if other enabled plugins depend on this one
    const dependents = this.getEnabled().filter(p => 
      p.dependencies.includes(pluginId)
    );

    if (dependents.length > 0) {
      throw new Error(
        `Cannot disable plugin '${pluginId}' as it is required by: ${dependents.map(p => p.id).join(', ')}`
      );
    }

    try {
      this.updatePluginStatus(pluginId, PluginStatus.DEACTIVATING);

      await plugin.deactivate();
      await plugin.cleanup();

      // Remove registrations
      this.componentRegistry.components.forEach((_, name) => {
        if (name.startsWith(`${pluginId}.`)) {
          this.componentRegistry.components.delete(name);
        }
      });

      this.routeRegistry.routes.forEach((_, path) => {
        if (path.startsWith(`${pluginId}.`)) {
          this.routeRegistry.routes.delete(path);
        }
      });

      this.storeRegistry.stores.forEach((_, name) => {
        if (name.startsWith(`${pluginId}.`)) {
          this.storeRegistry.stores.delete(name);
        }
      });

      this.serviceRegistry.services.forEach((_, name) => {
        if (name.startsWith(`${pluginId}.`)) {
          this.serviceRegistry.services.delete(name);
        }
      });

      this.enabledPlugins.delete(pluginId);
      plugin.enabled = false;
      
      this.updatePluginStatus(pluginId, PluginStatus.INACTIVE);

      console.log(`Plugin '${plugin.name}' (${pluginId}) disabled successfully`);
    } catch (error) {
      this.updatePluginStatus(pluginId, PluginStatus.ERROR);
      this.updatePluginMetadata(pluginId, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to disable plugin '${pluginId}': ${error}`);
    }
  }

  getEnabled(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is Plugin => plugin !== undefined);
  }

  getDependencies(pluginId: string): string[] {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.dependencies : [];
  }

  getMetadata(pluginId: string): PluginMetadata | undefined {
    return this.pluginMetadata.get(pluginId);
  }

  getAllMetadata(): PluginMetadata[] {
    return Array.from(this.pluginMetadata.values());
  }

  getComponentRegistry(): ComponentRegistryImpl {
    return this.componentRegistry;
  }

  getRouteRegistry(): RouteRegistryImpl {
    return this.routeRegistry;
  }

  getStoreRegistry(): StoreRegistryImpl {
    return this.storeRegistry;
  }

  getServiceRegistry(): ServiceRegistryImpl {
    return this.serviceRegistry;
  }

  private updatePluginStatus(pluginId: string, status: PluginStatus): void {
    const metadata = this.pluginMetadata.get(pluginId);
    if (metadata) {
      metadata.status = status;
      if (status === PluginStatus.ERROR) {
        console.error(`Plugin '${pluginId}' encountered an error`);
      }
    }
  }

  private updatePluginMetadata(pluginId: string, updates: Partial<PluginMetadata>): void {
    const metadata = this.pluginMetadata.get(pluginId);
    if (metadata) {
      Object.assign(metadata, updates);
    }
  }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistryImpl();