/**
 * Performance Optimizer Suite
 * Lazy loading, code splitting, and resource optimization
 */

(function() {
  'use strict';

  const PerformanceOptimizer = {
    // Initialize all optimizations
    init() {
      this.setupLazyLoading();
      this.setupResourceHints();
      this.optimizeEventListeners();
      this.setupIntersectionObservers();
      this.prefetchCriticalResources();
      this.optimizeThirdPartyScripts();
    },

    // Advanced lazy loading with Intersection Observer
    setupLazyLoading() {
      // Check for native lazy loading support
      if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        this.enhanceNativeLazyLoading();
      } else {
        // Fallback to Intersection Observer
        this.setupIntersectionObserverFallback();
      }
      
      // Lazy load iframes and videos
      this.lazyLoadEmbeds();
      
      // Lazy load CSS (non-critical)
      this.lazyLoadCSS();
    },

    enhanceNativeLazyLoading() {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.loading = 'lazy';
          img.removeAttribute('data-src');
        }
      });
    },

    setupIntersectionObserverFallback() {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    },

    loadImage(img) {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;
      
      if (!src) return;

      // Create new image to preload
      const preloadImg = new Image();
      
      preloadImg.onload = () => {
        img.src = src;
        if (srcset) img.srcset = srcset;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
      };
      
      preloadImg.onerror = () => {
        img.classList.add('error');
        // Try fallback
        if (img.dataset.fallback) {
          img.src = img.dataset.fallback;
        }
      };
      
      preloadImg.src = src;
    },

    lazyLoadEmbeds() {
      const embedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const embed = entry.target;
            const src = embed.dataset.src;
            
            if (src && !embed.src) {
              embed.src = src;
              embed.classList.add('loaded');
            }
          }
        });
      }, { rootMargin: '100px' });

      document.querySelectorAll('iframe[data-src], video[data-src]').forEach(embed => {
        embedObserver.observe(embed);
      });
    },

    lazyLoadCSS() {
      // Load non-critical CSS after page load
      window.addEventListener('load', () => {
        const lazyStyles = document.querySelectorAll('link[data-async-css]');
        lazyStyles.forEach(link => {
          link.rel = 'stylesheet';
          link.removeAttribute('data-async-css');
        });
      });
    },

    // Resource hints for performance
    setupResourceHints() {
      const head = document.head;
      
      // Preconnect to critical domains
      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com',
        'https://unpkg.com'
      ];
      
      preconnectDomains.forEach(domain => {
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = domain.includes('gstatic') ? 'anonymous' : '';
          head.appendChild(link);
        }
      });

      // DNS prefetch for analytics
      const dnsPrefetchDomains = [
        'https://www.google-analytics.com',
        'https://connect.facebook.net'
      ];
      
      dnsPrefetchDomains.forEach(domain => {
        if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          head.appendChild(link);
        }
      });
    },

    // Optimize event listeners with delegation
    optimizeEventListeners() {
      // Debounce scroll events
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
          scrollTimeout = null;
        }, 16); // ~60fps
      }, { passive: true });

      // Debounce resize events
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('resizeEnd'));
        }, 250);
      }, { passive: true });
    },

    // Intersection observers for animations and lazy loading
    setupIntersectionObservers() {
      // Animate elements when they come into view
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            animationObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('[data-animate]').forEach(el => {
        animationObserver.observe(el);
      });
    },

    // Prefetch critical resources
    prefetchCriticalResources() {
      // Prefetch likely next pages
      const prefetchLinks = document.querySelectorAll('a[data-prefetch]');
      
      prefetchLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          const href = link.href;
          if (!document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.href = href;
            document.head.appendChild(prefetch);
          }
        }, { once: true });
      });
    },

    // Optimize third-party scripts
    optimizeThirdPartyScripts() {
      // Defer non-critical scripts
      const deferredScripts = document.querySelectorAll('script[data-defer]');
      
      window.addEventListener('load', () => {
        deferredScripts.forEach(script => {
          const newScript = document.createElement('script');
          newScript.src = script.dataset.src || script.src;
          newScript.async = true;
          document.body.appendChild(newScript);
          script.remove();
        });
      });

      // Lazy load analytics
      if (window.gtag || window.ga) {
        this.lazyLoadAnalytics();
      }
    },

    lazyLoadAnalytics() {
      // Wait for user interaction before loading analytics
      const events = ['scroll', 'click', 'mousemove', 'touchstart'];
      let analyticsLoaded = false;
      
      const loadAnalytics = () => {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        
        // Remove listeners
        events.forEach(event => {
          document.removeEventListener(event, loadAnalytics);
        });
        
        // Load analytics
        if (window.loadGoogleAnalytics) {
          window.loadGoogleAnalytics();
        }
      };
      
      events.forEach(event => {
        document.addEventListener(event, loadAnalytics, { passive: true, once: true });
      });
      
      // Fallback: load after 5 seconds
      setTimeout(loadAnalytics, 5000);
    },

    // Utility: Check if element is in viewport
    isInViewport(element, threshold = 0) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= -threshold &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // Utility: Measure performance
    measurePerformance() {
      // Web Vitals
      if ('web-vitals' in window) {
        // Already loaded
        return;
      }
      
      // Simple performance measurement
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          
          console.log('Performance Metrics:', {
            pageLoadTime: pageLoadTime + 'ms',
            domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart + 'ms',
            firstPaint: perfData.responseEnd - perfData.navigationStart + 'ms'
          });
        }, 0);
      });
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
  } else {
    PerformanceOptimizer.init();
  }

  // Expose globally
  window.PerformanceOptimizer = PerformanceOptimizer;
})();
