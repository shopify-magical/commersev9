/**
 * BookingGo Router - Comprehensive Client-Side Routing System
 * Features: Route guards, breadcrumbs, lazy loading, transitions, error handling
 */

class BookingGoRouter {
  constructor(options = {}) {
    // Configuration
    this.options = {
      basePath: options.basePath || '',
      defaultRoute: options.defaultRoute || '/',
      authRedirect: options.authRedirect || '/login.html',
      notFoundRedirect: options.notFoundRedirect || '/404.html',
      enableTransitions: options.enableTransitions !== false,
      transitionDuration: options.transitionDuration || 300,
      enableBreadcrumbs: options.enableBreadcrumbs !== false,
      enableLoading: options.enableLoading !== false,
      lazyLoadThreshold: options.lazyLoadThreshold || 100,
      ...options
    };

    // Route registry
    this.routes = new Map();
    this.middlewares = [];
    this.guards = new Map();
    this.routeCache = new Map();
    this.lazyLoadModules = new Map();

    // Navigation state
    this.currentRoute = null;
    this.previousRoute = null;
    this.navigationHistory = [];
    this.isNavigating = false;

    // State management
    this.state = {
      user: null,
      permissions: [],
      metadata: {},
      queryParams: {},
      routeParams: {}
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize the router
   */
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      this.handlePopState(e);
    });

    // Intercept all link clicks
    document.addEventListener('click', (e) => this.handleLinkClick(e));

    // Handle initial route
    this.handleInitialRoute();

    console.log('🚀 BookingGo Router initialized');
  }

  /**
   * Register a route
   */
  route(path, config = {}) {
    const routeConfig = {
      path,
      title: config.title || this.generateTitle(path),
      template: config.template || null,
      component: config.component || null,
      lazyLoad: config.lazyLoad || false,
      loadStrategy: config.loadStrategy || 'immediate', // immediate, lazy, prefetch
      auth: config.auth || { required: false, roles: [], permissions: [] },
      guards: config.guards || [],
      breadcrumbs: config.breadcrumbs || this.generateBreadcrumbs(path),
      parent: config.parent || null,
      children: config.children || [],
      meta: config.meta || {},
      queryParams: config.queryParams || [],
      onEnter: config.onEnter || null,
      onLeave: config.onLeave || null,
      onUpdate: config.onUpdate || null,
      transition: config.transition || 'fade',
      preserveState: config.preserveState || false,
      ...config
    };

    this.routes.set(path, routeConfig);

    // Register child routes
    if (routeConfig.children.length > 0) {
      routeConfig.children.forEach(child => {
        const childPath = path === '/' ? `/${child.path}` : `${path}/${child.path}`;
        this.route(childPath, { ...child, parent: path });
      });
    }

    return this;
  }

  /**
   * Add middleware function
   */
  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push(middleware);
    }
    return this;
  }

  /**
   * Add route guard
   */
  guard(name, guardFn) {
    this.guards.set(name, guardFn);
    return this;
  }

  /**
   * Navigate to a route
   */
  async navigate(to, options = {}) {
    if (this.isNavigating && !options.force) {
      console.warn('Navigation in progress, ignoring request');
      return false;
    }

    this.isNavigating = true;

    try {
      // Parse route and query params
      const { path, query, hash } = this.parseUrl(to);
      const targetRoute = this.findRoute(path);

      // Show loading state
      if (this.options.enableLoading) {
        this.showLoading();
      }

      // Execute pre-navigation middlewares
      const context = {
        from: this.currentRoute,
        to: targetRoute,
        path,
        query,
        hash,
        state: this.state,
        cancel: () => { throw new Error('Navigation cancelled'); }
      };

      for (const middleware of this.middlewares) {
        await middleware(context);
      }

      // Check route guards
      if (targetRoute) {
        const guardResult = await this.checkGuards(targetRoute, context);
        if (guardResult !== true) {
          if (typeof guardResult === 'string') {
            await this.navigate(guardResult, { ...options, force: true });
            return false;
          }
          throw new Error('Navigation blocked by guard');
        }
      }

      // Call onLeave for current route
      if (this.currentRoute?.onLeave) {
        await this.currentRoute.onLeave(context);
      }

      // Update state
      this.previousRoute = this.currentRoute;
      this.currentRoute = targetRoute;
      this.state.queryParams = query;
      this.state.routeParams = this.extractRouteParams(path, targetRoute);

      // Add to history
      this.navigationHistory.push({
        path,
        query,
        timestamp: Date.now(),
        title: targetRoute?.title || path
      });

      // Perform navigation
      if (targetRoute?.lazyLoad) {
        await this.lazyLoadRoute(targetRoute);
      }

      // Update URL
      const url = this.buildUrl(path, query, hash);
      if (options.replace) {
        window.history.replaceState({ path, query, hash }, '', url);
      } else {
        window.history.pushState({ path, query, hash }, '', url);
      }

      // Update page
      await this.renderRoute(targetRoute, context);

      // Call onEnter for new route
      if (targetRoute?.onEnter) {
        await targetRoute.onEnter(context);
      }

      // Update breadcrumbs
      if (this.options.enableBreadcrumbs) {
        this.renderBreadcrumbs(targetRoute);
      }

      // Update document title
      if (targetRoute?.title) {
        document.title = `${targetRoute.title} - BookingGo`;
      }

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('routechange', {
        detail: { from: this.previousRoute, to: targetRoute, path, query }
      }));

      this.isNavigating = false;
      this.hideLoading();

      return true;

    } catch (error) {
      console.error('Navigation error:', error);
      this.isNavigating = false;
      this.hideLoading();

      if (error.message === 'Navigation cancelled') {
        return false;
      }

      // Handle error
      await this.handleNavigationError(error, to);
      return false;
    }
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    window.history.forward();
  }

  /**
   * Handle browser back/forward
   */
  async handlePopState(e) {
    const state = e.state;
    if (state && state.path) {
      await this.navigate(state.path, { replace: true, force: true });
    }
  }

  /**
   * Handle link clicks
   */
  handleLinkClick(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    
    // Ignore external links, anchors, and special protocols
    if (href.startsWith('http') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        link.hasAttribute('download') ||
        link.hasAttribute('data-external')) {
      return;
    }

    // Check if it's a router link
    if (link.hasAttribute('data-route') || href.endsWith('.html') || href.startsWith('/')) {
      e.preventDefault();
      this.navigate(href);
    }
  }

  /**
   * Handle initial route on page load
   */
  async handleInitialRoute() {
    const currentPath = window.location.pathname + window.location.search;
    const cleanPath = currentPath.replace(this.options.basePath, '') || '/';
    
    await this.navigate(cleanPath, { replace: true });
  }

  /**
   * Find matching route
   */
  findRoute(path) {
    // Direct match
    if (this.routes.has(path)) {
      return this.routes.get(path);
    }

    // Check for parameterized routes
    for (const [routePath, route] of this.routes) {
      if (this.matchRoute(path, routePath)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Match path against route pattern
   */
  matchRoute(path, pattern) {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/:([^/]+)/g, '([^/]+)')  // :id -> ([^/]+)
      .replace(/\*/g, '(.*)');          // * -> (.*)
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Extract route parameters
   */
  extractRouteParams(path, route) {
    if (!route) return {};
    
    const params = {};
    const pattern = route.path;
    
    // Extract parameter names from pattern
    const paramNames = [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
    
    if (paramNames.length > 0) {
      const regexPattern = pattern.replace(/:([^/]+)/g, '([^/]+)');
      const regex = new RegExp(`^${regexPattern}$`);
      const matches = path.match(regex);
      
      if (matches) {
        paramNames.forEach((name, index) => {
          params[name] = matches[index + 1];
        });
      }
    }
    
    return params;
  }

  /**
   * Parse URL into components
   */
  parseUrl(url) {
    const [pathPart, hashPart] = url.split('#');
    const [path, queryString] = pathPart.split('?');
    
    const query = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }
    
    return {
      path: path.replace(this.options.basePath, '') || '/',
      query,
      hash: hashPart || null
    };
  }

  /**
   * Build URL from components
   */
  buildUrl(path, query = {}, hash = null) {
    let url = this.options.basePath + path;
    
    const queryString = Object.entries(query)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    
    if (queryString) {
      url += '?' + queryString;
    }
    
    if (hash) {
      url += '#' + hash;
    }
    
    return url;
  }

  /**
   * Check all route guards
   */
  async checkGuards(route, context) {
    // Check authentication
    if (route.auth?.required) {
      if (!this.isAuthenticated()) {
        return this.options.authRedirect;
      }
      
      if (route.auth.roles?.length > 0) {
        const hasRole = route.auth.roles.some(role => this.hasRole(role));
        if (!hasRole) {
          return '/unauthorized.html';
        }
      }
      
      if (route.auth.permissions?.length > 0) {
        const hasPermission = route.auth.permissions.every(p => this.hasPermission(p));
        if (!hasPermission) {
          return '/unauthorized.html';
        }
      }
    }

    // Run custom guards
    for (const guardName of route.guards) {
      const guard = this.guards.get(guardName);
      if (guard) {
        const result = await guard(context);
        if (result !== true) {
          return result;
        }
      }
    }

    return true;
  }

  /**
   * Authentication check
   */
  isAuthenticated() {
    return !!this.state.user;
  }

  /**
   * Role check
   */
  hasRole(role) {
    return this.state.user?.roles?.includes(role) || false;
  }

  /**
   * Permission check
   */
  hasPermission(permission) {
    return this.state.permissions.includes(permission);
  }

  /**
   * Set authenticated user
   */
  setUser(user) {
    this.state.user = user;
    this.state.permissions = user?.permissions || [];
  }

  /**
   * Clear authenticated user
   */
  logout() {
    this.state.user = null;
    this.state.permissions = [];
    this.navigate(this.options.authRedirect);
  }

  /**
   * Lazy load route component
   */
  async lazyLoadRoute(route) {
    if (this.lazyLoadModules.has(route.path)) {
      return this.lazyLoadModules.get(route.path);
    }

    if (route.component) {
      try {
        const module = await route.component();
        this.lazyLoadModules.set(route.path, module);
        return module;
      } catch (error) {
        console.error('Failed to lazy load route:', error);
        throw error;
      }
    }
  }

  /**
   * Render the current route
   */
  async renderRoute(route, context) {
    if (!route) {
      // Handle 404
      await this.render404();
      return;
    }

    // Apply transition
    if (this.options.enableTransitions) {
      await this.applyTransition(route.transition);
    }

    // Render content if template/component provided
    if (route.template) {
      const container = document.getElementById('router-view') || document.body;
      
      if (typeof route.template === 'string') {
        container.innerHTML = route.template;
      } else if (typeof route.template === 'function') {
        container.innerHTML = route.template(context);
      }
    }
  }

  /**
   * Apply page transition
   */
  async applyTransition(type) {
    const container = document.getElementById('router-view') || document.body;
    
    container.style.opacity = '0';
    container.style.transition = `opacity ${this.options.transitionDuration}ms ease`;
    
    await new Promise(resolve => setTimeout(resolve, this.options.transitionDuration));
    
    container.style.opacity = '1';
  }

  /**
   * Render 404 page
   */
  async render404() {
    const container = document.getElementById('router-view') || document.body;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <h1 style="font-size: 6rem; color: var(--gray-300); margin-bottom: 20px;">404</h1>
        <h2 style="font-size: 1.5rem; color: var(--brown); margin-bottom: 16px;">Page Not Found</h2>
        <p style="color: var(--gray-500); margin-bottom: 24px;">The page you're looking for doesn't exist.</p>
        <button onclick="router.navigate('/')" class="btn btn-primary">Go Home</button>
      </div>
    `;
    
    document.title = '404 - Page Not Found - BookingGo';
  }

  /**
   * Render breadcrumbs
   */
  renderBreadcrumbs(route) {
    if (!route?.breadcrumbs) return;

    const container = document.getElementById('breadcrumbs') || document.getElementById('breadcrumb');
    if (!container) return;

    const items = route.breadcrumbs.map((crumb, index) => {
      const isLast = index === route.breadcrumbs.length - 1;
      
      if (isLast) {
        return `<span class="breadcrumb-current">${crumb.label}</span>`;
      }
      
      return `<a href="${crumb.path}" data-route class="breadcrumb-link">${crumb.label}</a>`;
    });

    container.innerHTML = `
      <nav class="breadcrumb-nav">
        ${items.join('<span class="breadcrumb-separator">/</span>')}
      </nav>
    `;
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    let loader = document.getElementById('router-loading');
    
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'router-loading';
      loader.innerHTML = `
        <div class="router-loading-overlay">
          <div class="router-spinner"></div>
          <span>Loading...</span>
        </div>
      `;
      loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.2s ease;
      `;
      document.body.appendChild(loader);
    }

    // Add styles if not present
    if (!document.getElementById('router-styles')) {
      const styles = document.createElement('style');
      styles.id = 'router-styles';
      styles.textContent = `
        .router-loading-overlay {
          text-align: center;
        }
        .router-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--gray-200);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: router-spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes router-spin {
          to { transform: rotate(360deg); }
        }
        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--gray-500);
        }
        .breadcrumb-link {
          color: var(--primary);
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          text-decoration: underline;
        }
        .breadcrumb-current {
          color: var(--brown);
          font-weight: 500;
        }
        .breadcrumb-separator {
          color: var(--gray-300);
        }
      `;
      document.head.appendChild(styles);
    }

    requestAnimationFrame(() => {
      loader.style.opacity = '1';
    });
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loader = document.getElementById('router-loading');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.remove();
      }, 200);
    }
  }

  /**
   * Handle navigation errors
   */
  async handleNavigationError(error, targetPath) {
    console.error('Navigation error:', error);

    // Redirect to error page or 404
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      await this.navigate('/404.html', { replace: true });
    } else if (error.message?.includes('unauthorized')) {
      await this.navigate('/login.html', { replace: true });
    } else {
      // Show error toast
      if (typeof showToast === 'function') {
        showToast('Failed to load page. Please try again.');
      }
    }
  }

  /**
   * Generate breadcrumbs from path
   */
  generateBreadcrumbs(path) {
    if (path === '/' || path === '/index.html') {
      return [{ label: 'Home', path: '/' }];
    }

    const parts = path.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = this.generateTitle(part).replace('.html', '');
      breadcrumbs.push({
        label,
        path: currentPath + (index === parts.length - 1 ? '' : '')
      });
    });

    return breadcrumbs;
  }

  /**
   * Generate title from path
   */
  generateTitle(path) {
    return path
      .split('/')
      .pop()
      .replace('.html', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Prefetch route for faster navigation
   */
  prefetch(path) {
    const route = this.findRoute(path);
    if (route?.lazyLoad && route.component) {
      // Prefetch in background
      setTimeout(() => {
        this.lazyLoadRoute(route).catch(() => {});
      }, 100);
    }
  }

  /**
   * Get current route info
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Get navigation history
   */
  getHistory() {
    return [...this.navigationHistory];
  }

  /**
   * Get router state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update router state
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Programmatic navigation helpers
   */
  go(path, options = {}) {
    return this.navigate(path, options);
  }

  replace(path, options = {}) {
    return this.navigate(path, { ...options, replace: true });
  }

  push(path, options = {}) {
    return this.navigate(path, { ...options, replace: false });
  }

  /**
   * Destroy router
   */
  destroy() {
    window.removeEventListener('popstate', this.handlePopState);
    document.removeEventListener('click', this.handleLinkClick);
    this.routes.clear();
    this.middlewares = [];
    this.guards.clear();
    this.routeCache.clear();
  }
}

// Create global router instance
const router = new BookingGoRouter({
  basePath: '',
  defaultRoute: '/',
  authRedirect: '/login.html',
  notFoundRedirect: '/404.html',
  enableTransitions: true,
  transitionDuration: 300,
  enableBreadcrumbs: true,
  enableLoading: true
});

// Make router available globally
window.router = router;
window.BookingGoRouter = BookingGoRouter;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BookingGoRouter, router };
}
