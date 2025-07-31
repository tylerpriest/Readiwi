// Plugin export
export { NavigationPlugin, navigationPlugin } from './plugin';

// Component exports
export { 
  Sidebar, 
  NavigationSection, 
  NavigationItem 
} from './components';

// Store export
export { useNavigationStore } from './stores/navigation-store';

// Service export
export { navigationService, NavigationService } from './services/navigation-service';

// Type exports
export type {
  NavigationItem,
  NavigationSection,
  NavigationConfig,
  NavigationState,
  NavigationActions,
  NavigationStore,
  SidebarProps,
  NavigationItemProps,
  NavigationSectionProps,
} from './types/navigation-types';