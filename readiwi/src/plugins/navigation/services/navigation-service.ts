import type { 
  NavigationSection, 
  NavigationItem, 
  NavigationConfig 
} from '@/plugins/navigation/types/navigation-types';

export interface NavigationServiceConfig {
  persistKey?: string;
  autoSave?: boolean;
  defaultSections?: NavigationSection[];
}

export class NavigationService {
  private config: NavigationServiceConfig;
  private initialized = false;

  constructor(config: NavigationServiceConfig = {}) {
    this.config = {
      persistKey: 'navigation-data',
      autoSave: true,
      defaultSections: [],
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load persisted navigation data if available
      await this.loadPersistedData();
      this.initialized = true;
      console.log('Navigation service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize navigation service:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // Save current state before cleanup
    if (this.config.autoSave) {
      await this.saveCurrentState();
    }
    
    this.initialized = false;
    console.log('Navigation service cleaned up');
  }

  // Section management
  validateSection(section: NavigationSection): boolean {
    if (!section.id || typeof section.id !== 'string') {
      console.error('Section must have a valid id');
      return false;
    }

    if (!Array.isArray(section.items)) {
      console.error('Section must have items array');
      return false;
    }

    // Validate each item in the section
    return section.items.every(item => this.validateItem(item));
  }

  validateItem(item: NavigationItem): boolean {
    if (!item.id || typeof item.id !== 'string') {
      console.error('Navigation item must have a valid id');
      return false;
    }

    if (!item.label || typeof item.label !== 'string') {
      console.error('Navigation item must have a valid label');
      return false;
    }

    // Validate children if they exist
    if (item.children && Array.isArray(item.children)) {
      return item.children.every(child => this.validateItem(child));
    }

    return true;
  }

  // Data persistence
  private async loadPersistedData(): Promise<NavigationSection[] | null> {
    if (typeof window === 'undefined') return null;

    try {
      const persistedData = localStorage.getItem(this.config.persistKey!);
      if (!persistedData) return null;

      const parsedData = JSON.parse(persistedData);
      
      // Validate the loaded data
      if (Array.isArray(parsedData)) {
        const validSections = parsedData.filter(section => this.validateSection(section));
        return validSections;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load persisted navigation data:', error);
      return null;
    }
  }

  private async saveCurrentState(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // This would typically get the current state from the store
      // For now, we'll just save a placeholder
      const currentState = JSON.stringify([]);
      localStorage.setItem(this.config.persistKey!, currentState);
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }

  // Navigation utilities
  findItem(sections: NavigationSection[], itemId: string): NavigationItem | null {
    for (const section of sections) {
      const found = this.findItemInItems(section.items, itemId);
      if (found) return found;
    }
    return null;
  }

  private findItemInItems(items: NavigationItem[], itemId: string): NavigationItem | null {
    for (const item of items) {
      if (item.id === itemId) return item;
      
      if (item.children) {
        const found = this.findItemInItems(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  findSection(sections: NavigationSection[], sectionId: string): NavigationSection | null {
    return sections.find(section => section.id === sectionId) || null;
  }

  // Navigation path utilities
  getItemPath(sections: NavigationSection[], itemId: string): string[] {
    for (const section of sections) {
      const path = this.getItemPathInItems(section.items, itemId, [section.id]);
      if (path) return path;
    }
    return [];
  }

  private getItemPathInItems(
    items: NavigationItem[], 
    itemId: string, 
    currentPath: string[]
  ): string[] | null {
    for (const item of items) {
      const itemPath = [...currentPath, item.id];
      
      if (item.id === itemId) {
        return itemPath;
      }
      
      if (item.children) {
        const found = this.getItemPathInItems(item.children, itemId, itemPath);
        if (found) return found;
      }
    }
    return null;
  }

  // Analytics and metrics
  getNavigationMetrics(sections: NavigationSection[]): {
    totalSections: number;
    totalItems: number;
    deepestLevel: number;
    sectionsWithChildren: number;
  } {
    const totalSections = sections.length;
    let totalItems = 0;
    let deepestLevel = 0;
    let sectionsWithChildren = 0;

    const countItems = (items: NavigationItem[], level = 1): void => {
      totalItems += items.length;
      deepestLevel = Math.max(deepestLevel, level);

      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          countItems(item.children, level + 1);
        }
      });
    };

    sections.forEach(section => {
      countItems(section.items);
      if (section.items.some(item => item.children && item.children.length > 0)) {
        sectionsWithChildren++;
      }
    });

    return {
      totalSections,
      totalItems,
      deepestLevel,
      sectionsWithChildren,
    };
  }

  // Configuration validation
  validateConfig(config: NavigationConfig): boolean {
    if (config.width && (config.width < 200 || config.width > 600)) {
      console.warn('Navigation width should be between 200 and 600 pixels');
    }

    if (config.position && !['left', 'right'].includes(config.position)) {
      console.error('Navigation position must be "left" or "right"');
      return false;
    }

    return true;
  }

  // URL and routing helpers
  isExternalUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  sanitizeUrl(url: string): string {
    // Basic URL sanitization
    return url.trim().replace(/[<>\"]/g, '');
  }

  // Accessibility helpers
  generateAriaLabel(item: NavigationItem, level = 0): string {
    const levelText = level > 0 ? `, level ${level}` : '';
    const badgeText = item.badge ? `, ${item.badge} items` : '';
    const externalText = item.external ? ', opens in new tab' : '';
    const disabledText = item.disabled ? ', disabled' : '';
    
    return `${item.label}${levelText}${badgeText}${externalText}${disabledText}`;
  }

  // Search and filtering
  searchItems(sections: NavigationSection[], query: string): NavigationItem[] {
    const results: NavigationItem[] = [];
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) return results;

    const searchInItems = (items: NavigationItem[]): void => {
      items.forEach(item => {
        if (
          item.label.toLowerCase().includes(searchTerm) ||
          (item.path && item.path.toLowerCase().includes(searchTerm))
        ) {
          results.push(item);
        }

        if (item.children) {
          searchInItems(item.children);
        }
      });
    };

    sections.forEach(section => {
      if (section.title && section.title.toLowerCase().includes(searchTerm)) {
        results.push(...section.items);
      } else {
        searchInItems(section.items);
      }
    });

    return results;
  }
}

// Export singleton instance
export const navigationService = new NavigationService();