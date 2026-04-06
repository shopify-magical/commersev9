/**
 * Sweet Layers - Service Worker
 * Caches assets for offline functionality and improved performance
 * @version 1.0.0
 */

const CACHE_NAME = 'sweet-layers-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/shop.html',
  '/blog.html',
  '/about.html',
  '/contact.html',
  '/cart.html',
  '/css/shared.css',
  '/js/agentic-engine.js'
];

const IMAGE_CACHE_NAME = 'sweet-layers-images-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle image requests with separate cache
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle API requests - network only with timeout
  if (url.pathname.startsWith('/api/') || url.hostname.includes('workers.dev')) {
    event.respondWith(
      fetchWithTimeout(request, 5000)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Handle HTML navigation requests - network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the new version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline page if available
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Handle static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          // Return cached version and update in background
          fetch(request)
            .then((response) => {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            })
            .catch(() => {});
          return cached;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Handle image requests with separate caching strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    const responseClone = response.clone();
    cache.put(request, responseClone);
    return response;
  } catch (error) {
    console.error('[SW] Image fetch failed:', error);
    // Return a fallback image or error response
    return new Response('Image not available', { status: 404 });
  }
}

// Fetch with timeout helper
function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);

    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormSubmissions());
  }
});

async function syncFormSubmissions() {
  // Implementation for syncing form data when back online
  console.log('[SW] Syncing form submissions');
}

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New update from Sweet Layers!',
    icon: '/images/mooncake-generated.png',
    badge: '/images/mooncake-icon.svg',
    tag: 'sweet-layers-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Sweet Layers', options)
  );
});
