// Sweet Layers Analytics & Monitoring Suite
// Google Analytics 4 + Web Vitals + Error Tracking

class AnalyticsSuite {
  constructor() {
    this.config = {
      gaId: 'G-4ZS9L9R9BQ', // Real GA4 Measurement ID
      enableWebVitals: true,
      enableErrorTracking: true,
      enablePerformanceTracking: true
    };
    this.init();
  }

  init() {
    this.loadGoogleAnalytics();
    this.setupWebVitals();
    this.setupErrorTracking();
    this.setupPerformanceTracking();
    this.trackPageView();
  }

  // Google Analytics 4 Setup
  loadGoogleAnalytics() {
    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      dataLayer.push(arguments);
    };
    gtag('js', new Date());
    gtag('config', this.config.gaId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: { 'custom_parameter_1': 'web_vital_score' }
    });
  }

  // Web Vitals Monitoring
  setupWebVitals() {
    if (!this.config.enableWebVitals) return;

    // Load web-vitals library
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    script.onload = () => {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;

      getCLS((metric) => this.sendWebVital('CLS', metric));
      getFID((metric) => this.sendWebVital('FID', metric));
      getFCP((metric) => this.sendWebVital('FCP', metric));
      getLCP((metric) => this.sendWebVital('LCP', metric));
      getTTFB((metric) => this.sendWebVital('TTFB', metric));
    };
    document.head.appendChild(script);
  }

  sendWebVital(name, metric) {
    gtag('event', 'web_vital', {
      metric_name: name,
      metric_value: metric.value,
      metric_id: metric.id,
      custom_parameter_1: metric.value
    });
  }

  // Error Tracking
  setupErrorTracking() {
    if (!this.config.enableErrorTracking) return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript', event.message, event.filename, event.lineno, {
        stack: event.error?.stack,
        column: event.colno
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise', event.reason?.message || 'Unhandled Promise Rejection', 
                     window.location.href, 0, {
        stack: event.reason?.stack,
        reason: event.reason
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError('resource', `Failed to load: ${event.target.src || event.target.href}`, 
                       window.location.href, 0, {
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
  }

  trackError(type, message, file, line, details = {}) {
    gtag('event', 'error', {
      error_type: type,
      error_message: message,
      error_file: file,
      error_line: line,
      custom_parameter_1: JSON.stringify(details)
    });
  }

  // Performance Tracking
  setupPerformanceTracking() {
    if (!this.config.enablePerformanceTracking) return;

    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          gtag('event', 'page_performance', {
            load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
            dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
            first_byte: Math.round(perfData.responseStart - perfData.requestStart),
            custom_parameter_1: Math.round(perfData.loadEventEnd - perfData.navigationStart)
          });
        }
      }, 0);
    });

    // Route changes (for SPA)
    this.setupRouteTracking();
  }

  setupRouteTracking() {
    let currentPath = window.location.pathname;
    
    // Check for route changes every 100ms
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    }, 100);
  }

  trackPageView() {
    gtag('config', this.config.gaId, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // Custom Event Tracking
  track(event, params = {}) {
    gtag('event', event, params);
  }

  // E-commerce Tracking
  trackPurchase(transaction) {
    gtag('event', 'purchase', {
      transaction_id: transaction.id,
      value: transaction.value,
      currency: transaction.currency || 'USD',
      items: transaction.items || []
    });
  }

  trackAddToCart(item) {
    gtag('event', 'add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity
    });
  }

  trackSearch(query, results_count = 0) {
    gtag('event', 'search', {
      search_term: query,
      results_count: results_count
    });
  }
}

// Initialize Analytics Suite
window.AnalyticsSuite = new AnalyticsSuite();

// Export for global access
window.trackEvent = (event, params) => window.AnalyticsSuite.track(event, params);
window.trackError = (type, message, file, line, details) => 
  window.AnalyticsSuite.trackError(type, message, file, line, details);
