// Service Worker Registration for Sweet Layers PWA
(function() {
  'use strict';

  const SW_VERSION = '1.0.0';
  const SW_URL = '/sw.js';

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(SW_URL, {
        scope: '/'
      })
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[SW] Cache updated:', event.data.url);
      }
    });

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page');
      window.location.reload();
    });
  }

  // Show update notification to user
  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <span class="sw-update-text">New content available! Refresh to update.</span>
        <button class="sw-update-btn" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
        <button class="sw-update-btn sw-update-primary" onclick="window.location.reload()">Refresh</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary, #2A6B52);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      animation: slideUp 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      .sw-update-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sw-update-text {
        flex: 1;
      }
      .sw-update-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        background: rgba(255,255,255,0.2);
        color: white;
        transition: background 0.2s ease;
      }
      .sw-update-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      .sw-update-primary {
        background: white;
        color: var(--primary, #2A6B52);
      }
      .sw-update-primary:hover {
        background: #f0f0f0;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // PWA Install Prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button (optional)
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Install App';
    installBtn.className = 'pwa-install-btn';
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--accent, #C4A647);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
          } else {
            console.log('[PWA] User dismissed the install prompt');
          }
          deferredPrompt = null;
          installBtn.remove();
        });
      }
    });
    
    document.body.appendChild(installBtn);
  });

  // Handle app installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');
    const installBtn = document.querySelector('.pwa-install-btn');
    if (installBtn) {
      installBtn.remove();
    }
  });

})();
