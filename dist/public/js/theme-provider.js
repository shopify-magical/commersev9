/**
 * UNIFIED THEME PROVIDER SYSTEM
 * 
 * This JavaScript module provides a comprehensive theme management system
 * for Sweet Layers and related projects. It ensures consistent styling
 * across multiple pages and applications.
 * 
 * FEATURES:
 * - Theme switching (light/dark/high-contrast)
 * - Font loading with fallback strategies
 * - Component theming system
 * - Responsive design management
 * - Accessibility enhancements
 * - Performance optimization
 * - Cross-project consistency
 */

class UnifiedThemeProvider {
  constructor(config = {}) {
    this.config = {
      themeStorageKey: 'sweet-layers-theme',
      fontStorageKey: 'sweet-layers-fonts',
      autoDetectTheme: true,
      enableFontLoading: true,
      enableAccessibility: true,
      enablePerformance: true,
      ...config
    };

    // Theme state
    this.currentTheme = 'light';
    this.systemTheme = 'light';
    this.fontsLoaded = new Set();
    this.components = new Map();
    this.observers = new Map();

    // Performance tracking
    this.performance = {
      fontLoadTime: 0,
      themeSwitchTime: 0,
      componentRenderTime: 0
    };

    // Initialize
    this.init();
  }

  // ========== INITIALIZATION ==========
  async init() {
    try {
      console.log('Initializing Unified Theme Provider...');

      // Setup system theme detection
      this.setupSystemThemeDetection();

      // Load saved theme preference
      this.loadThemePreference();

      // Initialize font loading system
      if (this.config.enableFontLoading) {
        await this.initializeFontSystem();
      }

      // Setup accessibility features
      if (this.config.enableAccessibility) {
        this.setupAccessibility();
      }

      // Setup performance monitoring
      if (this.config.enablePerformance) {
        this.setupPerformanceMonitoring();
      }

      // Apply initial theme
      this.applyTheme(this.currentTheme);

      // Setup component system
      this.setupComponentSystem();

      console.log('Unified Theme Provider initialized successfully');
      
      // Emit ready event
      this.emitEvent('theme-provider-ready', {
        theme: this.currentTheme,
        fonts: Array.from(this.fontsLoaded)
      });

    } catch (error) {
      console.error('Failed to initialize Theme Provider:', error);
      this.emitEvent('theme-provider-error', { error });
    }
  }

  // ========== THEME MANAGEMENT ==========

  /**
   * Set the current theme
   * @param {string} theme - Theme name ('light', 'dark', 'high-contrast')
   * @param {boolean} persist - Whether to persist the preference
   */
  setTheme(theme, persist = true) {
    const startTime = performance.now();

    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return false;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    // Apply theme to document
    this.applyTheme(theme);

    // Update theme provider class
    this.updateThemeProviderClass(theme);

    // Persist preference
    if (persist) {
      this.saveThemePreference(theme);
    }

    // Update performance metrics
    this.performance.themeSwitchTime = performance.now() - startTime;

    // Emit theme change event
    this.emitEvent('theme-changed', {
      previous: previousTheme,
      current: theme,
      duration: this.performance.themeSwitchTime
    });

    return true;
  }

  /**
   * Get the current theme
   * @returns {string} Current theme name
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Apply theme styles to document
   * @param {string} theme - Theme name
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Update color scheme meta tag
    this.updateColorSchemeMeta(theme);
    
    // Update theme-specific CSS variables
    this.updateThemeVariables(theme);
  }

  /**
   * Update theme provider class on body
   * @param {string} theme - Theme name
   */
  updateThemeProviderClass(theme) {
    const body = document.body;
    body.classList.remove('theme-provider', 'theme-provider.dark', 'theme-provider.high-contrast');
    
    body.classList.add('theme-provider');
    if (theme === 'dark') body.classList.add('theme-provider.dark');
    if (theme === 'high-contrast') body.classList.add('theme-provider.high-contrast');
  }

  /**
   * Update color scheme meta tag
   * @param {string} theme - Theme name
   */
  updateColorSchemeMeta(theme) {
    let colorScheme = theme === 'dark' ? 'dark' : 'light';
    if (theme === 'high-contrast') colorScheme = 'light';
    
    let metaTag = document.querySelector('meta[name="color-scheme"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'color-scheme';
      document.head.appendChild(metaTag);
    }
    metaTag.content = colorScheme;
  }

  /**
   * Update theme-specific CSS variables
   * @param {string} theme - Theme name
   */
  updateThemeVariables(theme) {
    const root = document.documentElement;
    
    // Apply theme-specific variable overrides
    if (theme === 'dark') {
      root.style.setProperty('--theme-background', 'var(--neutral-900)');
      root.style.setProperty('--theme-surface', 'var(--neutral-800)');
      root.style.setProperty('--theme-text-primary', 'var(--neutral-100)');
      root.style.setProperty('--theme-text-secondary', 'var(--neutral-300)');
    } else if (theme === 'high-contrast') {
      root.style.setProperty('--theme-border', 'var(--neutral-600)');
      root.style.setProperty('--theme-border-hover', 'var(--neutral-500)');
    } else {
      // Light theme defaults
      root.style.removeProperty('--theme-background');
      root.style.removeProperty('--theme-surface');
      root.style.removeProperty('--theme-text-primary');
      root.style.removeProperty('--theme-text-secondary');
    }
  }

  // ========== FONT SYSTEM ==========

  /**
   * Initialize the font loading system
   */
  async initializeFontSystem() {
    const startTime = performance.now();

    try {
      // Define font families with loading strategies
      const fontFamilies = [
        {
          family: 'Inter',
          weights: [300, 400, 500, 600, 700],
          display: 'swap',
          preload: true
        },
        {
          family: 'Playfair Display',
          weights: [400, 600, 700, 900],
          display: 'swap',
          preload: true
        },
        {
          family: 'Cormorant Garamond',
          weights: [300, 400, 500, 600, 700],
          display: 'swap',
          preload: false
        },
        {
          family: 'Raleway',
          weights: [300, 400, 500, 600, 700],
          display: 'swap',
          preload: false
        },
        {
          family: 'Lora',
          weights: [400, 500, 600, 700],
          display: 'swap',
          preload: false
        },
        {
          family: 'Poppins',
          weights: [300, 400, 500, 600, 700],
          display: 'swap',
          preload: false
        }
      ];

      // Load fonts with optimization
      await this.loadFonts(fontFamilies);

      // Setup font face observer
      this.setupFontObserver();

      // Update performance metrics
      this.performance.fontLoadTime = performance.now() - startTime;

      console.log(`Font system initialized in ${this.performance.fontLoadTime.toFixed(2)}ms`);

    } catch (error) {
      console.error('Failed to initialize font system:', error);
    }
  }

  /**
   * Load multiple font families
   * @param {Array} fontFamilies - Array of font family configurations
   */
  async loadFonts(fontFamilies) {
    const loadPromises = fontFamilies.map(fontConfig => this.loadFontFamily(fontConfig));
    
    try {
      await Promise.all(loadPromises);
      console.log('All fonts loaded successfully');
    } catch (error) {
      console.warn('Some fonts failed to load:', error);
    }
  }

  /**
   * Load a single font family
   * @param {Object} fontConfig - Font configuration
   */
  async loadFontFamily(fontConfig) {
    const { family, weights, display, preload } = fontConfig;

    // Preload if requested
    if (preload) {
      this.preloadFont(family, weights);
    }

    // Create font faces
    const fontFaces = weights.map(weight => new FontFace(
      family,
      `url(https://fonts.gstatic.com/s/${family.toLowerCase()}/v${this.getFontVersion(family)}/${this.getFontFileName(family, weight)}.woff2)`,
      {
        weight: weight.toString(),
        display: display || 'swap'
      }
    ));

    // Load fonts
    const loadPromises = fontFaces.map(fontFace => {
      document.fonts.add(fontFace);
      return fontFace.load();
    });

    try {
      await Promise.all(loadPromises);
      this.fontsLoaded.add(family);
      console.log(`Font family "${family}" loaded successfully`);
    } catch (error) {
      console.warn(`Failed to load font family "${family}":`, error);
    }
  }

  /**
   * Preload font files
   * @param {string} family - Font family name
   * @param {Array} weights - Font weights to preload
   */
  preloadFont(family, weights) {
    weights.forEach(weight => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.gstatic.com/s/${family.toLowerCase()}/v${this.getFontVersion(family)}/${this.getFontFileName(family, weight)}.woff2`;
      document.head.appendChild(link);
    });
  }

  /**
   * Get font version (simplified)
   * @param {string} family - Font family name
   * @returns {string} Font version
   */
  getFontVersion(family) {
    const versions = {
      'Inter': '15',
      'Playfair Display': '30',
      'Cormorant Garamond': '18',
      'Raleway': '28',
      'Lora': '32',
      'Poppins': '20'
    };
    return versions[family] || '1';
  }

  /**
   * Get font file name
   * @param {string} family - Font family name
   * @param {number} weight - Font weight
   * @returns {string} Font file name
   */
  getFontFileName(family, weight) {
    const weightMap = {
      300: 'Light',
      400: 'Regular',
      500: 'Medium',
      600: 'SemiBold',
      700: 'Bold'
    };

    const familyMap = {
      'Inter': 'inter',
      'Playfair Display': 'playfairdisplay',
      'Cormorant Garamond': 'cormorantgaramond',
      'Raleway': 'raleway',
      'Lora': 'lora',
      'Poppins': 'poppins'
    };

    return `${familyMap[family]}-${weightMap[weight]}`;
  }

  /**
   * Setup font face observer
   */
  setupFontObserver() {
    if ('fonts' in document) {
      document.fonts.addEventListener('loadingdone', (event) => {
        console.log('Font loading completed:', event.fontfaces.length);
        this.emitEvent('fonts-loaded', {
          fonts: Array.from(this.fontsLoaded),
          count: event.fontfaces.length
        });
      });
    }
  }

  // ========== COMPONENT SYSTEM ==========

  /**
   * Setup component theming system
   */
  setupComponentSystem() {
    // Register built-in components
    this.registerComponent('button', this.createButtonTheme());
    this.registerComponent('card', this.createCardTheme());
    this.registerComponent('form', this.createFormTheme());
    this.registerComponent('navigation', this.createNavigationTheme());

    // Setup component observer
    this.setupComponentObserver();
  }

  /**
   * Register a component theme
   * @param {string} name - Component name
   * @param {Object} theme - Component theme configuration
   */
  registerComponent(name, theme) {
    this.components.set(name, theme);
    console.log(`Component "${name}" theme registered`);
  }

  /**
   * Get component theme
   * @param {string} name - Component name
   * @returns {Object} Component theme
   */
  getComponentTheme(name) {
    return this.components.get(name);
  }

  /**
   * Apply theme to component
   * @param {HTMLElement} element - Component element
   * @param {string} componentName - Component name
   */
  applyComponentTheme(element, componentName) {
    const theme = this.getComponentTheme(componentName);
    if (!theme) return;

    const startTime = performance.now();

    // Apply theme classes
    if (theme.classes) {
      theme.classes.forEach(className => element.classList.add(className));
    }

    // Apply theme styles
    if (theme.styles) {
      Object.entries(theme.styles).forEach(([property, value]) => {
        element.style.setProperty(property, value);
      });
    }

    // Apply theme attributes
    if (theme.attributes) {
      Object.entries(theme.attributes).forEach(([attr, value]) => {
        element.setAttribute(attr, value);
      });
    }

    // Update performance metrics
    this.performance.componentRenderTime += performance.now() - startTime;
  }

  /**
   * Setup component observer
   */
  setupComponentObserver() {
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNode(node);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.observers.set('component', observer);
    }
  }

  /**
   * Process a node for theming
   * @param {HTMLElement} node - Node to process
   */
  processNode(node) {
    // Check for data-theme-component attribute
    const componentName = node.getAttribute('data-theme-component');
    if (componentName) {
      this.applyComponentTheme(node, componentName);
    }

    // Process child nodes
    if (node.children) {
      Array.from(node.children).forEach(child => this.processNode(child));
    }
  }

  // ========== COMPONENT THEME DEFINITIONS ==========

  createButtonTheme() {
    return {
      classes: ['btn'],
      styles: {
        '--button-bg': 'var(--brand-primary)',
        '--button-text': 'var(--color-text-inverse)',
        '--button-border': 'var(--brand-primary)',
        '--button-hover-bg': 'var(--brand-primary-dark)',
        '--button-hover-border': 'var(--brand-primary-dark)'
      },
      variants: {
        primary: {
          classes: ['btn-primary'],
          styles: {
            '--button-bg': 'var(--brand-primary)',
            '--button-text': 'var(--color-text-inverse)'
          }
        },
        secondary: {
          classes: ['btn-secondary'],
          styles: {
            '--button-bg': 'transparent',
            '--button-text': 'var(--brand-primary)',
            '--button-border': 'var(--brand-primary)'
          }
        },
        accent: {
          classes: ['btn-accent'],
          styles: {
            '--button-bg': 'var(--brand-accent)',
            '--button-text': 'var(--color-text-inverse)'
          }
        }
      }
    };
  }

  createCardTheme() {
    return {
      classes: ['card'],
      styles: {
        '--card-bg': 'var(--color-surface)',
        '--card-border': 'var(--color-border)',
        '--card-shadow': 'var(--shadow-md)',
        '--card-hover-shadow': 'var(--shadow-lg)',
        '--card-radius': 'var(--radius-lg)'
      }
    };
  }

  createFormTheme() {
    return {
      classes: ['form'],
      styles: {
        '--form-input-bg': 'var(--color-surface)',
        '--form-input-border': 'var(--color-border)',
        '--form-input-text': 'var(--color-text-primary)',
        '--form-input-focus-border': 'var(--color-border-focus)',
        '--form-label-text': 'var(--color-text-primary)'
      }
    };
  }

  createNavigationTheme() {
    return {
      classes: ['navigation'],
      styles: {
        '--nav-bg': 'var(--color-surface)',
        '--nav-text': 'var(--color-text-primary)',
        '--nav-border': 'var(--color-border)',
        '--nav-height': 'var(--nav-height)'
      }
    };
  }

  // ========== ACCESSIBILITY ==========

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Setup screen reader support
    this.setupScreenReaderSupport();

    // Setup focus management
    this.setupFocusManagement();

    // Setup reduced motion
    this.setupReducedMotion();
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      // Theme toggle shortcut (Ctrl/Cmd + Shift + T)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        this.toggleTheme();
      }

      // High contrast toggle (Ctrl/Cmd + Shift + H)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        this.setTheme('high-contrast');
      }
    });
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Announce theme changes
    this.addEventListener('theme-changed', (event) => {
      const announcement = `Theme changed to ${event.detail.current}`;
      this.announceToScreenReader(announcement);
    });
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Enhance focus styles for better visibility
    const style = document.createElement('style');
    style.textContent = `
      .theme-provider.high-contrast *:focus {
        outline: 3px solid var(--brand-primary);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup reduced motion support
   */
  setupReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e) => {
      if (e.matches) {
        document.documentElement.style.setProperty('--transition-all', 'none');
      }
    };

    mediaQuery.addListener(handleReducedMotion);
    handleReducedMotion(mediaQuery);
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // ========== PERFORMANCE MONITORING ==========

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor font loading performance
    if ('PerformanceObserver' in window) {
      const fontObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('font')) {
            console.log(`Font loaded: ${entry.name} in ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      
      fontObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('performance', fontObserver);
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performance,
      fontsLoaded: this.fontsLoaded.size,
      componentsRegistered: this.components.size,
      currentTheme: this.currentTheme
    };
  }

  // ========== SYSTEM THEME DETECTION ==========

  /**
   * Setup system theme detection
   */
  setupSystemThemeDetection() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

      const handleThemeChange = () => {
        if (this.config.autoDetectTheme) {
          let newTheme = 'light';
          
          if (highContrastQuery.matches) {
            newTheme = 'high-contrast';
          } else if (darkModeQuery.matches) {
            newTheme = 'dark';
          }
          
          if (newTheme !== this.systemTheme) {
            this.systemTheme = newTheme;
            this.emitEvent('system-theme-changed', { theme: newTheme });
          }
        }
      };

      darkModeQuery.addListener(handleThemeChange);
      highContrastQuery.addListener(handleThemeChange);

      // Initial detection
      handleThemeChange();
    }
  }

  // ========== STORAGE MANAGEMENT ==========

  /**
   * Save theme preference
   * @param {string} theme - Theme name
   */
  saveThemePreference(theme) {
    try {
      localStorage.setItem(this.config.themeStorageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Load theme preference
   */
  loadThemePreference() {
    try {
      const saved = localStorage.getItem(this.config.themeStorageKey);
      if (saved && this.isValidTheme(saved)) {
        this.currentTheme = saved;
      } else if (this.config.autoDetectTheme) {
        this.currentTheme = this.systemTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      this.currentTheme = 'light';
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Check if theme is valid
   * @param {string} theme - Theme name
   * @returns {boolean} Whether theme is valid
   */
  isValidTheme(theme) {
    return ['light', 'dark', 'high-contrast'].includes(theme);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners && this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Destroy theme provider
   */
  destroy() {
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Clear event listeners
    this.eventListeners.clear();

    // Reset state
    this.fontsLoaded.clear();
    this.components.clear();

    console.log('Theme Provider destroyed');
  }
}

// ========== GLOBAL INITIALIZATION ==========

// Initialize theme provider when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeProvider = new UnifiedThemeProvider();
  });
} else {
  window.themeProvider = new UnifiedThemeProvider();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnifiedThemeProvider;
} else if (typeof window !== 'undefined') {
  window.UnifiedThemeProvider = UnifiedThemeProvider;
}
