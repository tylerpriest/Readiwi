'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (item.disabled) return;
    
    if (item.action) {
      item.action();
    } else if (item.path && !item.external) {
      // Handle internal navigation with Next.js router
      router.push(item.path);
    } else if (item.path && item.external) {
      // Handle external navigation
      window.open(item.path, '_blank', 'noopener,noreferrer');
    }
    
    onItemClick?.(item);
  }, [item, onItemClick, router]);

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
    'flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors duration-200',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
      'bg-primary text-primary-foreground': isActive,
      'bg-muted': isHovered && !isActive,
      'text-muted-foreground cursor-not-allowed opacity-50': item.disabled,
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
                'ml-auto px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground',
                isActive && 'bg-primary-foreground text-primary'
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