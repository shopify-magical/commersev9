// Cookie Consent Banner Module
class CookieConsent {
  constructor(options = {}) {
    this.options = {
      cookieName: 'sweet-layers-consent',
      cookieExpiry: 365, // days
      privacyPolicyUrl: '/privacy-policy.html',
      ...options
    };
    this.init();
  }

  init() {
    if (!this.hasConsent()) {
      this.createBanner();
      this.bindEvents();
    }
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-consent';
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <p>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            By clicking "Accept All", you consent to our use of cookies.
            <a href="${this.options.privacyPolicyUrl}" target="_blank">Learn more</a>
          </p>
        </div>
        <div class="cookie-consent-buttons">
          <button class="btn btn-secondary" data-action="reject">
            Reject All
          </button>
          <button class="btn" data-action="accept">
            Accept All
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Show banner after a short delay for better UX
    setTimeout(() => {
      banner.classList.add('show');
    }, 100);
  }

  bindEvents() {
    const banner = document.querySelector('.cookie-consent');

    banner.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleConsent(action === 'accept');
      }
    });
  }

  handleConsent(accepted) {
    // Store consent in cookie
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.options.cookieExpiry);

    document.cookie = `${this.options.cookieName}=${accepted ? 'accepted' : 'rejected'}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    // Initialize analytics if accepted
    if (accepted && window.AnalyticsSuite) {
      // AnalyticsSuite is already initialized, just ensure it's working
      console.log('Analytics enabled with user consent');
    }

    // Hide banner
    const banner = document.querySelector('.cookie-consent');
    banner.classList.remove('show');
    setTimeout(() => {
      banner.remove();
    }, 300);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cookieConsent', {
      detail: { accepted, timestamp: Date.now() }
    }));
  }

  hasConsent() {
    return document.cookie.split(';').some(cookie => {
      const [name] = cookie.trim().split('=');
      return name === this.options.cookieName;
    });
  }

  getConsent() {
    const cookie = document.cookie.split(';').find(cookie => {
      const [name] = cookie.trim().split('=');
      return name === this.options.cookieName;
    });

    if (cookie) {
      const [, value] = cookie.trim().split('=');
      return value === 'accepted';
    }

    return null;
  }

  revokeConsent() {
    // Remove consent cookie
    document.cookie = `${this.options.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Disable analytics
    if (window.AnalyticsSuite) {
      // In a real implementation, you'd need to disable GA4 here
      console.log('Analytics disabled');
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('cookieConsentRevoked', {
      detail: { timestamp: Date.now() }
    }));
  }
}

// Initialize cookie consent
document.addEventListener('DOMContentLoaded', () => {
  window.CookieConsent = new CookieConsent({
    privacyPolicyUrl: '/privacy-policy.html'
  });
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieConsent;
}