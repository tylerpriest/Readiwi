# Readiwi v4.0 - Complete Design System Specification

**Version**: 4.0.0  
**Created**: 2025-07-29  
**Purpose**: Complete visual design system for consistent UI implementation  
**Target**: Production-ready design tokens and component specifications

## Design Philosophy

### Core Principles
- **Accessibility First**: WCAG 2.1 AA compliance is non-negotiable
- **Mobile First**: All designs optimized for mobile devices first
- **Reading Focused**: Minimize distractions, maximize reading comfort
- **Consistent**: Systematic approach to spacing, typography, and color
- **Performant**: Lightweight implementation with minimal CSS

### Visual Identity
- **Clean & Minimal**: Distraction-free interface focused on content
- **Warm & Inviting**: Comfortable color palette for extended reading
- **Professional**: Trustworthy appearance for serious readers
- **Accessible**: High contrast and clear visual hierarchy

## Color System

### Primary Color Palette

```css
:root {
  /* Primary Colors - Brand Identity */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* Primary brand color */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;
}
```

### Semantic Color System

```css
:root {
  /* Light Theme Semantic Colors */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  
  /* Text Colors */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #64748b;
  --color-text-inverse: #ffffff;
  
  /* Interactive Colors */
  --color-interactive-primary: #3b82f6;
  --color-interactive-primary-hover: #2563eb;
  --color-interactive-primary-active: #1d4ed8;
  --color-interactive-secondary: #64748b;
  --color-interactive-secondary-hover: #475569;
  
  /* Status Colors */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
}

.dark {
  /* Dark Theme Semantic Colors */
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-surface-elevated: #334155;
  --color-border: #334155;
  --color-border-strong: #475569;
  
  /* Text Colors */
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #94a3b8;
  --color-text-inverse: #0f172a;
  
  /* Interactive Colors */
  --color-interactive-primary: #60a5fa;
  --color-interactive-primary-hover: #3b82f6;
  --color-interactive-primary-active: #2563eb;
  --color-interactive-secondary: #94a3b8;
  --color-interactive-secondary-hover: #cbd5e1;
  
  /* Status Colors */
  --color-success: #34d399;
  --color-success-light: #064e3b;
  --color-warning: #fbbf24;
  --color-warning-light: #451a03;
  --color-error: #f87171;
  --color-error-light: #450a0a;
  --color-info: #60a5fa;
  --color-info-light: #1e3a8a;
}

.sepia {
  /* Sepia Theme - Warm, Paper-like */
  --color-background: #f7f3e9;
  --color-surface: #f0ead6;
  --color-surface-elevated: #f7f3e9;
  --color-border: #d4c5a0;
  --color-border-strong: #b8a082;
  
  /* Text Colors */
  --color-text-primary: #3c2e1e;
  --color-text-secondary: #5d4e3a;
  --color-text-tertiary: #7a6b57;
  --color-text-inverse: #f7f3e9;
  
  /* Interactive Colors */
  --color-interactive-primary: #8b4513;
  --color-interactive-primary-hover: #a0522d;
  --color-interactive-primary-active: #654321;
  --color-interactive-secondary: #7a6b57;
  --color-interactive-secondary-hover: #5d4e3a;
}
```

### Reading-Specific Colors

```css
:root {
  /* Reading Interface Colors */
  --color-reading-background: var(--color-background);
  --color-reading-text: var(--color-text-primary);
  --color-reading-highlight: rgba(59, 130, 246, 0.1);
  --color-reading-selection: rgba(59, 130, 246, 0.2);
  --color-reading-link: var(--color-interactive-primary);
  --color-reading-link-hover: var(--color-interactive-primary-hover);
  
  /* Audio Highlight Colors */
  --color-audio-highlight: rgba(251, 191, 36, 0.3);
  --color-audio-highlight-border: #f59e0b;
  --color-audio-current-sentence: rgba(34, 197, 94, 0.2);
  --color-audio-current-sentence-border: #10b981;
}
```

### Accessibility Color Validation

All color combinations must meet WCAG 2.1 AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio for borders/focus states

## Typography System

### Font Families

```css
:root {
  /* Primary Font Stack - Reading */
  --font-family-serif: 'Crimson Text', 'Times New Roman', serif;
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  /* System Font Stack - UI */
  --font-family-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

### Typography Scale

```css
:root {
  /* Font Sizes - Fluid Typography */
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12-14px */
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);     /* 14-16px */
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);     /* 16-18px */
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);    /* 18-20px */
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);     /* 20-24px */
  --font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);      /* 24-30px */
  --font-size-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem); /* 30-36px */
  --font-size-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);      /* 36-48px */
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}
```

### Reading Typography Settings

```css
:root {
  /* Customizable Reading Settings */
  --reading-font-family: var(--font-family-serif);
  --reading-font-size: var(--font-size-base);
  --reading-line-height: var(--line-height-relaxed);
  --reading-letter-spacing: var(--letter-spacing-normal);
  --reading-word-spacing: normal;
  --reading-text-align: left;
  --reading-max-width: 65ch;
  --reading-paragraph-spacing: 1.5em;
}

/* Reading Typography Classes */
.reading-text {
  font-family: var(--reading-font-family);
  font-size: var(--reading-font-size);
  line-height: var(--reading-line-height);
  letter-spacing: var(--reading-letter-spacing);
  word-spacing: var(--reading-word-spacing);
  text-align: var(--reading-text-align);
  max-width: var(--reading-max-width);
  color: var(--color-reading-text);
}

.reading-text p {
  margin-bottom: var(--reading-paragraph-spacing);
}

.reading-text h1,
.reading-text h2,
.reading-text h3 {
  font-weight: 600;
  line-height: var(--line-height-tight);
  margin-top: 2em;
  margin-bottom: 1em;
}
```

### UI Typography Classes

```css
/* Heading Classes */
.text-display-large {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.text-display-medium {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.text-display-small {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: var(--line-height-snug);
}

.text-headline-large {
  font-size: var(--font-size-xl);
  font-weight: 600;
  line-height: var(--line-height-snug);
}

.text-headline-medium {
  font-size: var(--font-size-lg);
  font-weight: 500;
  line-height: var(--line-height-normal);
}

.text-headline-small {
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: var(--line-height-normal);
}

/* Body Text Classes */
.text-body-large {
  font-size: var(--font-size-base);
  font-weight: 400;
  line-height: var(--line-height-relaxed);
}

.text-body-medium {
  font-size: var(--font-size-sm);
  font-weight: 400;
  line-height: var(--line-height-normal);
}

.text-body-small {
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: var(--line-height-normal);
}

/* Label Classes */
.text-label-large {
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-wide);
}

.text-label-medium {
  font-size: var(--font-size-xs);
  font-weight: 500;
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-wide);
}

.text-label-small {
  font-size: var(--font-size-xs);
  font-weight: 500;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-wider);
}
```

## Spacing System

### Base Spacing Scale

```css
:root {
  /* Base spacing unit: 4px */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-28: 7rem;       /* 112px */
  --space-32: 8rem;       /* 128px */
}
```

### Component Spacing

```css
:root {
  /* Component-specific spacing */
  --space-component-padding-sm: var(--space-3);
  --space-component-padding-md: var(--space-4);
  --space-component-padding-lg: var(--space-6);
  
  --space-component-gap-sm: var(--space-2);
  --space-component-gap-md: var(--space-4);
  --space-component-gap-lg: var(--space-6);
  
  --space-layout-margin-sm: var(--space-4);
  --space-layout-margin-md: var(--space-6);
  --space-layout-margin-lg: var(--space-8);
  
  --space-section-gap: var(--space-12);
  --space-page-padding: var(--space-6);
}
```

### Reading-Specific Spacing

```css
:root {
  /* Reading interface spacing */
  --space-reading-margin: clamp(1rem, 5vw, 3rem);
  --space-reading-padding: var(--space-6);
  --space-paragraph-spacing: 1.5em;
  --space-chapter-spacing: 3em;
  --space-section-spacing: 2em;
}
```

## Layout System

### Container Sizes

```css
:root {
  /* Container max-widths */
  --container-xs: 20rem;    /* 320px */
  --container-sm: 24rem;    /* 384px */
  --container-md: 28rem;    /* 448px */
  --container-lg: 32rem;    /* 512px */
  --container-xl: 36rem;    /* 576px */
  --container-2xl: 42rem;   /* 672px */
  --container-3xl: 48rem;   /* 768px */
  --container-4xl: 56rem;   /* 896px */
  --container-5xl: 64rem;   /* 1024px */
  --container-6xl: 72rem;   /* 1152px */
  --container-7xl: 80rem;   /* 1280px */
  
  /* Reading-specific containers */
  --container-reading-narrow: 45rem;   /* ~65 characters */
  --container-reading-medium: 55rem;   /* ~75 characters */
  --container-reading-wide: 65rem;     /* ~85 characters */
}
```

### Responsive Breakpoints

```css
:root {
  /* Breakpoint values */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Media query mixins for consistency */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Grid System

```css
/* Flexible grid system */
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Responsive grid classes */
@media (min-width: 640px) {
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
```

## Border Radius System

```css
:root {
  /* Border radius scale */
  --radius-none: 0;
  --radius-sm: 0.125rem;    /* 2px */
  --radius-base: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;    /* 6px */
  --radius-lg: 0.5rem;      /* 8px */
  --radius-xl: 0.75rem;     /* 12px */
  --radius-2xl: 1rem;       /* 16px */
  --radius-3xl: 1.5rem;     /* 24px */
  --radius-full: 9999px;    /* Fully rounded */
  
  /* Component-specific radius */
  --radius-button: var(--radius-md);
  --radius-card: var(--radius-lg);
  --radius-modal: var(--radius-xl);
  --radius-input: var(--radius-md);
}
```

## Shadow System

```css
:root {
  /* Shadow scale */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-2xl: 0 50px 100px -20px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  
  /* Component-specific shadows */
  --shadow-card: var(--shadow-sm);
  --shadow-modal: var(--shadow-xl);
  --shadow-dropdown: var(--shadow-lg);
  --shadow-button: var(--shadow-xs);
  --shadow-button-hover: var(--shadow-sm);
}

.dark {
  /* Adjusted shadows for dark theme */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --shadow-2xl: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
}
```

## Animation System

### Timing Functions

```css
:root {
  /* Easing curves */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  
  /* Duration scale */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### Common Animations

```css
/* Fade animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Slide animations */
@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-down {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale animations */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Utility classes */
.animate-fade-in {
  animation: fade-in var(--duration-200) var(--ease-out);
}

.animate-slide-in-up {
  animation: slide-in-up var(--duration-300) var(--ease-out);
}

.animate-scale-in {
  animation: scale-in var(--duration-200) var(--ease-out);
}

/* Transition utilities */
.transition-all {
  transition: all var(--duration-150) var(--ease-in-out);
}

.transition-colors {
  transition: color var(--duration-150) var(--ease-in-out),
              background-color var(--duration-150) var(--ease-in-out),
              border-color var(--duration-150) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--duration-150) var(--ease-in-out);
}
```

## Icon System

### Icon Specifications

```css
:root {
  /* Icon sizes */
  --icon-xs: 0.75rem;   /* 12px */
  --icon-sm: 1rem;      /* 16px */
  --icon-base: 1.25rem; /* 20px */
  --icon-lg: 1.5rem;    /* 24px */
  --icon-xl: 2rem;      /* 32px */
  --icon-2xl: 2.5rem;   /* 40px */
  --icon-3xl: 3rem;     /* 48px */
}

/* Icon utility classes */
.icon {
  display: inline-block;
  width: var(--icon-base);
  height: var(--icon-base);
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon-xs { width: var(--icon-xs); height: var(--icon-xs); }
.icon-sm { width: var(--icon-sm); height: var(--icon-sm); }
.icon-lg { width: var(--icon-lg); height: var(--icon-lg); }
.icon-xl { width: var(--icon-xl); height: var(--icon-xl); }
.icon-2xl { width: var(--icon-2xl); height: var(--icon-2xl); }
.icon-3xl { width: var(--icon-3xl); height: var(--icon-3xl); }
```

### Required Icons

The following icons are required for the application (using Lucide React):

**Navigation & Actions**
- `Menu`, `X`, `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`
- `Home`, `Library`, `Settings`, `Search`, `Plus`, `Minus`
- `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`

**Reading Interface**
- `Book`, `BookOpen`, `Bookmark`, `BookmarkPlus`
- `Type`, `AlignLeft`, `AlignCenter`, `AlignJustify`
- `Sun`, `Moon`, `Palette`, `Eye`, `EyeOff`

**Audio Controls**
- `Play`, `Pause`, `Square` (stop), `SkipForward`, `SkipBack`
- `Volume`, `Volume1`, `Volume2`, `VolumeX`
- `Headphones`, `Speaker`, `Mic`

**Status & Feedback**
- `Check`, `CheckCircle`, `X`, `XCircle`, `AlertCircle`, `Info`
- `Loader2`, `Download`, `Upload`, `Refresh`
- `Wifi`, `WifiOff`, `Signal`, `SignalHigh`, `SignalLow`

**User Interface**
- `User`, `UserCircle`, `LogIn`, `LogOut`
- `Heart`, `Star`, `Share`, `ExternalLink`
- `Filter`, `SortAsc`, `SortDesc`, `Grid`, `List`

## Focus and Interaction States

### Focus Management

```css
/* Focus ring system */
:root {
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-color: var(--color-interactive-primary);
  --focus-ring-opacity: 0.5;
}

/* Base focus styles */
.focus-ring {
  outline: var(--focus-ring-width) solid transparent;
  outline-offset: var(--focus-ring-offset);
  transition: outline-color var(--duration-150) var(--ease-in-out);
}

.focus-ring:focus-visible {
  outline-color: var(--focus-ring-color);
  outline-opacity: var(--focus-ring-opacity);
}

/* Focus styles for different components */
.focus-ring-inset {
  outline-offset: calc(var(--focus-ring-offset) * -1);
}

.focus-ring-button {
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-button);
}

.focus-ring-input {
  outline-offset: 0;
  border-radius: var(--radius-input);
}
```

### Interaction States

```css
/* Interactive element states */
.interactive {
  cursor: pointer;
  transition: var(--transition-colors);
}

.interactive:hover {
  background-color: var(--color-surface);
}

.interactive:active {
  transform: scale(0.98);
  transition: transform var(--duration-75) var(--ease-in-out);
}

.interactive:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Touch-friendly sizing */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (hover: hover) {
  .hover\:interactive:hover {
    background-color: var(--color-surface);
  }
}
```

## Accessibility Utilities

### Screen Reader Support

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### High Contrast Support

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
    --color-text-primary: #000000;
    --color-background: #ffffff;
    --color-interactive-primary: #0000ff;
  }
  
  .dark {
    --color-border: #ffffff;
    --color-text-primary: #ffffff;
    --color-background: #000000;
    --color-interactive-primary: #00ffff;
  }
}
```

### Reduced Motion Support

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Implementation Guidelines

### CSS Custom Properties Usage

1. **Always use CSS custom properties** for colors, spacing, and typography
2. **Provide fallbacks** for older browsers when necessary
3. **Use semantic naming** that describes purpose, not appearance
4. **Group related properties** logically in the cascade

### Component Implementation

1. **Start with base styles** using design tokens
2. **Add component-specific variations** as needed
3. **Ensure accessibility** is built into base styles
4. **Test across themes** (light, dark, sepia, high contrast)

### Responsive Design

1. **Mobile-first approach** for all components
2. **Use fluid typography** with clamp() for better scaling
3. **Test touch targets** are minimum 44px on mobile
4. **Ensure readability** at all screen sizes

### Performance Considerations

1. **Minimize CSS bundle size** by using only needed utilities
2. **Leverage CSS custom properties** for runtime theming
3. **Use efficient selectors** and avoid deep nesting
4. **Optimize for critical rendering path**

---

**Next Steps**: Use this design system as the foundation for all UI components. Refer to component-library.md for specific component implementations using these design tokens.