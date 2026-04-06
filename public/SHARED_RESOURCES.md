# Shared Resources Structure

## Overview
This directory contains shared CSS and JavaScript resources to reduce code duplication across HTML files.

## Directory Structure

```
public/
├── css/
│   └── shared.css          # Shared CSS variables, reset, and utility classes
├── js/
│   └── shared.js           # Shared JavaScript utility functions
└── *.html                  # Individual HTML pages
```

## How to Use Shared Resources

### 1. Link Shared CSS in HTML
Add this line in the `<head>` section of your HTML files:

```html
<link rel="stylesheet" href="/css/shared.css">
```

### 2. Link Shared JS in HTML
Add this line before the closing `</body>` tag:

```html
<script src="/js/shared.js"></script>
```

## Shared CSS Features

### CSS Variables
- Colors: `--primary`, `--accent`, `--brown`, `--gray-*`, etc.
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- Border Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- Transitions: `--transition`

### Utility Classes
- `.container` - Max-width container
- `.card` - Card component
- `.card-header` - Card header
- `.card-title` - Card title
- `.card-body` - Card body
- `.btn` - Base button
- `.btn-primary` - Primary button
- `.btn-success` - Success button
- `.btn-secondary` - Secondary button
- `.btn-sm` - Small button
- `.badge` - Badge
- `.badge-success` - Success badge
- `.badge-warning` - Warning badge
- `.badge-danger` - Danger badge
- `.breadcrumb` - Breadcrumb navigation
- `.toast` - Toast notification

### Animations
- `fadeIn` - Fade in animation
- `fadeInUp` - Fade in and slide up animation
- `slideIn` - Slide in animation

## Shared JavaScript Functions

### Utility Functions
- `showToast(message, duration)` - Show toast notification
- `formatCurrency(amount, currency, locale)` - Format currency
- `formatDate(date, options)` - Format date
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `generateId(prefix)` - Generate unique ID
- `copyToClipboard(text)` - Copy text to clipboard
- `isValidEmail(email)` - Validate email
- `isValidPhone(phone)` - Validate phone number
- `sleep(ms)` - Sleep/delay function
- `retry(fn, retries, delay)` - Retry function with delay

### Local Storage Helpers
- `storage.get(key, defaultValue)` - Get item from localStorage
- `storage.set(key, value)` - Set item in localStorage
- `storage.remove(key)` - Remove item from localStorage
- `storage.clear()` - Clear all localStorage

### URL/Query Helpers
- `getQueryParams()` - Get all query parameters
- `setQueryParam(key, value)` - Set query parameter
- `removeQueryParam(key)` - Remove query parameter

### File Helpers
- `downloadFile(content, filename, type)` - Download file
- `readFile(file)` - Read file content
- `imageToBase64(file)` - Convert image to base64
- `getFileExtension(filename)` - Get file extension
- `formatFileSize(bytes)` - Format file size

### Device Detection
- `isMobile()` - Check if mobile device
- `isTablet()` - Check if tablet device
- `isDesktop()` - Check if desktop device
- `getDeviceType()` - Get device type

### Event Bus
- `window.eventBus.on(event, callback)` - Subscribe to event
- `window.eventBus.off(event, callback)` - Unsubscribe from event
- `window.eventBus.emit(event, data)` - Emit event

### DOM Helpers
- `onDOMReady(callback)` - Run callback when DOM is ready
- `smoothScrollTo(element, offset)` - Smooth scroll to element

## Migration Guide

To update an HTML file to use shared resources:

1. Add shared CSS link in `<head>`:
```html
<link rel="stylesheet" href="/css/shared.css">
```

2. Remove duplicate CSS variables and utility classes from the file's `<style>` tag

3. Add shared JS script before `</body>`:
```html
<script src="/js/shared.js"></script>
```

4. Replace duplicate JavaScript functions with calls to shared functions

5. Test the page to ensure everything works correctly

## Benefits

- **Reduced Code Duplication**: Shared styles and functions in one place
- **Easier Maintenance**: Update once, affects all pages
- **Consistency**: Uniform styling and behavior across the site
- **Smaller File Sizes**: Less repeated code in individual HTML files
- **Better Performance**: Browser caching of shared resources

## Notes

- The shared resources are optional - HTML files can continue to work independently
- Gradually migrate files to use shared resources
- Keep page-specific CSS/JS in individual files
- Shared resources are loaded from CDN or static file server