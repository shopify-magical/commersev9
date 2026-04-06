/**
 * BookingGo Route Configuration
 * Defines all application routes, guards, and navigation structure
 */

// Initialize routes when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  configureRoutes();
});

function configureRoutes() {
  // Skip if router not loaded
  if (!window.router) {
    console.error('Router not initialized');
    return;
  }

  // ==========================================
  // PUBLIC ROUTES (No authentication required)
  // ==========================================
  
  // Home & Shop
  router.route('/', {
    title: 'Home',
    template: null, // Uses existing HTML
    breadcrumbs: [{ label: 'Home', path: '/' }],
    meta: { description: 'Sweet Layers Artisan Cake Shop' }
  });

  router.route('/index.html', {
    title: 'Home',
    template: null,
    breadcrumbs: [{ label: 'Home', path: '/' }],
    meta: { description: 'Sweet Layers Artisan Cake Shop' }
  });

  router.route('/shop.html', {
    title: 'Shop',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shop.html' }
    ],
    meta: { description: 'Browse our delicious cakes' }
  });

  router.route('/product.html', {
    title: 'Product Details',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shop.html' },
      { label: 'Product', path: '/product.html' }
    ],
    meta: { description: 'Product details' },
    queryParams: ['id', 'category']
  });

  // Cart & Checkout
  router.route('/cart.html', {
    title: 'Shopping Cart',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Cart', path: '/cart.html' }
    ],
    meta: { description: 'Your shopping cart' }
  });

  router.route('/checkout.html', {
    title: 'Checkout',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Cart', path: '/cart.html' },
      { label: 'Checkout', path: '/checkout.html' }
    ],
    meta: { description: 'Complete your order' }
  });

  // Information Pages
  router.route('/about.html', {
    title: 'About Us',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about.html' }
    ],
    meta: { description: 'About Sweet Layers' }
  });

  router.route('/contact.html', {
    title: 'Contact',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Contact', path: '/contact.html' }
    ],
    meta: { description: 'Contact us' }
  });

  // Authentication
  router.route('/login.html', {
    title: 'Login',
    breadcrumbs: [{ label: 'Login', path: '/login.html' }],
    meta: { description: 'Sign in to your account' },
    onEnter: () => {
      // Redirect if already logged in
      if (router.isAuthenticated()) {
        router.navigate('/dashboard.html');
      }
    }
  });

  router.route('/onboard.html', {
    title: 'Welcome',
    breadcrumbs: [{ label: 'Welcome', path: '/onboard.html' }],
    meta: { description: 'Welcome to BookingGo' }
  });

  // ==========================================
  // PROTECTED ROUTES (Authentication required)
  // ==========================================
  
  // Business Dashboard
  router.route('/dashboard.html', {
    title: 'Business Dashboard',
    auth: { required: true, roles: ['user', 'business', 'admin'] },
    guards: ['auth'],
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard.html' }
    ],
    meta: { description: 'Business management dashboard' }
  });

  // Booking Dashboard
  router.route('/booking-dashboard.html', {
    title: 'Booking Dashboard',
    auth: { required: true, roles: ['user', 'business', 'admin'] },
    guards: ['auth'],
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Booking Dashboard', path: '/booking-dashboard.html' }
    ],
    meta: { description: 'Manage appointments and bookings' }
  });

  // ==========================================
  // ADMIN ROUTES (Admin only)
  // ==========================================
  
  router.route('/super-admin.html', {
    title: 'Super Admin',
    auth: { required: true, roles: ['admin', 'superadmin'] },
    guards: ['auth', 'admin'],
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Super Admin', path: '/super-admin.html' }
    ],
    meta: { description: 'Platform administration' }
  });

  // ==========================================
  // UTILITY ROUTES
  // ==========================================
  
  router.route('/all-pages.html', {
    title: 'All Pages',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'All Pages', path: '/all-pages.html' }
    ]
  });

  // 404 Page
  router.route('/404.html', {
    title: 'Page Not Found',
    breadcrumbs: [{ label: '404', path: '/404.html' }]
  });

  // ==========================================
  // ROUTE GUARDS
  // ==========================================
  
  // Authentication Guard
  router.guard('auth', (context) => {
    const route = context.to;
    
    if (route?.auth?.required && !router.isAuthenticated()) {
      // Store intended destination
      sessionStorage.setItem('redirectAfterLogin', context.path);
      return '/login.html';
    }
    
    return true;
  });

  // Admin Guard
  router.guard('admin', (context) => {
    const route = context.to;
    
    if (route?.auth?.roles?.includes('admin') || route?.auth?.roles?.includes('superadmin')) {
      if (!router.hasRole('admin') && !router.hasRole('superadmin')) {
        return '/unauthorized.html';
      }
    }
    
    return true;
  });

  // Business Owner Guard
  router.guard('business', (context) => {
    if (!router.hasRole('business') && !router.hasRole('admin')) {
      return '/dashboard.html';
    }
    return true;
  });

  // ==========================================
  // GLOBAL MIDDLEWARES
  // ==========================================
  
  // Analytics tracking
  router.use((context) => {
    // Track page views
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_TRACKING_ID', {
        page_path: context.path,
        page_title: context.to?.title || context.path
      });
    }
    
    // Log navigation for debugging
    console.log(`[Router] Navigating to: ${context.path}`, {
      from: context.from?.path,
      query: context.query
    });
  });

  // Scroll to top on navigation
  router.use((context) => {
    if (!context.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Save scroll position
  router.use((context) => {
    if (context.from?.preserveState) {
      context.from.scrollPosition = window.pageYOffset;
    }
    
    if (context.to?.preserveState && context.to.scrollPosition) {
      setTimeout(() => {
        window.scrollTo({ top: context.to.scrollPosition, behavior: 'auto' });
      }, 0);
    }
  });

  console.log('✅ Routes configured');
}

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

/**
 * Check if user is authenticated from localStorage/sessionStorage
 */
function checkAuthState() {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    try {
      const userData = JSON.parse(user);
      router.setUser(userData);
      return true;
    } catch (e) {
      console.error('Failed to parse user data');
    }
  }
  
  return false;
}

/**
 * Login user
 */
function login(credentials) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock authentication
      if (credentials.email && credentials.password) {
        const user = {
          id: '123',
          email: credentials.email,
          name: 'Demo User',
          roles: ['user'],
          permissions: ['view_dashboard', 'make_booking']
        };
        
        localStorage.setItem('auth_token', 'mock_token_123');
        localStorage.setItem('user', JSON.stringify(user));
        
        router.setUser(user);
        
        // Redirect to intended page or default
        const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard.html';
        sessionStorage.removeItem('redirectAfterLogin');
        
        resolve({ success: true, user, redirect });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
}

/**
 * Logout user
 */
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('redirectAfterLogin');
  
  router.logout();
}

// Check auth state on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkAuthState, 100);
});

// Export helpers
window.login = login;
window.logout = logout;
window.checkAuthState = checkAuthState;
