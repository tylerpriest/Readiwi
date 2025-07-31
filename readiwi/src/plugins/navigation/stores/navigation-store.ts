'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  NavigationStore, 
  NavigationSection, 
  NavigationItem, 
  NavigationConfig 
} from '@/plugins/navigation/types/navigation-types';

// Mobile-first configuration
const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

const defaultConfig: NavigationConfig = {
  sections: [],
  width: 280,
  collapsible: true,
  defaultCollapsed: false,
  position: 'left',
  overlay: isMobile, // Mobile-first: overlay on mobile, static on desktop
};

const defaultSections: NavigationSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      {
        id: 'home',
        label: 'Home',
        icon: '🏠',
        path: '/',
      },
      {
        id: 'library',
        label: 'Library',
        icon: '📚',
        path: '/',
        badge: '5',
      },
      {
        id: 'reader',
        label: 'Reader',
        icon: '📖',
        path: '/read',
      },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: [
      {
        id: 'import',
        label: 'Import Books',
        icon: '📥',
        path: '/import',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        path: '/settings',
      },
    ],
  },
  {
    id: 'help',
    title: 'Help & Support',
    collapsible: true,
    collapsed: true,
    items: [
      {
        id: 'documentation',
        label: 'Documentation',
        icon: '📋',
        path: '/docs',
        external: true,
      },
      {
        id: 'support',
        label: 'Support',
        icon: '💬',
        path: '/support',
      },
      {
        id: 'feedback',
        label: 'Feedback',
        icon: '💭',
        action: () => {
          console.log('Opening feedback form...');
        },
      },
    ],
  },
];

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      // State - Mobile-first: closed on mobile, open on desktop
      isOpen: !isMobile,
      isCollapsed: false,
      activeItem: null,
      hoveredItem: null,
      sections: defaultSections,
      config: defaultConfig,

      // Computed properties
      get visibleSections() {
        return get().sections;
      },

      get totalItems() {
        return get().sections.reduce((total, section) => {
          const countItems = (items: NavigationItem[]): number => {
            return items.reduce((count, item) => {
              return count + 1 + (item.children ? countItems(item.children) : 0);
            }, 0);
          };
          return total + countItems(section.items);
        }, 0);
      },

      // Actions
      toggle: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      open: () => {
        set({ isOpen: true });
      },

      close: () => {
        set({ isOpen: false });
      },

      collapse: () => {
        set({ isCollapsed: true });
      },

      expand: () => {
        set({ isCollapsed: false });
      },

      setActiveItem: (itemId) => {
        set({ activeItem: itemId });
      },

      setHoveredItem: (itemId) => {
        set({ hoveredItem: itemId });
      },

      addSection: (section) => {
        set((state) => ({
          sections: [...state.sections, section],
        }));
      },

      removeSection: (sectionId) => {
        set((state) => ({
          sections: state.sections.filter((section) => section.id !== sectionId),
        }));
      },

      updateSection: (sectionId, updates) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, ...updates }
              : section
          ),
        }));
      },

      addItem: (sectionId, item) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, items: [...section.items, item] }
              : section
          ),
        }));
      },

      removeItem: (sectionId, itemId) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items.filter((item) => item.id !== itemId),
                }
              : section
          ),
        }));
      },

      updateItem: (sectionId, itemId, updates) => {
        const updateItemRecursively = (items: NavigationItem[]): NavigationItem[] => {
          return items.map((item) => {
            if (item.id === itemId) {
              return { ...item, ...updates };
            }
            if (item.children) {
              return {
                ...item,
                children: updateItemRecursively(item.children),
              };
            }
            return item;
          });
        };

        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  items: updateItemRecursively(section.items),
                }
              : section
          ),
        }));
      },

      updateConfig: (updates) => {
        set((state) => ({
          config: { ...state.config, ...updates },
        }));
      },

      reset: () => {
        const isMobileNow = typeof window !== 'undefined' && window.innerWidth < 1024;
        set({
          isOpen: !isMobileNow,
          isCollapsed: defaultConfig.defaultCollapsed || false,
          activeItem: null,
          hoveredItem: null,
          sections: defaultSections,
          config: { ...defaultConfig, overlay: isMobileNow },
        });
      },
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        isOpen: state.isOpen,
        isCollapsed: state.isCollapsed,
        activeItem: state.activeItem,
        sections: state.sections,
        config: state.config,
      }),
    }
  )
);