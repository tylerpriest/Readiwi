/**
 * Settings Plugin - Readiwi v4.0
 * Plugin registration for settings functionality
 */

import React from 'react';
import { BasePlugin } from '@/core/utils/base-plugin';
import { ComponentRegistry, RouteRegistry, StoreRegistry, ServiceRegistry } from '@/core/types/plugin';

class SettingsPlugin extends BasePlugin {
  id = 'settings';
  name = 'Settings Manager';
  version = '1.0.0';
  dependencies = [];
  enabled = true;

  async initialize(): Promise<void> {
    console.log('[Settings Plugin] Initializing settings system...');
  }

  async activate(): Promise<void> {
    console.log('[Settings Plugin] Settings system activated');
  }

  async deactivate(): Promise<void> {
    console.log('[Settings Plugin] Settings system deactivated');
  }

  async cleanup(): Promise<void> {
    console.log('[Settings Plugin] Settings system cleaned up');
  }

  registerComponents(): ComponentRegistry {
    return {
      'settings-page': React.lazy(() => import('./components/SettingsPage')),
      'reading-settings': React.lazy(() => import('./components/ReadingSettings')),
      'audio-settings': React.lazy(() => import('./components/AudioSettings')),
      'import-settings': React.lazy(() => import('./components/ImportSettings')),
      'privacy-settings': React.lazy(() => import('./components/PrivacySettings')),
      'accessibility-settings': React.lazy(() => import('./components/AccessibilitySettings')),
      'keyboard-settings': React.lazy(() => import('./components/KeyboardSettings')),
    };
  }

  registerRoutes(): RouteRegistry {
    return {
      '/settings': () => import('./components/SettingsPage'),
    };
  }

  registerStores(): StoreRegistry {
    return {
      'settings-store': () => import('./stores/settings-store'),
    };
  }

  registerServices(): ServiceRegistry {
    return {
      'settings-service': () => import('./services/settings-service'),
    };
  }
}

export default new SettingsPlugin();