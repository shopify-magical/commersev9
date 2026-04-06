/**
 * UX/UI Helpers - 10 Tricks for 9.9/10 Rating
 * Handles all advanced UX/UI interactions and animations
 */

class UXHelpers {
  constructor() {
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupImageLazyLoading();
    this.setupToastSystem();
    this.setupKeyboardNavigation();
  }

  // 2. Mobile Hamburger Menu
  setupMobileMenu() {
    // Create mobile menu structure
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
      <button class="mobile-menu-close" aria-label="Close menu">×</button>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/shop.html">Shop</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/blog.html">Blog</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="/cart.html">Cart</a></li>
          <li><a href="/profile.html">Profile</a></li>
        </ul>
      </nav>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';

    document.body.appendChild(overlay);
    document.body.appendChild(mobileMenu);

    // Create hamburger button if it doesn't exist
    if (!document.querySelector('.hamburger-btn')) {
      const hamburgerBtn = document.createElement('button');
      hamburgerBtn.className = 'hamburger-btn';
      hamburgerBtn.setAttribute('aria-label', 'Toggle mobile menu');
      hamburgerBtn.innerHTML = '<span class="hamburger-icon"></span>';

      // Insert after logo or at the end of header
      const header = document.querySelector('header') || document.querySelector('.header');
      if (header) {
        header.appendChild(hamburgerBtn);
      }
    }

    // Event listeners
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const closeBtn = mobileMenu.querySelector('.mobile-menu-close');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeMobileMenu());
    }

    overlay.addEventListener('click', () => this.closeMobileMenu());

    // ESC key support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('show')) {
        this.closeMobileMenu();
      }
    });

    // Update active menu item
    this.updateActiveMenuItem();
  }

  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const hamburgerBtn = document.querySelector('.hamburger-btn');

    if (mobileMenu.classList.contains('show')) {
      this.closeMobileMenu();
    } else {
      mobileMenu.classList.add('show');
      overlay.classList.add('show');
      hamburgerBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const hamburgerBtn = document.querySelector('.hamburger-btn');

    mobileMenu.classList.remove('show');
    overlay.classList.remove('show');
    hamburgerBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  updateActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.mobile-menu a');

    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // 3. Enhanced Smooth Scrolling
  setupSmoothScrolling() {
    // Handle hash links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        this.scrollToElement(targetElement);
      }
    });
  }

  scrollToElement(element, offset = 20) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  // 10. Image Lazy Loading
  setupImageLazyLoading() {
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  // 7. Toast Notification System
  setupToastSystem() {
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', title = '', duration = 5000) {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    const removeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', removeToast);

    // Auto close
    if (duration > 0) {
      setTimeout(removeToast, duration);
    }

    return toast;
  }

  // 4. Enhanced Keyboard Navigation
  setupKeyboardNavigation() {
    // Tab navigation improvements
    document.addEventListener('keydown', (e) => {
      // Skip link activation
      if (e.key === 'Tab') {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink && document.activeElement === skipLink) {
          // Focus is moving from skip link, scroll to main content
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
          }
        }
      }
    });

    // Focus trap for modals (if any)
    this.setupFocusTrap();
  }

  setupFocusTrap() {
    // Focus trap utility for modals
    window.focusTrap = (element) => {
      const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);

      return () => {
        element.removeEventListener('keydown', handleTabKey);
      };
    };
  }

  // 5. Skeleton Loader Helpers
  createSkeletonLoader(type = 'card') {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-card';

    if (type === 'text') {
      skeleton.innerHTML = `
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 60%;"></div>
      `;
    } else if (type === 'card') {
      skeleton.innerHTML = `
        <div class="skeleton skeleton-avatar" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 80%;"></div>
      `;
    }

    return skeleton;
  }

  showSkeletonLoader(container, type = 'card') {
    const loader = this.createSkeletonLoader(type);
    container.innerHTML = '';
    container.appendChild(loader);
    return loader;
  }

  hideSkeletonLoader(container, content) {
    container.innerHTML = content;
  }

  // 6. Empty State Helper
  createEmptyState(options = {}) {
    const {
      icon = '📦',
      title = 'No items found',
      description = 'Try adjusting your search or filters.',
      actions = []
    } = options;

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    emptyState.innerHTML = `
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-description">${description}</p>
      ${actions.length > 0 ? `
        <div class="empty-state-actions">
          ${actions.map(action =>
            `<a href="${action.href || '#'}" class="btn ${action.primary ? '' : 'btn-secondary'}">${action.label}</a>`
          ).join('')}
        </div>
      ` : ''}
    `;

    return emptyState;
  }

  // 9. Loading Spinner Helper
  createSpinner(size = 'medium') {
    const spinner = document.createElement('div');
    spinner.className = `spinner spinner-${size}`;
    return spinner;
  }

  showLoadingOverlay() {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(overlay);
    }
    overlay.classList.add('show');
  }

  hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  // Utility: Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Utility: Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

// Initialize UX helpers
document.addEventListener('DOMContentLoaded', () => {
  window.UXHelpers = new UXHelpers();

  // Global helper functions
  window.showToast = (message, type, title, duration) =>
    window.UXHelpers.showToast(message, type, title, duration);

  window.showLoading = () => window.UXHelpers.showLoadingOverlay();
  window.hideLoading = () => window.UXHelpers.hideLoadingOverlay();

  window.createEmptyState = (options) => window.UXHelpers.createEmptyState(options);
  window.createSkeletonLoader = (type) => window.UXHelpers.createSkeletonLoader(type);

  window.scrollToElement = (element, offset) => window.UXHelpers.scrollToElement(element, offset);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UXHelpers;
}