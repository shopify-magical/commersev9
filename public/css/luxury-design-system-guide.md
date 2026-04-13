# Luxury Felt-Texture Design System Guide

## Overview

A comprehensive luxury-themed design system featuring authentic felt material properties, premium typography, and sophisticated micro-interactions. This system establishes an immersive felt-texture aesthetic across the entire user interface with WCAG 2.1 AA compliance and cross-browser compatibility.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Felt Texture System](#felt-texture-system)
5. [Components](#components)
6. [Micro-Interactions](#micro-interactions)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Performance](#performance)
10. [Implementation](#implementation)

## Design Principles

### Core Philosophy
- **Authenticity**: Recreate real felt material properties through CSS
- **Luxury**: Premium aesthetics with sophisticated color palettes
- **Accessibility**: WCAG 2.1 AA compliance as a baseline
- **Performance**: Optimized for speed with Core Web Vitals focus
- **Consistency**: Unified design language across all components

### Material Properties
- **Multi-layered gradients**: 3-4 subtle color variations
- **Custom shadows**: Base (0px 2px 8px rgba(0,0,0,0.1)) and depth (0px 1px 3px rgba(0,0,0,0.08))
- **Noise texture**: SVG filters at 0.3-0.5% opacity
- **Tactile feedback**: Hover states and micro-interactions

## Color System

### Primary Themes

#### Deep Charcoal
```css
--luxury-charcoal-50: #F8F8F8;
--luxury-charcoal-100: #E8E8E8;
--luxury-charcoal-200: #D0D0D0;
--luxury-charcoal-300: #B8B8B8;
--luxury-charcoal-400: #A0A0A0;
--luxury-charcoal-500: #888888;
--luxury-charcoal-600: #707070;
--luxury-charcoal-700: #585858;
--luxury-charcoal-800: #404040;
--luxury-charcoal-900: #2C2C2C;
--luxury-charcoal-950: #1A1A1A;
```

#### Rich Burgundy
```css
--luxury-burgundy-50: #FFF5F5;
--luxury-burgundy-100: #FED7D7;
--luxury-burgundy-200: #FC8181;
--luxury-burgundy-300: #F56565;
--luxury-burgundy-400: #E53E3E;
--luxury-burgundy-500: #C53030;
--luxury-burgundy-600: #9B2C2C;
--luxury-burgundy-700: #742A2A;
--luxury-burgundy-800: #800020;
--luxury-burgundy-900: #722F37;
--luxury-burgundy-950: #4A0E0E;
```

#### Midnight Blue
```css
--luxury-midnight-50: #EBF8FF;
--luxury-midnight-100: #BEE3F8;
--luxury-midnight-200: #90CDF4;
--luxury-midnight-300: #63B3ED;
--luxury-midnight-400: #4299E1;
--luxury-midnight-500: #3182CE;
--luxury-midnight-600: #2C5282;
--luxury-midnight-700: #2A4E7C;
--luxury-midnight-800: #191970;
--luxury-midnight-900: #003366;
--luxury-midnight-950: #0A2540;
```

### Accent Colors

#### Gold
```css
--luxury-gold-50: #FFFBEB;
--luxury-gold-100: #FEF3C7;
--luxury-gold-200: #FDE68A;
--luxury-gold-300: #FCD34D;
--luxury-gold-400: #FBBF24;
--luxury-gold-500: #F59E0B;
--luxury-gold-600: #D97706;
--luxury-gold-700: #B45309;
--luxury-gold-800: #92400E;
--luxury-gold-900: #78350F;
--luxury-gold-950: #451A03;
```

#### Champagne
```css
--luxury-champagne-50: #FFFAF5;
--luxury-champagne-100: #FEF3E2;
--luxury-champagne-200: #FDE9CC;
--luxury-champagne-300: #FCD9A5;
--luxury-champagne-400: #FAC068;
--luxury-champagne-500: #F7E7CE;
--luxury-champagne-600: #E6B47A;
--luxury-champagne-700: #D4944F;
--luxury-champagne-800: #B8773E;
--luxury-champagne-900: #965A3A;
--luxury-champagne-950: #6B3410;
```

### Semantic Color Mappings
```css
--color-background: var(--luxury-charcoal-50);
--color-surface: var(--white);
--color-text-primary: var(--luxury-charcoal-800);
--color-text-secondary: var(--luxury-charcoal-600);
--color-text-tertiary: var(--luxury-charcoal-500);
--color-border: var(--luxury-charcoal-200);
--color-border-hover: var(--luxury-charcoal-300);
--color-border-focus: var(--luxury-burgundy-500);
```

## Typography

### Font Families
```css
--font-primary: 'Playfair Display', 'Georgia', serif;
--font-secondary: 'Inter', 'Helvetica Neue', sans-serif;
--font-accent: 'Cormorant Garamond', 'Times New Roman', serif;
--font-ui: 'Inter', 'Helvetica Neue', sans-serif;
--font-heading: 'Playfair Display', 'Georgia', serif;
--font-body: 'Inter', 'Helvetica Neue', sans-serif;
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Letter Spacing
```css
--letter-spacing-tight: -0.02em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.02em;
--letter-spacing-wider: 0.05em;
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;
```

### Typography Classes
```css
.luxury-heading {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--luxury-charcoal-900);
}

.luxury-body {
  font-family: var(--font-body);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  color: var(--luxury-charcoal-700);
}

.luxury-accent {
  font-family: var(--font-accent);
  font-weight: var(--font-weight-medium);
  font-style: italic;
  color: var(--luxury-burgundy-700);
}
```

## Felt Texture System

### Base Implementation
```css
.luxury-felt {
  position: relative;
  background: linear-gradient(
    135deg,
    var(--felt-base-1) 0%,
    var(--felt-base-2) 25%,
    var(--felt-base-3) 50%,
    var(--felt-base-4) 75%,
    var(--felt-base-1) 100%
  );
  box-shadow: var(--felt-shadow-base), var(--felt-shadow-depth);
  border-radius: var(--radius-lg);
  transition: all var(--duration-300) var(--ease-in-out);
}
```

### Noise Texture Overlay
```css
.luxury-felt::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmZWx0Tm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzZWVkPSI1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNmZWx0Tm9pc2UpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+');
  opacity: var(--felt-noise-opacity);
  pointer-events: none;
  border-radius: inherit;
  z-index: 1;
}
```

### Light Reflection
```css
.luxury-felt::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 70%
  );
  pointer-events: none;
  border-radius: inherit;
  z-index: 2;
}
```

### Shadow System
```css
--felt-shadow-base: 0px 2px 8px rgba(0,0,0,0.1);
--felt-shadow-depth: 0px 1px 3px rgba(0,0,0,0.08);
--felt-shadow-elevated: 0px 4px 12px rgba(0,0,0,0.15);
--felt-shadow-pressed: 0px 1px 2px rgba(0,0,0,0.12);
```

## Components

### Luxury Search Bar

#### HTML Structure
```html
<div class="luxury-search-container">
  <input 
    type="text" 
    class="luxury-search-bar luxury-ripple luxury-focus-visible" 
    placeholder="Search for premium products..."
    aria-label="Search products"
  >
  <svg class="luxury-search-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
  <button class="luxury-search-button luxury-ripple" type="submit">
    Search
  </button>
</div>
```

#### CSS Properties
```css
.luxury-search-bar {
  width: 100%;
  height: 64px;
  padding: 0 var(--space-6) 0 var(--space-20);
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: var(--font-weight-normal);
  color: var(--luxury-charcoal-900);
  background: linear-gradient(
    135deg,
    var(--luxury-charcoal-50) 0%,
    var(--luxury-charcoal-100) 50%,
    var(--luxury-charcoal-50) 100%
  );
  border: 2px solid var(--luxury-charcoal-200);
  border-radius: var(--radius-xl);
  box-shadow: 
    var(--felt-shadow-base),
    var(--felt-shadow-depth),
    inset 0 1px 3px rgba(0,0,0,0.05);
  transition: all var(--duration-200) var(--ease-out);
  outline: none;
}
```

#### Interactive States
```css
.luxury-search-bar:hover {
  border-color: var(--luxury-charcoal-300);
  box-shadow: 
    var(--felt-shadow-elevated),
    var(--felt-shadow-depth),
    inset 0 1px 3px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}

.luxury-search-bar:focus {
  border-color: var(--luxury-burgundy-500);
  box-shadow: 
    0 0 0 4px rgba(128, 0, 32, 0.1),
    var(--felt-shadow-elevated),
    var(--felt-shadow-depth),
    inset 0 1px 3px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}
```

### Search Icon
```css
.luxury-search-icon {
  position: absolute;
  left: var(--space-6);
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  stroke: var(--luxury-charcoal-500);
  stroke-width: 2;
  fill: none;
  transition: stroke var(--duration-200) var(--ease-out);
  pointer-events: none;
}
```

### Search Button
```css
.luxury-search-button {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(
    135deg,
    var(--luxury-burgundy-600) 0%,
    var(--luxury-burgundy-700) 100%
  );
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-ui);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-out);
  box-shadow: var(--felt-shadow-base);
}
```

## Micro-Interactions

### Ripple Effect
```css
.luxury-ripple {
  position: relative;
  overflow: hidden;
}

.luxury-ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width var(--duration-600) var(--ease-out),
              height var(--duration-600) var(--ease-out),
              opacity var(--duration-600) var(--ease-out);
  opacity: 0;
}

.luxury-ripple:active::before {
  width: 300px;
  height: 300px;
  opacity: 1;
  transition: width var(--duration-300) var(--ease-out),
              height var(--duration-300) var(--ease-out),
              opacity var(--duration-300) var(--ease-out);
}
```

### Loading States
```css
.luxury-loading {
  position: relative;
  pointer-events: none;
}

.luxury-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--luxury-charcoal-200);
  border-top: 2px solid var(--luxury-burgundy-600);
  border-radius: 50%;
  animation: luxury-spin 1s linear infinite;
}

@keyframes luxury-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Pulse Animation
```css
.luxury-pulse {
  animation: luxury-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes luxury-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## Accessibility

### Focus Indicators
```css
.luxury-focus-visible:focus-visible {
  outline: 2px solid var(--luxury-burgundy-500);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .luxury-search-bar {
    border-width: 3px;
    border-color: var(--luxury-charcoal-900);
  }
  
  .luxury-search-bar:focus {
    border-color: var(--luxury-burgundy-900);
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .luxury-search-bar,
  .luxury-search-button,
  .luxury-ripple::before {
    transition: none;
  }
  
  .luxury-loading::after,
  .luxury-pulse {
    animation: none;
  }
}
```

### Screen Reader Support
```html
<div role="region" aria-label="Search results" aria-live="polite">
  <!-- Search results content -->
</div>

<span class="luxury-sr-only">Loading search results</span>
```

## Responsive Design

### Breakpoint System
```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

### Mobile (320px - 768px)
```css
@media (max-width: 768px) {
  .luxury-search-container {
    padding: var(--space-2);
  }
  
  .luxury-search-bar {
    height: 56px;
    padding: 0 var(--space-4) 0 var(--space-16);
    font-size: var(--text-sm);
  }
  
  .luxury-search-icon {
    left: var(--space-4);
    width: 20px;
    height: 20px;
  }
  
  .luxury-search-button {
    right: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
  }
}
```

### Tablet (768px - 1024px)
```css
@media (min-width: 769px) and (max-width: 1024px) {
  .luxury-search-container {
    max-width: 500px;
  }
  
  .luxury-search-bar {
    height: 60px;
  }
}
```

### Desktop (1024px+)
```css
@media (min-width: 1025px) {
  .luxury-search-container {
    max-width: 600px;
  }
}
```

## Performance

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to First Byte (TTFB)**: < 600ms

### Optimization Techniques
1. **CSS Custom Properties**: Fast variable lookups
2. **Transform Animations**: GPU-accelerated
3. **Will-change Property**: Optimize for animations
4. **Font Display Strategy**: Swap for faster loading
5. **Critical CSS**: Inline above-the-fold styles

### Performance Monitoring
```javascript
// Core Web Vitals monitoring
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Implementation

### Quick Start

1. **Include CSS**
```html
<link rel="stylesheet" href="css/luxury-design-system.css">
```

2. **Add Fonts**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap" rel="stylesheet">
```

3. **Basic Search Component**
```html
<div class="luxury-search-container">
  <input type="text" class="luxury-search-bar" placeholder="Search...">
  <svg class="luxury-search-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
  <button class="luxury-search-button">Search</button>
</div>
```

### Customization

#### Override Colors
```css
:root {
  --luxury-charcoal-900: #custom-dark-color;
  --luxury-burgundy-600: #custom-accent-color;
  --felt-shadow-base: custom-shadow-definition;
}
```

#### Component Variations
```css
.luxury-search-bar.luxury-search-bar--large {
  height: 72px;
  font-size: var(--text-lg);
}

.luxury-search-bar.luxury-search-bar--minimal {
  border: none;
  background: transparent;
  box-shadow: none;
}
```

### JavaScript Integration

#### Ripple Effect
```javascript
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

document.querySelectorAll('.luxury-ripple').forEach(el => {
  el.addEventListener('click', createRipple);
});
```

#### Theme Switching
```javascript
function switchTheme(theme) {
  document.body.classList.remove('luxury-theme-dark', 'luxury-theme-high-contrast');
  if (theme === 'dark') {
    document.body.classList.add('luxury-theme-dark');
  } else if (theme === 'high-contrast') {
    document.body.classList.add('luxury-theme-high-contrast');
  }
}
```

### Browser Support

#### Supported Browsers
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

#### Fallbacks
```css
/* CSS custom properties fallback */
@supports not (color: var(--test)) {
  .luxury-search-bar {
    background: #F8F8F8;
    border-color: #E8E8E8;
    color: #2C2C2C;
  }
}

/* SVG filter fallback */
@supports not (filter: url(#test)) {
  .luxury-felt::before {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGklEQVQYlWNgYGCQwoKxgqGgcJA5h3yFAAs8BRWVSwooAAAAAElFTkSuQmCC');
  }
}
```

## Testing

### Accessibility Testing
- **WAVE**: Web Accessibility Evaluation Tool
- **axe DevTools**: Automated accessibility testing
- **Screen Readers**: NVDA, JAWS, VoiceOver testing

### Performance Testing
- **Lighthouse**: Overall performance score
- **WebPageTest**: Detailed performance metrics
- **Chrome DevTools**: Real-time performance monitoring

### Cross-Browser Testing
- **BrowserStack**: Comprehensive browser testing
- **Sauce Labs**: Automated cross-browser testing
- **Manual Testing**: Visual verification across browsers

## Maintenance

### Version Control
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Document breaking changes in changelog
- Maintain backward compatibility when possible

### Updates
- Regular font updates and optimizations
- Performance improvements and optimizations
- Accessibility enhancements
- Browser compatibility updates

### Documentation
- Keep this guide updated with changes
- Add new component examples
- Update performance metrics regularly
- Include new best practices and patterns

---

## Conclusion

The Luxury Felt-Texture Design System provides a comprehensive solution for creating premium, accessible, and performant user interfaces. With its modular architecture, extensive customization options, and focus on user experience, it serves as an excellent foundation for luxury web applications.

For questions, contributions, or support, please refer to the project documentation or contact the design system team.
