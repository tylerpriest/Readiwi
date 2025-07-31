'use client';

import React, { useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import NavigationItem from './NavigationItem';
import type { NavigationSectionProps } from '@/plugins/navigation/types/navigation-types';

const NavigationSection: React.FC<NavigationSectionProps> = ({
  section,
  activeItem,
  hoveredItem,
  onItemClick,
  onItemHover,
  onItemLeave,
  onSectionToggle,
  className,
  'data-testid': testId,
}) => {
  const handleSectionToggle = useCallback(() => {
    if (section.collapsible) {
      onSectionToggle?.(section.id);
    }
  }, [section.id, section.collapsible, onSectionToggle]);

  const hasTitle = Boolean(section.title);
  const isCollapsed = section.collapsed && section.collapsible;
  const showItems = !isCollapsed && section.items.length > 0;

  return (
    <div 
      className={cn('navigation-section', className)} 
      data-testid={testId}
      role="region"
      aria-labelledby={hasTitle ? `section-${section.id}` : undefined}
    >
      {hasTitle && (
        <div className="mb-2">
          {section.collapsible ? (
            <button
              type="button"
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-xs font-semibold',
                'text-muted-foreground uppercase tracking-wide',
                'hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'rounded-md transition-colors duration-200'
              )}
              onClick={handleSectionToggle}
              aria-expanded={!isCollapsed}
              id={`section-${section.id}`}
            >
              <span>{section.title}</span>
              <span aria-hidden="true">
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </span>
            </button>
          ) : (
            <h3
              className={cn(
                'px-3 py-2 text-xs font-semibold text-muted-foreground',
                'uppercase tracking-wide'
              )}
              id={`section-${section.id}`}
            >
              {section.title}
            </h3>
          )}
        </div>
      )}
      
      {showItems && (
        <div 
          className="space-y-1"
          role="list"
          aria-label={section.title ? `${section.title} navigation items` : 'Navigation items'}
        >
          {section.items.map((item) => (
            <div key={item.id} role="listitem">
              <NavigationItem
                item={item}
                level={0}
                isActive={activeItem === item.id}
                isHovered={hoveredItem === item.id}
                onItemClick={onItemClick}
                onItemHover={onItemHover}
                onItemLeave={onItemLeave}
                data-testid={`nav-item-${item.id}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

NavigationSection.displayName = 'NavigationSection';

export default NavigationSection;