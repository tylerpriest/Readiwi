/**
 * Settings Plugin - Readiwi v4.0
 * Plugin registration for settings functionality
 */

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
      'settings-page': () => import('./components/SettingsPage'),
      'reading-settings': () => import('./components/ReadingSettings'),
      'audio-settings': () => import('./components/AudioSettings'),
      'import-settings': () => import('./components/ImportSettings'),
      'privacy-settings': () => import('./components/PrivacySettings'),
      'accessibility-settings': () => import('./components/AccessibilitySettings'),
      'keyboard-settings': () => import('./components/KeyboardSettings'),
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