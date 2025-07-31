'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';
import { useNavigationStore } from '@/plugins/navigation/stores/navigation-store';

interface NavigationToggleProps {
  className?: string;
  'data-testid'?: string;
}

const NavigationToggle: React.FC<NavigationToggleProps> = ({
  className,
  'data-testid': testId,
}) => {
  const { isOpen, toggle } = useNavigationStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn('lg:hidden', className)}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      data-testid={testId}
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );
};

NavigationToggle.displayName = 'NavigationToggle';

export default NavigationToggle;