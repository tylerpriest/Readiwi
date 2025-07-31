'use client';

import React, { useCallback } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import type { NavigationItemProps } from '@/plugins/navigation/types/navigation-types';

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  level = 0,
  isActive = false,
  isHovered = false,
  onItemClick,
  onItemHover,
  onItemLeave,
  className,
  'data-testid': testId,
}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (item.disabled) return;
    
    if (item.action) {
      item.action();
    } else if (item.path && !item.external) {
      // Handle internal navigation
      window.history.pushState(null, '', item.path);
    } else if (item.path && item.external) {
      // Handle external navigation
      window.open(item.path, '_blank', 'noopener,noreferrer');
    }
    
    onItemClick?.(item);
  }, [item, onItemClick]);

  const handleMouseEnter = useCallback(() => {
    if (!item.disabled) {
      onItemHover?.(item);
    }
  }, [item, onItemHover]);

  const handleMouseLeave = useCallback(() => {
    onItemLeave?.();
  }, [onItemLeave]);

  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = level * 16 + 16; // 16px per level + base padding

  const baseClasses = cn(
    'flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-all duration-200',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    {
      'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300': isActive,
      'bg-gray-50 dark:bg-gray-800/50': isHovered && !isActive,
      'text-gray-400 dark:text-gray-600 cursor-not-allowed': item.disabled,
      'cursor-pointer': !item.disabled,
    }
  );

  return (
    <div className={cn('navigation-item', className)} data-testid={testId}>
      <button
        type="button"
        className={baseClasses}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={item.disabled}
        aria-expanded={hasChildren ? !item.collapsed : undefined}
        aria-current={isActive ? 'page' : undefined}
        title={item.disabled ? `${item.label} (disabled)` : item.label}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {item.icon && (
            <span 
              className={cn(
                'flex-shrink-0 w-4 h-4',
                item.disabled ? 'opacity-50' : 'opacity-75'
              )}
              aria-hidden="true"
            >
              {/* Icon would be rendered here - assuming lucide icons */}
              <span className="text-xs">{item.icon}</span>
            </span>
          )}
          
          <span className="truncate font-medium">
            {item.label}
          </span>
          
          {item.external && (
            <ExternalLink 
              className="w-3 h-3 opacity-50 flex-shrink-0" 
              aria-label="External link"
            />
          )}
          
          {item.badge && (
            <span 
              className={cn(
                'ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700',
                'dark:bg-gray-700 dark:text-gray-300',
                isActive && 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
              )}
              aria-label={`Badge: ${item.badge}`}
            >
              {item.badge}
            </span>
          )}
        </div>
        
        {hasChildren && (
          <span className="flex-shrink-0 ml-2" aria-hidden="true">
            {item.collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        )}
      </button>
      
      {hasChildren && !item.collapsed && (
        <div className="navigation-children" role="group">
          {item.children?.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={isActive}
              isHovered={isHovered}
              onItemClick={onItemClick}
              onItemHover={onItemHover}
              onItemLeave={onItemLeave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

NavigationItem.displayName = 'NavigationItem';

export default NavigationItem;