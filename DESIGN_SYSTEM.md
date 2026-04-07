# Unified Design System Documentation

## Overview

The Sweet Layers Unified Design System provides a comprehensive theming architecture that ensures consistency across multiple projects and pages. This system centralizes all design tokens, typography, spacing, and component styles to maintain brand consistency and development efficiency.

## Architecture

### Core Components

1. **Design Tokens** (`css/design-system.css`)
   - Centralized CSS custom properties
   - Semantic color naming
   - Typography scales and font families
   - Spacing systems and layout grids
   - Component-specific tokens

2. **Theme Provider** (`js/theme-provider.js`)
   - JavaScript theme management system
   - Font loading with fallback strategies
   - Component theming framework
   - Accessibility enhancements
   - Performance monitoring

3. **Font System**
   - 6 premium Google Fonts with loading optimization
   - Fallback font stacks for reliability
   - Font display strategies for performance
   - Cross-browser compatibility

## Design Tokens

### Color System

```css
/* Brand Colors */
--brand-primary: #2A6B52;
--brand-primary-dark: #1F4A3A;
--brand-primary-light: #E8F5F0;
--brand-accent: #C4A647;
--brand-accent-dark: #B3941A;

/* Semantic Colors */
--color-background: var(--neutral-50);
--color-surface: var(--white);
--color-text-primary: var(--neutral-800);
--color-text-secondary: var(--neutral-600);
--color-border: var(--neutral-200);
```

### Typography System

```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-secondary: 'Playfair Display', Georgia, serif;
--font-accent: 'Cormorant Garamond', Georgia, serif;
--font-body: 'Lora', Georgia, serif;
--font-ui: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
--font-heading: 'Raleway', -apple-system, BlinkMacSystemFont, sans-serif;

/* Typography Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
```

### Spacing System

```css
/* 4px base unit */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Theme Provider API

### Initialization

```javascript
// Automatic initialization (recommended)
// Theme provider initializes when DOM is ready

// Manual initialization
const themeProvider = new UnifiedThemeProvider({
  themeStorageKey: 'my-app-theme',
  autoDetectTheme: true,
  enableFontLoading: true,
  enableAccessibility: true
});
```

### Theme Management

```javascript
// Set theme
themeProvider.setTheme('dark'); // 'light', 'dark', 'high-contrast'

// Get current theme
const currentTheme = themeProvider.getTheme();

// Toggle theme
themeProvider.toggleTheme();

// Listen for theme changes
themeProvider.addEventListener('theme-changed', (event) => {
  console.log('Theme changed to:', event.detail.current);
});
```

### Component Theming

```javascript
// Register component theme
themeProvider.registerComponent('my-button', {
  classes: ['btn', 'btn-primary'],
  styles: {
    '--button-bg': 'var(--brand-primary)',
    '--button-text': 'var(--color-text-inverse)'
  },
  variants: {
    secondary: {
      classes: ['btn-secondary'],
      styles: {
        '--button-bg': 'transparent'
      }
    }
  }
});

// Apply theme to component
const button = document.querySelector('.my-button');
themeProvider.applyComponentTheme(button, 'my-button');
```

## Component System

### Built-in Components

1. **Buttons**
   - Primary, secondary, accent variants
   - Multiple sizes (sm, md, lg)
   - Theme-aware styling

2. **Cards**
   - Consistent shadows and borders
   - Hover effects
   - Responsive design

3. **Forms**
   - Input styling with focus states
   - Label and validation styling
   - Accessibility support

4. **Navigation**
   - Theme-aware navigation styling
   - Mobile-responsive behavior
   - Accessibility features

### Custom Components

Create custom components using the component registration system:

```html
<!-- HTML with theme component attribute -->
<div data-theme-component="my-custom-component">
  <!-- Content -->
</div>
```

```javascript
// Register custom component theme
themeProvider.registerComponent('my-custom-component', {
  classes: ['custom-component'],
  styles: {
    '--custom-bg': 'var(--color-surface)',
    '--custom-border': 'var(--color-border)'
  }
});
```

## Font System

### Font Loading Strategy

1. **Preloading**: Critical fonts are preloaded for faster rendering
2. **Font Display**: Uses `swap` strategy for immediate fallback
3. **Fallback Chains**: Comprehensive fallback font stacks
4. **Performance Monitoring**: Tracks font loading performance

### Font Families

| Font | Usage | Weights | Purpose |
|------|-------|---------|---------|
| Inter | Primary text | 300-700 | Body text, UI elements |
| Playfair Display | Headings | 400-900 | Marketing headings |
| Cormorant Garamond | Accent | 300-700 | Elegant accents |
| Raleway | UI elements | 300-700 | Navigation, buttons |
| Lora | Body copy | 400-700 | Long-form content |
| Poppins | Modern UI | 300-700 | Contemporary elements |

### Font Optimization

```javascript
// Font loading performance
const metrics = themeProvider.getPerformanceMetrics();
console.log('Font load time:', metrics.fontLoadTime);
console.log('Fonts loaded:', metrics.fontsLoaded);
```

## Theme Variants

### Light Theme (Default)
- Clean, bright appearance
- High contrast for readability
- Optimized for daytime use

### Dark Theme
- Reduced eye strain in low light
- System preference detection
- Automatic switching support

### High Contrast Theme
- WCAG 2.1 AAA compliance
- Enhanced visibility
- Accessibility focused

## Accessibility Features

### Keyboard Navigation
- `Ctrl/Cmd + Shift + T`: Toggle theme
- `Ctrl/Cmd + Shift + H`: High contrast mode
- Full keyboard accessibility

### Screen Reader Support
- Theme change announcements
- Semantic HTML structure
- ARIA labels and descriptions

### Focus Management
- Enhanced focus indicators
- Logical tab order
- Skip links support

### Reduced Motion
- Respects user preferences
- Optional animations
- Performance optimization

## Performance Optimization

### Font Loading
- Preload critical fonts
- Font display optimization
- Loading performance tracking

### CSS Optimization
- Efficient custom properties
- Minimal repaints/reflows
- Optimized selectors

### JavaScript Performance
- Event delegation
- Lazy loading components
- Memory management

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Container System
```css
.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
```

## Cross-Project Consistency

### Implementation Steps

1. **Include Design System**
   ```html
   <link rel="stylesheet" href="css/design-system.css">
   <script src="js/theme-provider.js"></script>
   ```

2. **Apply Theme Provider Class**
   ```html
   <body class="theme-provider">
     <!-- Content -->
   </body>
   ```

3. **Use Design Tokens**
   ```css
   .my-component {
     background-color: var(--color-surface);
     color: var(--color-text-primary);
     padding: var(--spacing-md);
     border-radius: var(--radius-lg);
   }
   ```

4. **Leverage Component System**
   ```html
   <button data-theme-component="button" class="btn-primary">
     Click me
   </button>
   ```

### Migration Guide

1. **Replace Hard-coded Values**
   - Convert colors to design tokens
   - Use typography scale
   - Apply spacing system

2. **Update Component Classes**
   - Use theme-aware component classes
   - Apply semantic naming
   - Ensure accessibility

3. **Test Across Themes**
   - Verify light/dark mode compatibility
   - Test high contrast mode
   - Check responsive behavior

## Browser Support

### Modern Browsers (Full Support)
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Legacy Browsers (Basic Support)
- Internet Explorer 11 (with polyfills)
- Older Chrome/Firefox versions

### Required Features
- CSS Custom Properties
- Font Face API
- ResizeObserver (optional)
- IntersectionObserver (optional)

## Troubleshooting

### Common Issues

1. **Fonts Not Loading**
   - Check network connectivity
   - Verify font URLs
   - Clear browser cache

2. **Theme Not Applying**
   - Ensure design system CSS is loaded
   - Check for CSS specificity conflicts
   - Verify theme provider initialization

3. **Component Theming Issues**
   - Check component registration
   - Verify data-theme-component attribute
   - Inspect CSS custom properties

### Debug Tools

```javascript
// Get performance metrics
console.log(themeProvider.getPerformanceMetrics());

// Check loaded fonts
console.log(Array.from(themeProvider.fontsLoaded));

// Get current theme info
console.log('Current theme:', themeProvider.getTheme());
```

## Best Practices

### Development
1. Use design tokens instead of hard-coded values
2. Leverage component system for consistency
3. Test across all theme variants
4. Consider accessibility in all implementations

### Performance
1. Preload critical fonts
2. Use efficient CSS selectors
3. Minimize JavaScript execution
4. Monitor loading performance

### Maintenance
1. Keep design tokens organized
2. Document custom components
3. Test browser compatibility
4. Update dependencies regularly

## Future Enhancements

### Planned Features
- CSS-in-JS integration
- Advanced component theming
- Real-time collaboration tools
- Automated testing integration

### Extension Points
- Custom theme variants
- Additional font families
- Component libraries
- Design token management tools

## Support

For questions, issues, or contributions:
- Email: silvercloud@o2odesign.com
- Documentation: Available in this repository
- Examples: See implementation in Sweet Layers project

---

*This documentation is part of the Sweet Layers Unified Design System. Last updated: 2025*
