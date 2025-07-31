'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import NavigationSection from './NavigationSection';
import { useNavigationStore } from '@/plugins/navigation/stores/navigation-store';
import type { SidebarProps, NavigationItem } from '@/plugins/navigation/types/navigation-types';

const Sidebar: React.FC<SidebarProps> = ({
  className,
  'data-testid': testId,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    isOpen,
    isCollapsed,
    activeItem,
    hoveredItem,
    visibleSections,
    config,
    toggle,
    close,
    collapse,
    expand,
    setActiveItem,
    setHoveredItem,
    updateSection,
  } = useNavigationStore();

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    if (!config.overlay) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, config.overlay, close]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  const handleItemClick = useCallback((item: NavigationItem) => {
    setActiveItem(item.id);
    
    // Close sidebar on mobile after navigation
    if (config.overlay) {
      close();
    }
  }, [setActiveItem, close, config.overlay]);

  const handleItemHover = useCallback((item: NavigationItem) => {
    setHoveredItem(item.id);
  }, [setHoveredItem]);

  const handleItemLeave = useCallback(() => {
    setHoveredItem(null);
  }, [setHoveredItem]);

  const handleSectionToggle = useCallback((sectionId: string) => {
    updateSection(sectionId, { 
      collapsed: !visibleSections.find(s => s.id === sectionId)?.collapsed 
    });
  }, [updateSection, visibleSections]);

  const handleToggleCollapse = useCallback(() => {
    if (isCollapsed) {
      expand();
    } else {
      collapse();
    }
  }, [isCollapsed, expand, collapse]);

  const sidebarWidth = isCollapsed ? 64 : (config.width || 280);
  const position = config.position || 'left';

  // Don't render if not open and using overlay mode
  if (!isOpen && config.overlay) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {config.overlay && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
          'transition-all duration-300 ease-in-out',
          {
            // Position classes
            'border-r': position === 'left',
            'border-l': position === 'right',
            
            // Overlay mode (mobile)
            'fixed top-0 bottom-0 z-50 shadow-xl': config.overlay,
            'left-0': config.overlay && position === 'left',
            'right-0': config.overlay && position === 'right',
            
            // Static mode (desktop)
            'relative': !config.overlay,
            
            // Visibility
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen && position === 'left' && config.overlay,
            'translate-x-full': !isOpen && position === 'right' && config.overlay,
          },
          className
        )}
        style={{ width: `${sidebarWidth}px` }}
        data-testid={testId}
        role="complementary"
        aria-label="Navigation sidebar"
        aria-expanded={isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Navigation
            </h2>
          )}
          
          <div className="flex items-center gap-2">
            {config.collapsible && (
              <button
                type="button"
                className={cn(
                  'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'transition-colors duration-200'
                )}
                onClick={handleToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
            
            {config.overlay && (
              <button
                type="button"
                className={cn(
                  'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'transition-colors duration-200'
                )}
                onClick={close}
                aria-label="Close sidebar"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {visibleSections.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {isCollapsed ? (
                <Menu className="w-6 h-6 mx-auto" />
              ) : (
                <p className="text-sm">No navigation items</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {visibleSections.map((section) => (
                <NavigationSection
                  key={section.id}
                  section={section}
                  activeItem={activeItem}
                  hoveredItem={hoveredItem}
                  onItemClick={handleItemClick}
                  onItemHover={handleItemHover}
                  onItemLeave={handleItemLeave}
                  onSectionToggle={handleSectionToggle}
                  data-testid={`nav-section-${section.id}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Navigation Plugin v1.0
            </div>
          </div>
        )}
      </div>
    </>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;