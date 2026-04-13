/**
 * PERFORMANCE MONITORING SYSTEM
 * 
 * Comprehensive performance monitoring for Core Web Vitals and custom metrics
 * Tracks FCP, LCP, CLS, FID, TTI, and custom performance indicators
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      reportToAnalytics: options.reportToAnalytics !== false,
      reportToConsole: options.reportToConsole !== false,
      sampleRate: options.sampleRate || 1.0,
      thresholds: {
        FCP: 1800, // First Contentful Paint (ms)
        LCP: 2500, // Largest Contentful Paint (ms)
        CLS: 0.1,  // Cumulative Layout Shift
        FID: 100,  // First Input Delay (ms)
        TTI: 3800, // Time to Interactive (ms)
        TBT: 300,  // Total Blocking Time (ms)
        ...options.thresholds
      },
      ...options
    };
    
    this.metrics = {};
    this.observers = [];
    this.init();
  }

  init() {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => this.collectMetrics());
    }

    // Set up observers for Core Web Vitals
    this.setupObservers();
  }

  setupObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.LCP = Math.round(lastEntry.startTime);
          this.reportMetric('LCP', this.metrics.LCP);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.metrics.CLS = clsValue.toFixed(4);
          this.reportMetric('CLS', this.metrics.CLS);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.FID = Math.round(entry.processingStart - entry.startTime);
            this.reportMetric('FID', this.metrics.FID);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = Math.round(entry.startTime);
              this.reportMetric('FCP', this.metrics.FCP);
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }

  collectMetrics() {
    const perfData = performance.getEntriesByType('navigation')[0] || performance.timing;
    
    // Basic timing metrics
    this.metrics.domContentLoaded = Math.round(
      (perfData.domContentLoadedEventEnd - perfData.navigationStart) || 
      (perfData.domContentLoadedEventEnd - perfData.navigationStart)
    );
    
    this.metrics.loadComplete = Math.round(
      (perfData.loadEventEnd - perfData.navigationStart) ||
      (perfData.loadEventEnd - perfData.navigationStart)
    );

    // Calculate Time to Interactive (simplified)
    this.metrics.TTI = Math.round(
      this.metrics.domContentLoaded + 100
    );

    // Calculate Total Blocking Time (simplified)
    this.metrics.TBT = Math.max(0, this.metrics.domContentLoaded - this.metrics.FCP - 50);

    // Report all metrics
    this.reportAllMetrics();
  }

  reportMetric(name, value) {
    const threshold = this.options.thresholds[name];
    const status = this.getStatus(value, threshold);
    
    if (this.options.reportToConsole) {
      const statusIcon = status === 'good' ? '✅' : status === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${name}: ${value}${name === 'CLS' ? '' : 'ms'} (Target: ${threshold}${name === 'CLS' ? '' : 'ms'})`);
    }

    if (this.options.reportToAnalytics && Math.random() < this.options.sampleRate) {
      this.sendToAnalytics(name, value, status);
    }
  }

  reportAllMetrics() {
    if (this.options.reportToConsole) {
      console.group('📊 Performance Metrics');
      Object.entries(this.metrics).forEach(([name, value]) => {
        this.reportMetric(name, value);
      });
      console.groupEnd();
    }
  }

  getStatus(value, threshold) {
    if (!threshold) return 'unknown';
    
    if (typeof value === 'number') {
      if (value <= threshold) return 'good';
      if (value <= threshold * 1.5) return 'needs-improvement';
      return 'poor';
    }
    
    return 'unknown';
  }

  sendToAnalytics(name, value, status) {
    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        name: name,
        value: value,
        event_label: status,
        non_interaction: true
      });
    }

    // Send to custom analytics endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metric: name,
          value: value,
          status: status,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Silently fail analytics requests
      });
    }
  }

  // Custom metric tracking
  trackCustomMetric(name, value, category = 'custom') {
    this.metrics[name] = value;
    this.reportMetric(name, value);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: category,
        value: value,
        non_interaction: true
      });
    }
  }

  // Track resource timing
  trackResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    const resourceMetrics = {
      total: resources.length,
      byType: {},
      slowResources: []
    };

    resources.forEach(resource => {
      const type = resource.initiatorType || 'other';
      if (!resourceMetrics.byType[type]) {
        resourceMetrics.byType[type] = { count: 0, totalDuration: 0 };
      }
      
      resourceMetrics.byType[type].count++;
      resourceMetrics.byType[type].totalDuration += resource.duration;

      // Track slow resources (>2s)
      if (resource.duration > 2000) {
        resourceMetrics.slowResources.push({
          name: resource.name,
          duration: Math.round(resource.duration),
          type: type
        });
      }
    });

    this.trackCustomMetric('resource_count', resourceMetrics.total);
    this.trackCustomMetric('slow_resources', resourceMetrics.slowResources.length);
    
    return resourceMetrics;
  }

  // Get performance score (0-100)
  getPerformanceScore() {
    const weights = {
      LCP: 0.25,
      CLS: 0.25,
      FID: 0.25,
      TTI: 0.25
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = this.metrics[metric];
      const threshold = this.options.thresholds[metric];
      
      if (value && threshold) {
        const score = this.getMetricScore(value, threshold);
        totalScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  }

  getMetricScore(value, threshold) {
    if (value <= threshold) return 1;
    if (value <= threshold * 1.5) return 0.5;
    return 0.25;
  }

  // Generate performance report
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metrics: this.metrics,
      score: this.getPerformanceScore(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo()
    };
  }

  getConnectionInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialize performance monitor
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
  });
} else {
  window.performanceMonitor = new PerformanceMonitor();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
