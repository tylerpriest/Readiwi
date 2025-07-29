import { ComponentType } from 'react';

export interface ComponentRegistry {
  [key: string]: ComponentType<any>;
}

export interface RouteRegistry {
  [key: string]: RouteDefinition;
}

export interface StoreRegistry {
  [key: string]: any;
}

export interface ServiceRegistry {
  [key: string]: any;
}

export interface RouteDefinition {
  component: ComponentType<any>;
  layout?: ComponentType<any>;
  metadata?: {
    title?: string;
    description?: string;
    requiresAuth?: boolean;
    permissions?: string[];
  };
}

export interface Plugin {
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

export interface PluginRegistry {
  plugins: Map<string, Plugin>;
  enabledPlugins: Set<string>;
  
  register(plugin: Plugin): void;
  enable(pluginId: string): Promise<void>;
  disable(pluginId: string): Promise<void>;
  getEnabled(): Plugin[];
  getDependencies(pluginId: string): string[];
}

export interface PluginContext {
  config: PluginConfig;
  dependencies: Map<string, Plugin>;
  services: ServiceRegistry;
  stores: StoreRegistry;
}

export interface PluginConfig {
  [key: string]: any;
}

export enum PluginStatus {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies: string[];
  status: PluginStatus;
  enabled: boolean;
  loadedAt?: Date;
  activatedAt?: Date;
  error?: string;
}