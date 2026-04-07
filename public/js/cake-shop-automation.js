/**
 * CAKE SHOP SALES AUTOMATION ENGINE
 * Real-live use case: Sweet Layers Artisan Cake Shop
 * 
 * AUTOMATION FLOWS:
 * 1. Customer lands → AI observes behavior → Personalizes experience
 * 2. Customer browses → AI tracks preferences → Suggests relevant cakes
 * 3. Customer adds to cart → AI suggests upsells → Optimizes order value
 * 4. Customer checks out → AI validates order → Sends to kitchen
 * 5. Order complete → AI updates inventory → Suggests re-order timing
 */

class CakeShopAutomation {
  constructor() {
    this.engine = null;
    this.agent = null;
    this.customerProfile = {
      sessionId: `cake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visitCount: parseInt(localStorage.getItem('visitCount') || '0') + 1,
      preferences: JSON.parse(localStorage.getItem('cakePreferences') || '{}'),
      lastOrder: JSON.parse(localStorage.getItem('lastOrder') || '{}'),
      cartValue: 0,
      timeOnPage: 0,
      interactions: []
    };
    
    this.automationFlows = {
      WELCOME_SEQUENCE: 'welcome_sequence',
      PERSONALIZATION: 'personalization',
      UPSELL_OPTIMIZATION: 'upsell_optimization',
      CHECKOUT_OPTIMIZATION: 'checkout_optimization',
      POST_PURCHASE: 'post_purchase'
    };
  }

  async init() {
    try {
      // Check if AgenticDashboardEngine is available
      if (typeof AgenticDashboardEngine === 'undefined') {
        throw new Error('AgenticDashboardEngine not loaded');
      }
      
      // Initialize unified agentic engine
      this.engine = new AgenticDashboardEngine({
        apiEndpoint: 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/api/agentic',
        wsEndpoint: 'wss://bizcommerz-agentic-engine.aekbuffalo.workers.dev/ws',
        enableRealtime: true,
        enableAgent: true,
        enablePrefetch: true,
        tickInterval: 3000
      });

      await this.engine.init();
      this.agent = this.engine.agent;

      // Start automation flows
      this.startWelcomeSequence();
      this.setupBehaviorTracking();
      this.setupSalesAutomation();
      this.setupRealTimeUpdates();

      // Save customer profile
      this.saveCustomerProfile();

      console.log('AgenticDashboardEngine initialized successfully!');

    } catch (err) {
      console.error('Failed to initialize automation:', err);
      this.initOfflineMode();
    }
  }

  async initOfflineMode() {
    console.log('AgenticDashboardEngine' in window ? 'AgenticDashboardEngine available in offline mode' : 'AgenticDashboardEngine not available in offline mode');
    console.log('AgenticEngine' in window ? 'AgenticEngine available in offline mode' : 'AgenticEngine not available in offline mode');
    console.log('Cake Shop running in offline mode - basic functionality available');
    
    // Set up basic offline functionality
    this.agent = {
      submitGoal: (goal, priority, data) => {
        console.log(`[OFFLINE] Goal submitted: ${goal} (${priority})`, data);
      }
    };
    
    // Basic tracking without backend
    this.setupBasicTracking();
  }

  setupBasicTracking() {
    console.log('Setting up basic tracking in offline mode');
    // Basic click tracking without agent
    document.addEventListener('click', (e) => {
      const cakeElement = e.target.closest('[data-cake]');
      if (cakeElement) {
        const cakeName = cakeElement.dataset.cake;
        console.log(`[OFFLINE] Cake interaction: ${cakeName}`);
      }
    });
  }

  // ========== FLOW 1: WELCOME SEQUENCE ==========
  startWelcomeSequence() {
    // Check if agent is available
    if (!this.agent) {
      console.log('Agent not available, skipping welcome sequence');
      return;
    }
    
    // Submit welcome automation goal
    this.agent.submitGoal(
      'Execute welcome sequence for returning customer',
      'high',
      {
        flow: this.automationFlows.WELCOME_SEQUENCE,
        visitCount: this.customerProfile.visitCount,
        isReturning: this.customerProfile.visitCount > 1,
        lastOrder: this.customerProfile.lastOrder,
        sessionId: this.customerProfile.sessionId
      }
    );

    // Show personalized welcome
    setTimeout(() => {
      this.showWelcomeMessage();
    }, 2000);

    // If returning customer, remind them of favorites
    if (this.customerProfile.visitCount > 1 && this.customerProfile.preferences.favoriteCake) {
      setTimeout(() => {
        this.showFavoriteReminder();
      }, 5000);
    }
  }

  showWelcomeMessage() {
    const isReturning = this.customerProfile.visitCount > 1;
    const message = isReturning 
      ? `Welcome back! 👋 This is your ${this.customerProfile.visitCount}${this.getOrdinalSuffix(this.customerProfile.visitCount)} visit. We missed you!`
      : `Welcome to Sweet Layers! 🎂 First time? Let us help you find your perfect cake.`;

    this.showAutomationMessage({
      type: 'welcome',
      message,
      actions: isReturning ? [
        { text: 'Show My Favorites', action: () => this.showFavorites() },
        { text: 'What\'s New', action: () => this.showNewCakes() }
      ] : [
        { text: 'Best Sellers', action: () => this.showBestSellers() },
        { text: 'Get Recommendations', action: () => this.getPersonalizedRecommendations() }
      ]
    });
  }

  showFavoriteReminder() {
    const favorite = this.customerProfile.preferences.favoriteCake;
    if (favorite) {
      this.showAutomationMessage({
        type: 'favorite_reminder',
        message: `We noticed you love ${favorite}! It's waiting for you. 🍰`,
        actions: [
          { text: 'Add to Cart', action: () => this.addToCart(favorite) },
          { text: 'View Details', action: () => this.showCakeDetails(favorite) }
        ]
      });
    }
  }

  // ========== FLOW 2: BEHAVIOR TRACKING & PERSONALIZATION ==========
  setupBehaviorTracking() {
    // Check if agent is available
    if (!this.agent) {
      console.log('Agent not available, skipping behavior tracking');
      return;
    }
    
    // Track cake interactions
    document.addEventListener('click', (e) => {
      const cakeElement = e.target.closest('[data-cake]');
      if (cakeElement) {
        const cakeName = cakeElement.dataset.cake;
        this.trackCakeInteraction(cakeName, 'click');
      }

      // Track add to cart clicks
      if (e.target.textContent?.includes('Add to Cart')) {
        const cakeName = this.extractCakeNameFromElement(e.target);
        if (cakeName) {
          this.trackAddToCart(cakeName);
        }
      }

      // Track category clicks
      const categoryElement = e.target.closest('[data-category]');
      if (categoryElement) {
        const category = categoryElement.dataset.category;
        this.trackCategoryInterest(category);
      }
    });

    // Track scroll engagement
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        if (scrollPercent > 80) {
          this.agent.submitGoal(
            'Highly engaged customer - show premium collection',
            'medium',
            { flow: this.automationFlows.PERSONALIZATION, engagement: 'high', scrollDepth: scrollPercent }
          );
        }
      }
    });

    // Track time on page
    const timeIntervals = [30000, 60000, 120000]; // 30s, 1min, 2min
    timeIntervals.forEach(time => {
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          this.trackTimeEngagement(time);
        }
      }, time);
    });
  }

  trackCakeInteraction(cakeName, interactionType) {
    // Update preferences
    if (!this.customerProfile.preferences.cakeInteractions) {
      this.customerProfile.preferences.cakeInteractions = {};
    }
    
    this.customerProfile.preferences.cakeInteractions[cakeName] = 
      (this.customerProfile.preferences.cakeInteractions[cakeName] || 0) + 1;

    // Update favorite cake
    const interactions = this.customerProfile.preferences.cakeInteractions;
    const favorite = Object.keys(interactions).reduce((a, b) => 
      interactions[a] > interactions[b] ? a : b
    );
    this.customerProfile.preferences.favoriteCake = favorite;

    // Submit to agent for analysis
    this.agent.submitGoal(
      `Customer interacted with ${cakeName} - update preference profile`,
      'medium',
      {
        flow: this.automationFlows.PERSONALIZATION,
        cakeName,
        interactionType,
        currentFavorite: favorite,
        sessionId: this.customerProfile.sessionId
      }
    );

    this.saveCustomerProfile();
  }

  trackAddToCart(cakeName) {
    this.customerProfile.cartValue += this.getCakePrice(cakeName);
    
    // Trigger upsell automation
    this.agent.submitGoal(
      `Customer added ${cakeName} to cart - initiate upsell sequence`,
      'high',
      {
        flow: this.automationFlows.UPSELL_OPTIMIZATION,
        cakeName,
        cartValue: this.customerProfile.cartValue,
        sessionId: this.customerProfile.sessionId
      }
    );

    // Show upsell suggestions after 2 seconds
    setTimeout(() => {
      this.showUpsellSuggestions(cakeName);
    }, 2000);

    this.saveCustomerProfile();
  }

  trackCategoryInterest(category) {
    if (!this.customerProfile.preferences.categories) {
      this.customerProfile.preferences.categories = {};
    }
    this.customerProfile.preferences.categories[category] = 
      (this.customerProfile.preferences.categories[category] || 0) + 1;

    // Personalize recommendations based on category
    this.agent.submitGoal(
      `Customer interested in ${category} category - personalize recommendations`,
      'medium',
      {
        flow: this.automationFlows.PERSONALIZATION,
        category,
        sessionId: this.customerProfile.sessionId
      }
    );

    this.saveCustomerProfile();
  }

  trackTimeEngagement(timeOnPage) {
    this.customerProfile.timeOnPage = timeOnPage;

    this.agent.submitGoal(
      `Customer engaged for ${timeOnPage/1000}s - optimize experience`,
      'low',
      {
        flow: this.automationFlows.PERSONALIZATION,
        timeOnPage,
        sessionId: this.customerProfile.sessionId
      }
    );

    // Show personalized recommendations after 1 minute
    if (timeOnPage === 60000) {
      this.getPersonalizedRecommendations();
    }
  }

  // ========== FLOW 3: SALES AUTOMATION ==========
  setupSalesAutomation() {
    // Override agent actions for cake shop context
    this.agent.config.onAction = (action) => {
      this.handleSalesAutomationAction(action);
    };

    // Listen for agent insights
    this.agent.events.on('insight', (insight) => {
      this.showSalesInsight(insight);
    });
  }

  handleSalesAutomationAction(action) {
    switch(action.type) {
      case 'show_insight':
        this.showSalesInsight(action);
        break;
      case 'highlight':
        this.highlightCake(action.selector, action.message);
        break;
      case 'suggest':
        this.showCakeSuggestion(action.message, action.actions);
        break;
      case 'auto_fill':
        this.autoFillOrderForm(action.data);
        break;
      case 'show-panel':
        this.showRecommendationPanel(action.data);
        break;
      case 'navigate':
        this.navigateToCheckout();
        break;
    }
  }

  showUpsellSuggestions(baseCake) {
    const baseCakeData = this.getCakeData(baseCake);
    const upsells = this.getUpsellRecommendations(baseCakeData);

    this.showAutomationMessage({
      type: 'upsell',
      message: `Great choice! ${baseCake} pairs perfectly with these items:`,
      actions: upsells.map(upsell => ({
        text: `Add ${upsell.name} (+$${upsell.price})`,
        action: () => this.addToCart(upsell.name)
      }))
    });
  }

  getUpsellRecommendations(baseCake) {
    const upsellMap = {
      'Heritage Mooncake': [
        { name: 'Thai Tea', price: 6 },
        { name: 'Jasmine Tea', price: 4 }
      ],
      'Thai Tea Cake': [
        { name: 'Coconut Sticky Rice', price: 8 },
        { name: 'Mango Sticky Rice', price: 10 }
      ],
      'Chocolate Truffle': [
        { name: 'Espresso', price: 5 },
        { name: 'Chocolate Sauce', price: 3 }
      ]
    };

    return upsellMap[baseCake] || [
      { name: 'Special Tea', price: 5 },
      { name: 'Cake Box', price: 2 }
    ];
  }

  // ========== FLOW 4: REAL-TIME UPDATES ==========
  setupRealTimeUpdates() {
    // Listen for backend messages
    this.engine.sync?.on('inventory:update', (update) => {
      this.handleInventoryUpdate(update);
    });

    this.engine.sync?.on('promotion:active', (promo) => {
      this.showPromotion(promo);
    });

    this.engine.sync?.on('order:ready', (order) => {
      this.notifyOrderReady(order);
    });
  }

  handleInventoryUpdate(update) {
    if (update.lowStock) {
      this.showAutomationMessage({
        type: 'urgency',
        message: `⚠️ Only ${update.quantity} left of ${update.cakeName}! Order soon before it's gone.`,
        actions: [
          { text: 'Add to Cart', action: () => this.addToCart(update.cakeName) }
        ]
      });
    }
  }

  showPromotion(promo) {
    this.showAutomationMessage({
      type: 'promotion',
      message: `🎉 Special offer: ${promo.description}`,
      actions: [
        { text: 'Claim Offer', action: () => this.applyPromotion(promo.code) }
      ]
    });
  }

  // ========== UI COMPONENTS ==========
  showAutomationMessage(config) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'cake-automation-message';
    messageContainer.innerHTML = `
      <div class="automation-content">
        <div class="automation-message">${config.message}</div>
        ${config.actions ? `
          <div class="automation-actions">
            ${config.actions.map(action => 
              `<button class="automation-btn" onclick="(${action.toString()})()">${action.text}</button>`
            ).join('')}
          </div>
        ` : ''}
        <button class="automation-close" onclick="this.closest('.cake-automation-message').remove()">×</button>
      </div>
    `;

    document.body.appendChild(messageContainer);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      messageContainer.classList.add('fade-out');
      setTimeout(() => messageContainer.remove(), 500);
    }, 10000);
  }

  showSalesInsight(insight) {
    console.log('🎂 Sales Insight:', insight);
    
    // Show floating insight
    const insightElement = document.createElement('div');
    insightElement.className = 'cake-sales-insight';
    insightElement.innerHTML = `
      <div class="insight-icon">🎂</div>
      <div class="insight-text">${insight.message}</div>
    `;

    document.body.appendChild(insightElement);

    setTimeout(() => {
      insightElement.classList.add('fade-out');
      setTimeout(() => insightElement.remove(), 500);
    }, 5000);
  }

  highlightCake(selector, message) {
    const element = document.querySelector(selector);
    if (!element) return;

    element.classList.add('cake-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Create highlight tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'cake-highlight-tooltip';
    tooltip.textContent = message;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.cssText = `
      position: fixed;
      top: ${rect.top - 50}px;
      left: ${rect.left + rect.width/2 - 75}px;
      background: var(--primary);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      z-index: 1000;
      white-space: nowrap;
    `;

    setTimeout(() => {
      element.classList.remove('cake-highlight');
      tooltip.remove();
    }, 4000);
  }

  // ========== UTILITY METHODS ==========
  getCakePrice(cakeName) {
    const prices = {
      'Heritage Mooncake': 45,
      'Thai Tea Cake': 38,
      'Pandan Custard': 12,
      'Black Sesame Roll': 9.50,
      'Salted Egg Pastry': 15,
      'Chocolate Truffle': 42,
      'Red Velvet': 35
    };
    return prices[cakeName] || 25;
  }

  getCakeData(cakeName) {
    return {
      name: cakeName,
      price: this.getCakePrice(cakeName),
      category: this.getCakeCategory(cakeName)
    };
  }

  getCakeCategory(cakeName) {
    if (cakeName.includes('Mooncake')) return 'traditional';
    if (cakeName.includes('Chocolate')) return 'chocolate';
    if (cakeName.includes('Tea')) return 'tea';
    return 'specialty';
  }

  extractCakeNameFromElement(element) {
    const card = element.closest('[data-cake]');
    return card?.dataset.cake || null;
  }

  getOrdinalSuffix(num) {
    const j = num % 10, k = num % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
  }

  saveCustomerProfile() {
    localStorage.setItem('visitCount', this.customerProfile.visitCount.toString());
    localStorage.setItem('cakePreferences', JSON.stringify(this.customerProfile.preferences));
    localStorage.setItem('lastOrder', JSON.stringify(this.customerProfile.lastOrder));
  }

  initOfflineMode() {
    console.log('🔧 Cake Shop running in offline mode');
    // Basic functionality without backend
  }

  // ========== PUBLIC API ==========
  addToCart(cakeName) {
    // Add to cart logic
    console.log(`🛒 Adding ${cakeName} to cart`);
    this.trackAddToCart(cakeName);
  }

  getPersonalizedRecommendations() {
    this.agent.submitGoal(
      'Generate personalized cake recommendations',
      'medium',
      {
        flow: this.automationFlows.PERSONALIZATION,
        preferences: this.customerProfile.preferences,
        sessionId: this.customerProfile.sessionId
      }
    );
  }

  navigateToCheckout() {
    window.location.href = '/checkout.html';
  }
}

// Add CSS for automation components
const automationStyles = `
.cake-automation-message {
  position: fixed;
  top: 80px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  max-width: 350px;
  z-index: 1000;
  animation: slideInRight 0.3s ease;
}

.automation-content {
  padding: 16px;
  position: relative;
}

.automation-message {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 12px;
  color: var(--brown);
}

.automation-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.automation-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s ease;
}

.automation-btn:hover {
  background: var(--primary-dark);
}

.automation-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--gray-500);
}

.cake-sales-insight {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideUp 0.3s ease;
  z-index: 999;
}

.cake-highlight {
  box-shadow: 0 0 0 3px var(--accent), 0 0 20px rgba(196, 166, 71, 0.4);
  transform: scale(1.02);
  transition: all 0.3s ease;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.fade-out {
  opacity: 0;
  transition: opacity 0.5s ease;
}
`;

// Inject styles
if (!document.getElementById('cake-automation-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'cake-automation-styles';
  styleSheet.textContent = automationStyles;
  document.head.appendChild(styleSheet);
}

// Export for global access
window.CakeShopAutomation = CakeShopAutomation;
