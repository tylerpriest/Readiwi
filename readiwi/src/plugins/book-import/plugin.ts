/**
 * Book Import Plugin - Readiwi v4.0
 * Plugin for importing books from web sources
 */

import React from 'react';
import { Plugin, ComponentRegistry, RouteRegistry, StoreRegistry, ServiceRegistry } from '@/core/types/plugin';

class BookImportPluginImpl implements Plugin {
  id = 'book-import';
  name = 'Book Import';
  version = '1.0.0';
  dependencies = ['book-library', 'settings'];
  enabled = true;

  async initialize(): Promise<void> {
    console.log('Book Import plugin initialized');
  }

  async activate(): Promise<void> {
    console.log('Book Import plugin activated');
  }

  async deactivate(): Promise<void> {
    console.log('Book Import plugin deactivated');
  }

  async cleanup(): Promise<void> {
    console.log('Book Import plugin cleaned up');
  }

  registerComponents(): ComponentRegistry {
    return {
      'import-view': React.lazy(() => import('./components/ImportView')),
    };
  }

  registerRoutes(): RouteRegistry {
    return {};
  }

  registerStores(): StoreRegistry {
    return {};
  }

  registerServices(): ServiceRegistry {
    return {
      'import-service': () => import('./services/import-service'),
    };
  }
}

export const bookImportPlugin = new BookImportPluginImpl();