/**
 * CROSS-BROWSER POLYFILL SYSTEM
 * 
 * Provides polyfills for modern CSS and JavaScript features
 * Ensures compatibility across browsers while maintaining performance
 */

(function() {
  'use strict';

  // Feature detection utility
  const supports = {
    cssCustomProperties: CSS.supports('--test', '0'),
    cssGrid: CSS.supports('display', 'grid'),
    cssFlexbox: CSS.supports('display', 'flex'),
    cssContainerQueries: CSS.supports('container-type', 'inline-size'),
    cssNesting: CSS.supports('&:hover', '{}'),
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    fetch: 'fetch' in window,
    promise: 'Promise' in window,
    asyncAwait: (async function() {})() instanceof Promise,
    objectFit: CSS.supports('object-fit', 'cover'),
    cssBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)') || 
                      CSS.supports('-webkit-backdrop-filter', 'blur(10px)'),
    cssSticky: CSS.supports('position', 'sticky'),
    cssScrollSnap: CSS.supports('scroll-snap-align', 'start')
  };

  // Add feature detection to document
  document.documentElement.classList.add('js');
  
  Object.keys(supports).forEach(feature => {
    if (supports[feature]) {
      document.documentElement.classList.add(`supports-${feature}`);
    } else {
      document.documentElement.classList.add(`no-${feature}`);
    }
  });

  // Intersection Observer Polyfill
  if (!supports.intersectionObserver) {
    loadScript('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver');
  }

  // Resize Observer Polyfill
  if (!supports.resizeObserver) {
    loadScript('https://polyfill.io/v3/polyfill.min.js?features=ResizeObserver');
  }

  // Fetch Polyfill
  if (!supports.fetch) {
    loadScript('https://unpkg.com/unfetch/dist/unfetch.umd.js');
  }

  // Promise Polyfill
  if (!supports.promise) {
    loadScript('https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js');
  }

  // CSS Custom Properties Fallback
  if (!supports.cssCustomProperties) {
    applyCustomPropertiesFallback();
  }

  // CSS Grid Fallback
  if (!supports.cssGrid) {
    applyGridFallback();
  }

  // Object Fit Polyfill
  if (!supports.objectFit) {
    applyObjectFitPolyfill();
  }

  // Backdrop Filter Fallback
  if (!supports.cssBackdropFilter) {
    applyBackdropFilterFallback();
  }

  // Sticky Position Fallback
  if (!supports.cssSticky) {
    applyStickyFallback();
  }

  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => console.log(`Polyfill loaded: ${src}`);
    script.onerror = () => console.warn(`Failed to load polyfill: ${src}`);
    document.head.appendChild(script);
  }

  function applyCustomPropertiesFallback() {
    // Extract CSS custom properties and apply as inline styles
    const styleSheets = document.styleSheets;
    
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
        
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          
          if (rule.style) {
            const style = rule.style;
            const properties = [];
            
            for (let k = 0; k < style.length; k++) {
              const property = style[k];
              if (property.startsWith('--')) {
                properties.push({
                  name: property,
                  value: style.getPropertyValue(property)
                });
              }
            }
            
            // Apply to matching elements
            if (properties.length > 0 && rule.selectorText) {
              try {
                const elements = document.querySelectorAll(rule.selectorText);
                elements.forEach(element => {
                  properties.forEach(prop => {
                    element.style.setProperty(prop.name, prop.value);
                  });
                });
              } catch (e) {
                // Selector might be invalid
              }
            }
          }
        }
      } catch (e) {
        // CORS issue with stylesheet
      }
    }
  }

  function applyGridFallback() {
    // Convert grid layouts to flexbox for older browsers
    const gridElements = document.querySelectorAll('[class*="grid"]');
    
    gridElements.forEach(element => {
      // Check if it has grid-specific classes
      const hasGrid = element.className.includes('grid-cols') || 
                     element.style.display === 'grid';
      
      if (hasGrid) {
        // Fallback to flexbox
        element.style.display = 'flex';
        element.style.flexWrap = 'wrap';
        
        // Adjust children
        const children = element.children;
        const gridCols = element.className.match(/grid-cols-(\d+)/);
        const cols = gridCols ? parseInt(gridCols[1]) : 2;
        
        Array.from(children).forEach(child => {
          child.style.flex = `0 0 calc(${100 / cols}% - 1rem)`;
          child.style.margin = '0.5rem';
        });
      }
    });
  }

  function applyObjectFitPolyfill() {
    const images = document.querySelectorAll('img[style*="object-fit"]');
    
    images.forEach(img => {
      const objectFit = img.style.objectFit;
      img.style.objectFit = 'fill';
      
      if (objectFit === 'cover' || objectFit === 'contain') {
        const parent = img.parentElement;
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.width = objectFit === 'cover' ? '100%' : 'auto';
        img.style.height = objectFit === 'cover' ? 'auto' : '100%';
        img.style.minWidth = objectFit === 'cover' ? '100%' : 'auto';
        img.style.minHeight = objectFit === 'cover' ? 'auto' : '100%';
      }
    });
  }

  function applyBackdropFilterFallback() {
    const elements = document.querySelectorAll('[style*="backdrop-filter"], [style*="-webkit-backdrop-filter"]');
    
    elements.forEach(element => {
      const backdropFilter = element.style.backdropFilter || 
                             element.style.webkitBackdropFilter;
      
      if (backdropFilter) {
        // Fallback to solid background with opacity
        const backgroundColor = window.getComputedStyle(element).backgroundColor;
        element.style.backgroundColor = backgroundColor;
        element.style.backdropFilter = 'none';
        element.style.webkitBackdropFilter = 'none';
      }
    });
  }

  function applyStickyFallback() {
    const stickyElements = document.querySelectorAll('[style*="position: sticky"], .sticky');
    
    stickyElements.forEach(element => {
      // Use position: fixed with JavaScript for sticky behavior
      const originalPosition = element.style.position;
      const originalTop = element.style.top;
      
      element.style.position = 'fixed';
      
      let stickyOffset = 0;
      if (originalTop) {
        stickyOffset = parseInt(originalTop) || 0;
      }
      
      const scrollHandler = () => {
        const scrollY = window.scrollY;
        const elementRect = element.getBoundingClientRect();
        
        if (scrollY > stickyOffset) {
          element.style.top = '0';
        } else {
          element.style.top = (stickyOffset - scrollY) + 'px';
        }
      };
      
      window.addEventListener('scroll', scrollHandler);
      element.dataset.stickyHandler = 'true';
    });
  }

  // Container Query Polyfill (basic implementation)
  if (!supports.cssContainerQueries) {
    applyContainerQueryPolyfill();
  }

  function applyContainerQueryPolyfill() {
    const containers = document.querySelectorAll('[class*="container"]');
    
    containers.forEach(container => {
      const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const width = entry.contentRect.width;
          const children = container.children;
          
          // Apply responsive classes based on width
          if (width < 400) {
            container.classList.add('container-sm');
            container.classList.remove('container-md', 'container-lg');
          } else if (width < 800) {
            container.classList.add('container-md');
            container.classList.remove('container-sm', 'container-lg');
          } else {
            container.classList.add('container-lg');
            container.classList.remove('container-sm', 'container-md');
          }
        });
      });
      
      resizeObserver.observe(container);
    });
  }

  // CSS Nesting Polyfill (PostCSS-like processing)
  if (!supports.cssNesting) {
    applyNestingPolyfill();
  }

  function applyNestingPolyfill() {
    // This would typically be handled by a build tool like PostCSS
    // For runtime, we can use a simple selector expansion
    const nestedRules = document.querySelectorAll('style');
    
    nestedRules.forEach(style => {
      const cssText = style.textContent;
      // Simple nesting expansion (basic implementation)
      const expanded = cssText.replace(/(\w+)\s*{/g, function(match, selector) {
        if (selector.includes('&')) {
          return selector.replace(/&/g, '');
        }
        return match;
      });
      
      if (cssText !== expanded) {
        style.textContent = expanded;
      }
    });
  }

  // Smooth Scroll Polyfill
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Add smooth scroll JavaScript fallback
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Console log feature support
  console.log('Browser Feature Support:', supports);
  console.log('Polyfills loaded successfully');

})();
