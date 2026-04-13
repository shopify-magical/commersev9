/**
 * LAZY LOADING SYSTEM
 * 
 * Advanced lazy loading for CSS, JavaScript, and images
 * Improves First Contentful Paint (FCP) and Time to Interactive (TTI)
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '200px',
      threshold: options.threshold || 0.01,
      loadImages: options.loadImages !== false,
      loadScripts: options.loadScripts !== false,
      loadStyles: options.loadStyles !== false,
      ...options
    };
    
    this.observer = null;
    this.loadedResources = new Set();
    this.init();
  }

  init() {
    // Initialize Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.onIntersection.bind(this),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );
    }

    // Start lazy loading different resource types
    if (this.options.loadImages) this.lazyLoadImages();
    if (this.options.loadScripts) this.lazyLoadScripts();
    if (this.options.loadStyles) this.lazyLoadStyles();
  }

  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        this.loadResource(element);
        this.observer.unobserve(element);
      }
    });
  }

  loadResource(element) {
    const resourceType = element.dataset.lazyType;
    const resourceSrc = element.dataset.lazySrc;

    if (this.loadedResources.has(resourceSrc)) return;
    this.loadedResources.add(resourceSrc);

    switch (resourceType) {
      case 'image':
        this.loadImage(element, resourceSrc);
        break;
      case 'script':
        this.loadScript(resourceSrc);
        break;
      case 'style':
        this.loadStyle(resourceSrc);
        break;
      case 'background':
        this.loadBackground(element, resourceSrc);
        break;
    }
  }

  lazyLoadImages() {
    // Lazy load images with data-src attribute
    const images = document.querySelectorAll('img[data-lazy-src]');
    images.forEach(img => {
      img.dataset.lazyType = 'image';
      if (this.observer) {
        this.observer.observe(img);
      } else {
        // Fallback for browsers without IntersectionObserver
        this.loadResource(img);
      }
    });

    // Lazy load background images
    const backgrounds = document.querySelectorAll('[data-lazy-background]');
    backgrounds.forEach(bg => {
      bg.dataset.lazyType = 'background';
      bg.dataset.lazySrc = bg.dataset.lazyBackground;
      if (this.observer) {
        this.observer.observe(bg);
      } else {
        this.loadResource(bg);
      }
    });
  }

  loadImage(element, src) {
    const img = new Image();
    
    img.onload = () => {
      element.src = src;
      element.classList.add('lazy-loaded');
      element.removeAttribute('data-lazy-src');
      element.removeAttribute('data-lazy-type');
    };
    
    img.onerror = () => {
      element.classList.add('lazy-error');
      console.warn(`Failed to load image: ${src}`);
    };
    
    img.src = src;
  }

  loadBackground(element, src) {
    const img = new Image();
    
    img.onload = () => {
      element.style.backgroundImage = `url(${src})`;
      element.classList.add('lazy-loaded');
      element.removeAttribute('data-lazy-background');
    };
    
    img.onerror = () => {
      element.classList.add('lazy-error');
      console.warn(`Failed to load background: ${src}`);
    };
    
    img.src = src;
  }

  lazyLoadScripts() {
    // Lazy load scripts with data-lazy-script attribute
    const scripts = document.querySelectorAll('[data-lazy-script]');
    scripts.forEach(script => {
      script.dataset.lazyType = 'script';
      script.dataset.lazySrc = script.dataset.lazyScript;
      
      if (this.observer) {
        this.observer.observe(script);
      } else {
        this.loadResource(script);
      }
    });
  }

  loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      console.log(`Script loaded: ${src}`);
    };
    script.onerror = () => {
      console.warn(`Failed to load script: ${src}`);
    };
    document.head.appendChild(script);
  }

  lazyLoadStyles() {
    // Lazy load CSS with data-lazy-style attribute
    const styles = document.querySelectorAll('[data-lazy-style]');
    styles.forEach(style => {
      style.dataset.lazyType = 'style';
      style.dataset.lazySrc = style.dataset.lazyStyle;
      
      if (this.observer) {
        this.observer.observe(style);
      } else {
        this.loadResource(style);
      }
    });
  }

  loadStyle(src) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = () => {
      console.log(`Style loaded: ${src}`);
    };
    link.onerror = () => {
      console.warn(`Failed to load style: ${src}`);
    };
    document.head.appendChild(link);
  }

  // Dynamic import for JavaScript modules
  async loadModule(modulePath) {
    try {
      const module = await import(modulePath);
      console.log(`Module loaded: ${modulePath}`);
      return module;
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  // Preload critical resources
  preloadResource(src, type = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }
    
    document.head.appendChild(link);
  }

  // Prefetch resources for future navigation
  prefetchResource(src) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    document.head.appendChild(link);
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedResources.clear();
  }
}

// Initialize lazy loader on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
  });
} else {
  window.lazyLoader = new LazyLoader();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
}
