export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  action?: () => void;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface NavigationConfig {
  sections: NavigationSection[];
  width?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  position?: 'left' | 'right';
  overlay?: boolean;
}

export interface NavigationState {
  isOpen: boolean;
  isCollapsed: boolean;
  activeItem: string | null;
  hoveredItem: string | null;
  sections: NavigationSection[];
  config: NavigationConfig;
}

export interface NavigationActions {
  toggle: () => void;
  open: () => void;
  close: () => void;
  collapse: () => void;
  expand: () => void;
  setActiveItem: (itemId: string | null) => void;
  setHoveredItem: (itemId: string | null) => void;
  addSection: (section: NavigationSection) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<NavigationSection>) => void;
  addItem: (sectionId: string, item: NavigationItem) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  updateItem: (sectionId: string, itemId: string, updates: Partial<NavigationItem>) => void;
  updateConfig: (updates: Partial<NavigationConfig>) => void;
  reset: () => void;
}

export interface NavigationStore extends NavigationState, NavigationActions {
  get visibleSections(): NavigationSection[];
  get totalItems(): number;
}

export interface SidebarProps {
  className?: string;
  'data-testid'?: string;
}

export interface NavigationItemProps {
  item: NavigationItem;
  level?: number;
  isActive?: boolean;
  isHovered?: boolean;
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem) => void;
  onItemLeave?: () => void;
  className?: string;
  'data-testid'?: string;
}

export interface NavigationSectionProps {
  section: NavigationSection;
  activeItem: string | null;
  hoveredItem: string | null;
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem) => void;
  onItemLeave?: () => void;
  onSectionToggle?: (sectionId: string) => void;
  className?: string;
  'data-testid'?: string;
}