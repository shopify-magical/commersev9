/**
 * BookingGo Breadcrumbs Component
 * Renders breadcrumb navigation based on current route
 */

class BreadcrumbComponent {
  constructor(options = {}) {
    this.container = null;
    this.options = {
      containerId: options.containerId || 'breadcrumbs',
      homeLabel: options.homeLabel || 'Home',
      separator: options.separator || '/',
      enableIcons: options.enableIcons !== false,
      maxItems: options.maxItems || 5,
      ...options
    };
    
    this.icons = {
      home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      shop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      cart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      admin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
    };
    
    this.init();
  }
  
  init() {
    this.findContainer();
    this.injectStyles();
    this.listenToRouteChanges();
  }
  
  findContainer() {
    this.container = document.getElementById(this.options.containerId);
    
    // Create container if not found
    if (!this.container) {
      this.container = document.createElement('nav');
      this.container.id = this.options.containerId;
      this.container.className = 'breadcrumb-container';
      
      // Insert at top of main content or body
      const main = document.querySelector('main') || document.body;
      main.insertBefore(this.container, main.firstChild);
    }
  }
  
  injectStyles() {
    if (document.getElementById('breadcrumb-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'breadcrumb-styles';
    styles.textContent = `
      .breadcrumb-container {
        padding: 16px 24px;
        background: var(--bg, #f8fafc);
        border-bottom: 1px solid var(--border, #e2e8f0);
      }
      
      .breadcrumb-list {
        display: flex;
        align-items: center;
        gap: 8px;
        list-style: none;
        margin: 0;
        padding: 0;
        font-size: 0.875rem;
      }
      
      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .breadcrumb-link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--primary, #2A6B52);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
        padding: 4px 8px;
        border-radius: 6px;
      }
      
      .breadcrumb-link:hover {
        color: var(--primary-dark, #1F4A3A);
        background: rgba(42, 107, 82, 0.1);
      }
      
      .breadcrumb-current {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text, #1e293b);
        font-weight: 600;
        padding: 4px 8px;
      }
      
      .breadcrumb-separator {
        color: var(--text-muted, #64748b);
        font-weight: 400;
      }
      
      .breadcrumb-icon {
        flex-shrink: 0;
      }
      
      .breadcrumb-dropdown {
        position: relative;
      }
      
      .breadcrumb-dropdown-toggle {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
      }
      
      .breadcrumb-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        min-width: 200px;
        z-index: 100;
        display: none;
      }
      
      .breadcrumb-dropdown:hover .breadcrumb-dropdown-menu {
        display: block;
      }
      
      /* Collapsed breadcrumbs */
      .breadcrumb-collapsed {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .breadcrumb-ellipsis {
        color: var(--text-muted);
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
      }
      
      .breadcrumb-ellipsis:hover {
        background: rgba(0,0,0,0.05);
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .breadcrumb-container {
          padding: 12px 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .breadcrumb-list {
          flex-wrap: nowrap;
          white-space: nowrap;
        }
        
        .breadcrumb-item:not(:last-child):not(:first-child) {
          display: none;
        }
        
        .breadcrumb-item:first-child::after {
          content: '...';
          color: var(--text-muted);
          margin: 0 8px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  listenToRouteChanges() {
    // Listen to custom route change event
    window.addEventListener('routechange', (e) => {
      this.render(e.detail.to?.breadcrumbs || []);
    });
    
    // Initial render
    if (window.router?.getCurrentRoute()) {
      this.render(window.router.getCurrentRoute().breadcrumbs || []);
    }
  }
  
  render(items = []) {
    if (!this.container) return;
    
    if (!items || items.length === 0) {
      this.container.style.display = 'none';
      return;
    }
    
    this.container.style.display = 'block';
    
    // Handle max items
    let displayItems = items;
    if (items.length > this.options.maxItems) {
      const first = items[0];
      const last = items.slice(-2);
      displayItems = [first, { label: '...', path: null, isEllipsis: true }, ...last];
    }
    
    const html = `
      <ol class="breadcrumb-list">
        ${displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const icon = this.getIconForLabel(item.label);
          
          if (item.isEllipsis) {
            return `
              <li class="breadcrumb-item">
                <span class="breadcrumb-ellipsis">...</span>
              </li>
            `;
          }
          
          if (isLast) {
            return `
              <li class="breadcrumb-item">
                <span class="breadcrumb-current">
                  ${this.options.enableIcons && icon ? `<span class="breadcrumb-icon">${icon}</span>` : ''}
                  ${item.label}
                </span>
              </li>
            `;
          }
          
          return `
            <li class="breadcrumb-item">
              <a href="${item.path}" data-route class="breadcrumb-link">
                ${this.options.enableIcons && icon ? `<span class="breadcrumb-icon">${icon}</span>` : ''}
                ${item.label}
              </a>
              <span class="breadcrumb-separator">${this.options.separator}</span>
            </li>
          `;
        }).join('')}
      </ol>
    `;
    
    this.container.innerHTML = html;
  }
  
  getIconForLabel(label) {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('home')) return this.icons.home;
    if (labelLower.includes('dashboard')) return this.icons.dashboard;
    if (labelLower.includes('shop') || labelLower.includes('store')) return this.icons.shop;
    if (labelLower.includes('cart') || labelLower.includes('checkout')) return this.icons.cart;
    if (labelLower.includes('user') || labelLower.includes('profile') || labelLower.includes('account')) return this.icons.user;
    if (labelLower.includes('admin') || labelLower.includes('super')) return this.icons.admin;
    if (labelLower.includes('setting')) return this.icons.settings;
    
    return null;
  }
  
  update(items) {
    this.render(items);
  }
  
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
  
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }
  
  destroy() {
    if (this.container) {
      this.container.remove();
    }
    
    const styles = document.getElementById('breadcrumb-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Auto-initialize breadcrumbs
document.addEventListener('DOMContentLoaded', () => {
  window.breadcrumbs = new BreadcrumbComponent();
});

// Export
window.BreadcrumbComponent = BreadcrumbComponent;
