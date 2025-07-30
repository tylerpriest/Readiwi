/**
 * Book Import Plugin - Readiwi v4.0
 * Plugin for importing books from web sources
 */

import { Plugin } from '@/core/types/plugin';

export const bookImportPlugin: Plugin = {
  id: 'book-import',
  name: 'Book Import',  
  version: '1.0.0',
  description: 'Import books from web novel platforms like Royal Road',
  dependencies: ['book-library', 'settings'],
  enabled: true,

  async initialize() {
    console.log('Book Import plugin initialized');
  },

  async activate() {
    console.log('Book Import plugin activated');
  },

  async deactivate() {
    console.log('Book Import plugin deactivated');
  },

  async cleanup() {
    console.log('Book Import plugin cleaned up');
  },

  // UI Components
  components: {
    ImportView: () => import('./components/ImportView'),
  },

  // Routes
  routes: [
    {
      path: '/import',
      component: () => import('./components/ImportView'),
      name: 'Import Books',
      description: 'Import books from web sources',
    },
  ],

  // Settings
  settings: {
    maxConcurrentImports: {
      type: 'number',
      default: 1,
      min: 1,
      max: 3,
      description: 'Maximum number of books to import simultaneously',
    },
    requestDelay: {
      type: 'number',
      default: 500,
      min: 100,
      max: 2000,
      description: 'Delay between requests (ms) to avoid rate limiting',
    },
    autoAddToLibrary: {
      type: 'boolean',
      default: true,
      description: 'Automatically add imported books to library',
    },
  },
};