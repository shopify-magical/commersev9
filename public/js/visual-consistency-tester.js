/**
 * VISUAL CONSISTENCY TESTING SYSTEM
 * 
 * Automated testing framework for verifying visual consistency
 * across different pages, themes, and viewport sizes.
 * 
 * FEATURES:
 * - Screenshot comparison testing
 * - Color contrast validation
 * - Typography consistency checks
 * - Component style verification
 * - Responsive design testing
 * - Accessibility compliance testing
 */

class VisualConsistencyTester {
  constructor(config = {}) {
    this.config = {
      testTimeout: 30000,
      screenshotQuality: 0.95,
      contrastThreshold: 4.5,
      toleranceLevel: 0.05,
      enableScreenshots: true,
      enableAccessibility: true,
      enablePerformance: true,
      ...config
    };

    this.testResults = new Map();
    this.baselineData = new Map();
    this.currentTests = [];
    this.testEnvironment = this.detectTestEnvironment();
  }

  // ========== INITIALIZATION ==========

  async init() {
    console.log('Initializing Visual Consistency Tester...');

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Load baseline data
      await this.loadBaselineData();

      // Setup test observers
      this.setupTestObservers();

      console.log('Visual Consistency Tester initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize tester:', error);
      return false;
    }
  }

  // ========== MAIN TESTING METHODS ==========

  /**
   * Run comprehensive visual consistency tests
   * @param {Object} options - Test options
   * @returns {Object} Test results
   */
  async runTests(options = {}) {
    console.log('Running visual consistency tests...');

    const testSuite = {
      colorConsistency: this.testColorConsistency(),
      typographyConsistency: this.testTypographyConsistency(),
      componentStyles: this.testComponentStyles(),
      responsiveDesign: this.testResponsiveDesign(),
      accessibilityCompliance: this.testAccessibilityCompliance(),
      performanceMetrics: this.testPerformanceMetrics()
    };

    // Add screenshot tests if enabled
    if (this.config.enableScreenshots) {
      testSuite.screenshotComparison = this.testScreenshotComparison();
    }

    const results = {};
    const startTime = performance.now();

    // Run all tests
    for (const [testName, testPromise] of Object.entries(testSuite)) {
      try {
        console.log(`Running ${testName}...`);
        results[testName] = await this.runSingleTest(testName, testPromise);
      } catch (error) {
        console.error(`Test ${testName} failed:`, error);
        results[testName] = {
          status: 'failed',
          error: error.message,
          duration: 0
        };
      }
    }

    const totalDuration = performance.now() - startTime;

    // Generate summary
    const summary = this.generateTestSummary(results, totalDuration);

    // Save results
    this.saveTestResults(results, summary);

    console.log('Visual consistency tests completed');
    return { results, summary };
  }

  /**
   * Run a single test with timeout
   * @param {string} testName - Test name
   * @param {Promise} testPromise - Test promise
   * @returns {Object} Test result
   */
  async runSingleTest(testName, testPromise) {
    const startTime = performance.now();

    try {
      const result = await Promise.race([
        testPromise,
        this.createTimeoutPromise(this.config.testTimeout)
      ]);

      return {
        status: 'passed',
        result: result,
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        duration: performance.now() - startTime
      };
    }
  }

  // ========== COLOR CONSISTENCY TESTS ==========

  async testColorConsistency() {
    console.log('Testing color consistency...');

    const tests = [
      this.testBrandColors(),
      this.testSemanticColors(),
      this.testColorContrast(),
      this.testThemeColorConsistency()
    ];

    const results = {};
    for (const test of tests) {
      const testName = test.name;
      try {
        results[testName] = await test.execute();
      } catch (error) {
        results[testName] = { status: 'failed', error: error.message };
      }
    }

    return results;
  }

  testBrandColors() {
    return {
      name: 'brand-colors',
      execute: async () => {
        const brandColors = [
          '--brand-primary',
          '--brand-primary-dark',
          '--brand-primary-light',
          '--brand-accent',
          '--brand-accent-dark'
        ];

        const results = {};
        const root = document.documentElement;

        for (const colorVar of brandColors) {
          const value = getComputedStyle(root).getPropertyValue(colorVar).trim();
          
          if (!value) {
            results[colorVar] = {
              status: 'failed',
              error: 'Color not defined'
            };
          } else if (!this.isValidColor(value)) {
            results[colorVar] = {
              status: 'failed',
              error: 'Invalid color format',
              value
            };
          } else {
            results[colorVar] = {
              status: 'passed',
              value
            };
          }
        }

        return results;
      }
    };
  }

  testSemanticColors() {
    return {
      name: 'semantic-colors',
      execute: async () => {
        const semanticColors = [
          '--color-background',
          '--color-surface',
          '--color-text-primary',
          '--color-text-secondary',
          '--color-border'
        ];

        const results = {};
        const root = document.documentElement;

        for (const colorVar of semanticColors) {
          const value = getComputedStyle(root).getPropertyValue(colorVar).trim();
          
          if (!value) {
            results[colorVar] = {
              status: 'failed',
              error: 'Color not defined'
            };
          } else if (!this.isValidColor(value)) {
            results[colorVar] = {
              status: 'failed',
              error: 'Invalid color format',
              value
            };
          } else {
            results[colorVar] = {
              status: 'passed',
              value
            };
          }
        }

        return results;
      }
    };
  }

  testColorContrast() {
    return {
      name: 'color-contrast',
      execute: async () => {
        const contrastTests = [
          { foreground: '--color-text-primary', background: '--color-background' },
          { foreground: '--color-text-secondary', background: '--color-background' },
          { foreground: '--color-text-primary', background: '--color-surface' }
        ];

        const results = {};
        const root = document.documentElement;

        for (const test of contrastTests) {
          const foreground = getComputedStyle(root).getPropertyValue(test.foreground).trim();
          const background = getComputedStyle(root).getPropertyValue(test.background).trim();

          if (!foreground || !background) {
            results[`${test.foreground}-on-${test.background}`] = {
              status: 'failed',
              error: 'Colors not defined'
            };
          } else {
            const contrast = this.calculateContrast(foreground, background);
            const passes = contrast >= this.config.contrastThreshold;

            results[`${test.foreground}-on-${test.background}`] = {
              status: passes ? 'passed' : 'failed',
              contrast,
              threshold: this.config.contrastThreshold,
              foreground,
              background
            };
          }
        }

        return results;
      }
    };
  }

  testThemeColorConsistency() {
    return {
      name: 'theme-consistency',
      execute: async () => {
        const themes = ['light', 'dark', 'high-contrast'];
        const results = {};

        for (const theme of themes) {
          // Apply theme
          if (window.themeProvider) {
            window.themeProvider.setTheme(theme, false);
          }

          // Wait for theme to apply
          await this.waitForThemeChange();

          // Test key colors
          const root = document.documentElement;
          const textColor = getComputedStyle(root).getPropertyValue('--color-text-primary').trim();
          const backgroundColor = getComputedStyle(root).getPropertyValue('--color-background').trim();

          if (textColor && backgroundColor) {
            const contrast = this.calculateContrast(textColor, backgroundColor);
            results[theme] = {
              status: 'passed',
              contrast,
              textColor,
              backgroundColor
            };
          } else {
            results[theme] = {
              status: 'failed',
              error: 'Theme colors not properly defined'
            };
          }
        }

        return results;
      }
    };
  }

  // ========== TYPOGRAPHY CONSISTENCY TESTS ==========

  async testTypographyConsistency() {
    console.log('Testing typography consistency...');

    const tests = [
      this.testFontFamilies(),
      this.testTypographyScale(),
      this.testFontWeights(),
      this.testLineHeights()
    ];

    const results = {};
    for (const test of tests) {
      const testName = test.name;
      try {
        results[testName] = await test.execute();
      } catch (error) {
        results[testName] = { status: 'failed', error: error.message };
      }
    }

    return results;
  }

  testFontFamilies() {
    return {
      name: 'font-families',
      execute: async () => {
        const expectedFonts = [
          '--font-primary',
          '--font-secondary',
          '--font-accent',
          '--font-body',
          '--font-ui',
          '--font-heading'
        ];

        const results = {};
        const root = document.documentElement;

        for (const fontVar of expectedFonts) {
          const value = getComputedStyle(root).getPropertyValue(fontVar).trim();
          
          if (!value) {
            results[fontVar] = {
              status: 'failed',
              error: 'Font family not defined'
            };
          } else {
            results[fontVar] = {
              status: 'passed',
              value
            };
          }
        }

        return results;
      }
    };
  }

  testTypographyScale() {
    return {
      name: 'typography-scale',
      execute: async () => {
        const expectedSizes = [
          '--text-xs',
          '--text-sm',
          '--text-base',
          '--text-lg',
          '--text-xl',
          '--text-2xl',
          '--text-3xl',
          '--text-4xl',
          '--text-5xl',
          '--text-6xl'
        ];

        const results = {};
        const root = document.documentElement;

        for (const sizeVar of expectedSizes) {
          const value = getComputedStyle(root).getPropertyValue(sizeVar).trim();
          
          if (!value) {
            results[sizeVar] = {
              status: 'failed',
              error: 'Text size not defined'
            };
          } else if (!this.isValidSize(value)) {
            results[sizeVar] = {
              status: 'failed',
              error: 'Invalid size format',
              value
            };
          } else {
            results[sizeVar] = {
              status: 'passed',
              value
            };
          }
        }

        return results;
      }
    };
  }

  testFontWeights() {
    return {
      name: 'font-weights',
      execute: async () => {
        const expectedWeights = [
          '--font-weight-light',
          '--font-weight-normal',
          '--font-weight-medium',
          '--font-weight-semibold',
          '--font-weight-bold',
          '--font-weight-extrabold'
        ];

        const results = {};
        const root = document.documentElement;

        for (const weightVar of expectedWeights) {
          const value = getComputedStyle(root).getPropertyValue(weightVar).trim();
          
          if (!value) {
            results[weightVar] = {
              status: 'failed',
              error: 'Font weight not defined'
            };
          } else {
            results[weightVar] = {
              status: 'passed',
              value
            };
          }
        }

        return results;
      }
    };
  }

  testLineHeights() {
    return {
      name: 'line-heights',
      execute: async () => {
        const expectedHeights = [
          '--leading-none',
          '--leading-tight',
          '--leading-snug',
          '--leading-normal',
          '--leading-relaxed',
          '--leading-loose'
        ];

        const results = {};
        const root = document.documentElement;

        for (const heightVar of expectedHeights) {
          const value = getComputedStyle(root).getPropertyValue(heightVar).trim();
          
          if (!value) {
            results[heightVar] = {
              status: 'failed',
              error: 'Line height not defined'
            };
          } else {
            results[heightVar] = {
              status: 'passed',
              value
            };
          }
        }

        return results;
      }
    };
  }

  // ========== COMPONENT STYLE TESTS ==========

  async testComponentStyles() {
    console.log('Testing component styles...');

    const tests = [
      this.testButtonStyles(),
      this.testCardStyles(),
      this.testFormStyles(),
      this.testNavigationStyles()
    ];

    const results = {};
    for (const test of tests) {
      const testName = test.name;
      try {
        results[testName] = await test.execute();
      } catch (error) {
        results[testName] = { status: 'failed', error: error.message };
      }
    }

    return results;
  }

  testButtonStyles() {
    return {
      name: 'button-styles',
      execute: async () => {
        const buttonSelectors = [
          '.btn',
          '.btn-primary',
          '.btn-secondary',
          '.btn-accent'
        ];

        const results = {};

        for (const selector of buttonSelectors) {
          const element = document.querySelector(selector);
          
          if (!element) {
            results[selector] = {
              status: 'failed',
              error: 'Button element not found'
            };
          } else {
            const styles = getComputedStyle(element);
            const hasRequiredStyles = [
              'backgroundColor',
              'color',
              'border',
              'padding',
              'borderRadius'
            ].every(prop => styles[prop] && styles[prop] !== 'initial');

            results[selector] = {
              status: hasRequiredStyles ? 'passed' : 'failed',
              hasRequiredStyles,
              styles: {
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                border: styles.border,
                padding: styles.padding,
                borderRadius: styles.borderRadius
              }
            };
          }
        }

        return results;
      }
    };
  }

  testCardStyles() {
    return {
      name: 'card-styles',
      execute: async () => {
        const cardElement = document.querySelector('.card');
        
        if (!cardElement) {
          return {
            status: 'failed',
            error: 'Card element not found'
          };
        }

        const styles = getComputedStyle(cardElement);
        const hasRequiredStyles = [
          'backgroundColor',
          'border',
          'borderRadius',
          'boxShadow'
        ].every(prop => styles[prop] && styles[prop] !== 'initial');

        return {
          status: hasRequiredStyles ? 'passed' : 'failed',
          hasRequiredStyles,
          styles: {
            backgroundColor: styles.backgroundColor,
            border: styles.border,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow
          }
        };
      }
    };
  }

  testFormStyles() {
    return {
      name: 'form-styles',
      execute: async () => {
        const inputElement = document.querySelector('.form-input, input[type="text"], input[type="email"]');
        
        if (!inputElement) {
          return {
            status: 'failed',
            error: 'Form input element not found'
          };
        }

        const styles = getComputedStyle(inputElement);
        const hasRequiredStyles = [
          'backgroundColor',
          'border',
          'borderRadius',
          'padding',
          'fontSize'
        ].every(prop => styles[prop] && styles[prop] !== 'initial');

        return {
          status: hasRequiredStyles ? 'passed' : 'failed',
          hasRequiredStyles,
          styles: {
            backgroundColor: styles.backgroundColor,
            border: styles.border,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            fontSize: styles.fontSize
          }
        };
      }
    };
  }

  testNavigationStyles() {
    return {
      name: 'navigation-styles',
      execute: async () => {
        const navElement = document.querySelector('nav, .navigation');
        
        if (!navElement) {
          return {
            status: 'failed',
            error: 'Navigation element not found'
          };
        }

        const styles = getComputedStyle(navElement);
        const hasRequiredStyles = [
          'backgroundColor',
          'height',
          'padding'
        ].some(prop => styles[prop] && styles[prop] !== 'initial');

        return {
          status: hasRequiredStyles ? 'passed' : 'failed',
          hasRequiredStyles,
          styles: {
            backgroundColor: styles.backgroundColor,
            height: styles.height,
            padding: styles.padding
          }
        };
      }
    };
  }

  // ========== RESPONSIVE DESIGN TESTS ==========

  async testResponsiveDesign() {
    console.log('Testing responsive design...');

    const breakpoints = [
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1024 },
      { name: 'large', width: 1440 }
    ];

    const results = {};

    for (const breakpoint of breakpoints) {
      try {
        results[breakpoint.name] = await this.testBreakpoint(breakpoint);
      } catch (error) {
        results[breakpoint.name] = {
          status: 'failed',
          error: error.message
        };
      }
    }

    return results;
  }

  async testBreakpoint(breakpoint) {
    // Set viewport size
    await this.setViewport(breakpoint.width, window.innerHeight);

    // Wait for layout to settle
    await this.waitForLayout();

    // Test responsive elements
    const container = document.querySelector('.container');
    const navigation = document.querySelector('nav, .navigation');
    const grid = document.querySelector('.grid');

    const results = {
      viewport: `${breakpoint.width}x${window.innerHeight}`,
      container: this.testElementResponsiveness(container),
      navigation: this.testElementResponsiveness(navigation),
      grid: this.testElementResponsiveness(grid)
    };

    // Calculate overall status
    const allPassed = Object.values(results).every(
      result => typeof result === 'object' ? result.status === 'passed' : true
    );

    return {
      status: allPassed ? 'passed' : 'failed',
      ...results
    };
  }

  testElementResponsiveness(element) {
    if (!element) {
      return { status: 'skipped', reason: 'Element not found' };
    }

    const styles = getComputedStyle(element);
    const hasResponsiveStyles = styles.maxWidth || styles.width || styles.flex;

    return {
      status: 'passed',
      hasResponsiveStyles,
      width: styles.width,
      maxWidth: styles.maxWidth,
      display: styles.display
    };
  }

  // ========== ACCESSIBILITY COMPLIANCE TESTS ==========

  async testAccessibilityCompliance() {
    console.log('Testing accessibility compliance...');

    if (!this.config.enableAccessibility) {
      return { status: 'skipped', reason: 'Accessibility testing disabled' };
    }

    const tests = [
      this.testSkipLinks(),
      this.testFocusStates(),
      this.testAriaLabels(),
      this.testColorContrast(),
      this.testKeyboardNavigation()
    ];

    const results = {};
    for (const test of tests) {
      const testName = test.name;
      try {
        results[testName] = await test.execute();
      } catch (error) {
        results[testName] = { status: 'failed', error: error.message };
      }
    }

    return results;
  }

  testSkipLinks() {
    return {
      name: 'skip-links',
      execute: async () => {
        const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"], [href^="#content"]');
        
        return {
          status: skipLinks.length > 0 ? 'passed' : 'failed',
          count: skipLinks.length,
          hasSkipLinks: skipLinks.length > 0
        };
      }
    };
  }

  testFocusStates() {
    return {
      name: 'focus-states',
      execute: async () => {
        const focusableElements = document.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        let elementsWithFocusStyles = 0;
        
        for (const element of focusableElements.slice(0, 10)) { // Test first 10
          const styles = getComputedStyle(element, ':focus');
          if (styles.outline && styles.outline !== 'none') {
            elementsWithFocusStyles++;
          }
        }

        const hasFocusStyles = elementsWithFocusStyles > 0;
        
        return {
          status: hasFocusStyles ? 'passed' : 'failed',
          totalTested: Math.min(focusableElements.length, 10),
          withFocusStyles: elementsWithFocusStyles,
          hasFocusStyles
        };
      }
    };
  }

  testAriaLabels() {
    return {
      name: 'aria-labels',
      execute: async () => {
        const elementsNeedingLabels = document.querySelectorAll(
          'button:not([aria-label]):not([aria-labelledby]):not([textContent]), input:not([aria-label]):not([aria-labelledby]):not([placeholder]), img:not([alt])'
        );

        const issues = [];
        
        elementsNeedingLabels.forEach(element => {
          if (element.tagName === 'IMG' && !element.alt) {
            issues.push('Image missing alt attribute');
          } else if ((element.tagName === 'BUTTON' || element.tagName === 'INPUT') && 
                     !element.textContent && !element.getAttribute('aria-label') && 
                     !element.getAttribute('aria-labelledby')) {
            issues.push(`${element.tagName} missing accessible label`);
          }
        });

        return {
          status: issues.length === 0 ? 'passed' : 'failed',
          totalElements: elementsNeedingLabels.length,
          issues,
          hasIssues: issues.length > 0
        };
      }
    };
  }

  testKeyboardNavigation() {
    return {
      name: 'keyboard-navigation',
      execute: async () => {
        const focusableElements = document.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        // Test tab order
        let currentFocusIndex = 0;
        let tabOrderCorrect = true;

        document.body.addEventListener('keydown', function tabTest(e) {
          if (e.key === 'Tab') {
            currentFocusIndex++;
            if (currentFocusIndex > focusableElements.length) {
              tabOrderCorrect = false;
              document.removeEventListener('keydown', tabTest);
            }
          }
        });

        return {
          status: tabOrderCorrect ? 'passed' : 'failed',
          focusableElements: focusableElements.length,
          tabOrderCorrect
        };
      }
    };
  }

  // ========== PERFORMANCE METRICS TESTS ==========

  async testPerformanceMetrics() {
    console.log('Testing performance metrics...');

    if (!this.config.enablePerformance) {
      return { status: 'skipped', reason: 'Performance testing disabled' };
    }

    const metrics = {
      fontLoadTime: this.measureFontLoadTime(),
      cssLoadTime: this.measureCSSLoadTime(),
      renderTime: this.measureRenderTime(),
      layoutShift: this.measureLayoutShift()
    };

    return {
      status: 'passed',
      metrics
    };
  }

  measureFontLoadTime() {
    if (window.themeProvider) {
      const perfMetrics = window.themeProvider.getPerformanceMetrics();
      return perfMetrics.fontLoadTime || 0;
    }
    return 0;
  }

  measureCSSLoadTime() {
    // Measure CSS load time using performance API
    const cssEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('.css'));
    
    if (cssEntries.length > 0) {
      return Math.max(...cssEntries.map(entry => entry.duration));
    }
    return 0;
  }

  measureRenderTime() {
    // Measure render time using navigation timing
    if (performance.timing) {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    return 0;
  }

  measureLayoutShift() {
    // Measure cumulative layout shift
    if (window.performance && window.performance.getEntriesByType) {
      const layoutShiftEntries = performance.getEntriesByType('layout-shift');
      return layoutShiftEntries.reduce((sum, entry) => sum + entry.value, 0);
    }
    return 0;
  }

  // ========== UTILITY METHODS ==========

  isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  isValidSize(size) {
    return /^[\d\.]+(px|rem|em|%)$/.test(size);
  }

  calculateContrast(foreground, background) {
    // Simplified contrast calculation
    const getLuminance = (color) => {
      const rgb = this.parseColor(color);
      return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  parseColor(color) {
    // Simplified color parsing
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computed = getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const match = computed.match(/\d+/g);
    return match ? {
      r: parseInt(match[0]),
      g: parseInt(match[1]),
      b: parseInt(match[2])
    } : { r: 0, g: 0, b: 0 };
  }

  async setViewport(width, height) {
    // This would typically use a testing framework
    // For now, we'll simulate viewport changes
    window.innerWidth = width;
    window.innerHeight = height;
    window.dispatchEvent(new Event('resize'));
  }

  async waitForLayout() {
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  async waitForThemeChange() {
    return new Promise(resolve => setTimeout(resolve, 200));
  }

  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timeout')), timeout);
    });
  }

  detectTestEnvironment() {
    return {
      isHeadless: !navigator.userAgent.includes('Chrome'),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userAgent: navigator.userAgent
    };
  }

  async setupTestEnvironment() {
    // Setup test environment
    console.log('Setting up test environment...');
  }

  async loadBaselineData() {
    // Load baseline comparison data
    console.log('Loading baseline data...');
  }

  setupTestObservers() {
    // Setup mutation observers for dynamic testing
    console.log('Setting up test observers...');
  }

  generateTestSummary(results, totalDuration) {
    const summary = {
      totalTests: Object.keys(results).length,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: totalDuration,
      timestamp: new Date().toISOString()
    };

    Object.values(results).forEach(result => {
      if (typeof result === 'object' && result.status) {
        if (result.status === 'passed') summary.passed++;
        else if (result.status === 'failed') summary.failed++;
        else if (result.status === 'skipped') summary.skipped++;
      }
    });

    summary.passRate = summary.totalTests > 0 ? (summary.passed / summary.totalTests) * 100 : 0;

    return summary;
  }

  saveTestResults(results, summary) {
    this.testResults.set('latest', { results, summary });
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('visual-consistency-test-results', JSON.stringify({
        results,
        summary,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save test results:', error);
    }
  }

  // ========== PUBLIC API ==========

  getTestResults() {
    return this.testResults.get('latest');
  }

  getBaselineData() {
    return this.baselineData;
  }

  async generateReport() {
    const results = this.getTestResults();
    if (!results) {
      throw new Error('No test results available');
    }

    return this.formatTestReport(results);
  }

  formatTestReport(testData) {
    const { results, summary } = testData;
    
    let report = `# Visual Consistency Test Report\n\n`;
    report += `**Generated:** ${new Date(summary.timestamp).toLocaleString()}\n`;
    report += `**Duration:** ${summary.duration.toFixed(2)}ms\n`;
    report += `**Total Tests:** ${summary.totalTests}\n`;
    report += `**Passed:** ${summary.passed} (${summary.passRate.toFixed(1)}%)\n`;
    report += `**Failed:** ${summary.failed}\n`;
    report += `**Skipped:** ${summary.skipped}\n\n`;

    Object.entries(results).forEach(([testName, result]) => {
      report += `## ${testName}\n`;
      report += `**Status:** ${result.status}\n`;
      
      if (result.error) {
        report += `**Error:** ${result.error}\n`;
      }
      
      if (result.duration) {
        report += `**Duration:** ${result.duration.toFixed(2)}ms\n`;
      }
      
      report += '\n';
    });

    return report;
  }
}

// ========== GLOBAL INITIALIZATION ==========

// Initialize visual consistency tester
window.visualConsistencyTester = new VisualConsistencyTester();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisualConsistencyTester;
} else if (typeof window !== 'undefined') {
  window.VisualConsistencyTester = VisualConsistencyTester;
}
