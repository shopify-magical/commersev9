# BookingGo Router Documentation

A comprehensive client-side routing system for the BookingGo SaaS platform.

## Overview

The BookingGo Router provides a full-featured routing solution with:
- Route guards and authentication
- Breadcrumb navigation
- Lazy loading support
- Smooth transitions
- 404 error handling
- Query parameter management
- Navigation history tracking

## Files

```
js/
├── router.js              # Core routing engine
├── routes.js              # Route definitions
├── router-breadcrumbs.js  # Breadcrumb component
└── shared.js              # Shared utilities

404.html                   # Error page
```

## Quick Start

### 1. Include Router Scripts

Add these scripts to your HTML files (before closing `</body>`):

```html
<script src="/js/shared.js"></script>
<script src="/js/router.js"></script>
<script src="/js/router-breadcrumbs.js"></script>
<script src="/js/routes.js"></script>
```

### 2. Mark Navigation Links

Add `data-route` attribute to links that should use the router:

```html
<a href="/dashboard.html" data-route>Dashboard</a>
<a href="/shop.html" data-route>Shop</a>
```

### 3. Add Breadcrumb Container (Optional)

Add a container for breadcrumbs:

```html
<nav id="breadcrumbs"></nav>
```

The breadcrumb component auto-initializes and updates based on the current route.

## Features

### Route Definitions

Routes are defined in `routes.js`:

```javascript
router.route('/dashboard.html', {
  title: 'Dashboard',
  auth: { required: true, roles: ['user', 'admin'] },
  guards: ['auth'],
  breadcrumbs: [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard.html' }
  ]
});
```

### Route Guards

Protect routes with authentication and permissions:

```javascript
// Authentication required
router.route('/admin.html', {
  auth: { required: true }
});

// Specific roles
router.route('/super-admin.html', {
  auth: { required: true, roles: ['admin', 'superadmin'] }
});

// Custom guards
router.route('/premium.html', {
  guards: ['auth', 'subscription']
});
```

### Navigation

Programmatic navigation:

```javascript
// Navigate to route
router.navigate('/dashboard.html');

// Navigate with query params
router.navigate('/shop.html?category=cakes');

// Replace current history entry
router.navigate('/checkout.html', { replace: true });

// Go back
router.back();
```

### Query Parameters

Access query parameters:

```javascript
// URL: /shop.html?category=cakes&sort=price
const query = router.state.queryParams;
// { category: 'cakes', sort: 'price' }
```

### Breadcrumbs

Breadcrumbs are automatically generated from route configuration:

```javascript
// Custom breadcrumbs per route
router.route('/product.html', {
  breadcrumbs: [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop.html' },
    { label: 'Product', path: '/product.html' }
  ]
});
```

### Lazy Loading

Load routes on demand:

```javascript
router.route('/heavy-page.html', {
  lazyLoad: true,
  component: () => import('./heavy-module.js')
});
```

### Transitions

Enable smooth page transitions:

```javascript
const router = new BookingGoRouter({
  enableTransitions: true,
  transitionDuration: 300
});
```

## Authentication

### Login

```javascript
await login({ email: 'user@example.com', password: 'pass123' });
router.navigate('/dashboard.html');
```

### Logout

```javascript
logout();
```

### Check Auth State

```javascript
if (router.isAuthenticated()) {
  // User is logged in
}

if (router.hasRole('admin')) {
  // User is admin
}
```

## Route Configuration Reference

### Route Options

```javascript
router.route('/path', {
  title: 'Page Title',                    // Document title
  template: '<h1>HTML</h1>',              // Route template
  component: MyComponent,                 // Component function
  lazyLoad: false,                        // Lazy load flag
  auth: {                                 // Authentication config
    required: true,
    roles: ['user', 'admin'],
    permissions: ['read', 'write']
  },
  guards: ['auth', 'custom'],            // Route guards
  breadcrumbs: [...],                     // Breadcrumb items
  meta: { ... },                          // Route metadata
  onEnter: (ctx) => {},                   // Enter hook
  onLeave: (ctx) => {},                   // Leave hook
  transition: 'fade'                      // Transition type
});
```

### Global Configuration

```javascript
const router = new BookingGoRouter({
  basePath: '',                          // Base URL path
  defaultRoute: '/',                     // Default route
  authRedirect: '/login.html',           // Redirect if not auth
  notFoundRedirect: '/404.html',         // 404 redirect
  enableTransitions: true,               // Enable transitions
  transitionDuration: 300,               // Transition speed
  enableBreadcrumbs: true,               // Enable breadcrumbs
  enableLoading: true                     // Show loading state
});
```

## Events

Listen to route changes:

```javascript
window.addEventListener('routechange', (e) => {
  console.log('Navigated from', e.detail.from, 'to', e.detail.to);
});
```

## Middleware

Add global middleware:

```javascript
router.use((context) => {
  console.log('Navigating to:', context.path);
  // Analytics tracking, scroll reset, etc.
});
```

## Error Handling

The router automatically handles:
- 404 errors → redirects to `/404.html`
- Unauthorized access → redirects to `/login.html`
- Navigation failures → shows error toast

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- iOS Safari 13.4+

## Examples

### Protected Dashboard

```javascript
router.route('/dashboard.html', {
  title: 'Business Dashboard',
  auth: { required: true, roles: ['user', 'business', 'admin'] },
  guards: ['auth'],
  breadcrumbs: [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard.html' }
  ],
  onEnter: () => {
    showToast('Welcome to your dashboard!');
  }
});
```

### Product Page with Params

```javascript
router.route('/product.html', {
  title: 'Product Details',
  breadcrumbs: [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop.html' },
    { label: 'Product', path: '/product.html' }
  ],
  queryParams: ['id', 'category'],
  onEnter: (ctx) => {
    const productId = ctx.query.id;
    loadProduct(productId);
  }
});
```

## API Reference

### Router Methods

- `router.navigate(path, options)` - Navigate to route
- `router.back()` - Go back
- `router.forward()` - Go forward
- `router.push(path)` - Push new history entry
- `router.replace(path)` - Replace current history entry
- `router.getCurrentRoute()` - Get current route info
- `router.getHistory()` - Get navigation history
- `router.isAuthenticated()` - Check if user is logged in
- `router.hasRole(role)` - Check user role
- `router.setUser(user)` - Set authenticated user
- `router.logout()` - Logout user
- `router.prefetch(path)` - Prefetch route

### Route Guards

- `auth` - Checks authentication
- `admin` - Checks admin role
- `business` - Checks business owner role

## Migration Guide

### From Static Links

Before:
```html
<a href="/dashboard.html">Dashboard</a>
```

After:
```html
<a href="/dashboard.html" data-route>Dashboard</a>
```

### From JavaScript Navigation

Before:
```javascript
window.location.href = '/dashboard.html';
```

After:
```javascript
router.navigate('/dashboard.html');
```

## Troubleshooting

### Links Not Working
- Ensure `data-route` attribute is present
- Check that router scripts are loaded
- Verify route is defined in `routes.js`

### Auth Redirects Not Working
- Check `auth_token` in localStorage
- Verify user object is properly stored
- Ensure route has `auth: { required: true }`

### Breadcrumbs Not Showing
- Add `<nav id="breadcrumbs"></nav>` to HTML
- Ensure route has `breadcrumbs` array
- Check that `router-breadcrumbs.js` is loaded

## Best Practices

1. Always use `data-route` for internal links
2. Define breadcrumbs for better UX
3. Use route guards for protected pages
4. Handle `onEnter` and `onLeave` for cleanup
5. Enable transitions for smoother experience
6. Test 404 and unauthorized scenarios

## License

BookingGo Internal Use
