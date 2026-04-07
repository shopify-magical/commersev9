/**
 * AUTONOMOUS SWEET LAYERS ASSISTANT - Unified AI Chat System
 * 
 * FEATURES:
 * - Fully autonomous AI assistant with cake shop expertise
 * - Natural language ordering and recommendations
 * - Advanced filtering and safety systems
 * - Mascot character with personality-driven interactions
 * - Real-time order processing and tracking
 * - Intelligent task management
 * - Voice interaction capabilities
 * - Multi-language support (English/Chinese)
 * - Context-aware conversations
 * - Seamless integration with Sweet Layers systems
 */

class AutonomousSweetLayersAssistant {
  constructor(config = {}) {
    this.config = {
      position: 'bottom-right',
      theme: 'sweet-layers',
      character: 'mooncake',
      personality: 'friendly-professional',
      apiEndpoint: 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/api/agentic',
      wsEndpoint: 'wss://bizcommerz-agentic-engine.aekbuffalo.workers.dev/ws',
      enableVoice: false,
      enableAnimations: true,
      enableFiltering: true,
      enableOrders: true,
      enableRecommendations: true,
      language: 'en',
      ...config
    };

    // Core state management
    this.state = {
      isOpen: false,
      isConnected: false,
      isTyping: false,
      messages: [],
      currentOrder: null,
      userSession: {
        sessionId: `sweet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        language: this.config.language,
        preferences: {},
        cart: [],
        orderHistory: [],
        conversationContext: []
      },
      mascot: {
        currentMood: 'friendly',
        animationState: 'idle',
        lastInteraction: Date.now()
      }
    };

    // AI Core Systems
    this.aiCore = {
      nlpProcessor: null,
      orderProcessor: null,
      recommendationEngine: null,
      filterSystem: null,
      voiceSynthesizer: null
    };

    // UI Elements
    this.elements = {};
    this.widgetContainer = null;
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Initialize core systems
    this.initializeCore();
  }

  // ========== CORE INITIALIZATION ==========
  initializeCore() {
    console.log('Initializing Autonomous Sweet Layers Assistant...');
    
    // Initialize NLP Processor
    this.aiCore.nlpProcessor = new SweetLayersNLP();
    
    // Initialize Order Processor
    this.aiCore.orderProcessor = new OrderProcessor({
      apiEndpoint: this.config.apiEndpoint
    });
    
    // Initialize Recommendation Engine
    this.aiCore.recommendationEngine = new RecommendationEngine();
    
    // Initialize Filter System
    this.aiCore.filterSystem = new AdvancedFilterSystem();
    
    // Initialize Voice System
    if (this.config.enableVoice) {
      this.aiCore.voiceSynthesizer = new VoiceSynthesizer();
    }
  }

  // ========== MAIN INITIALIZATION ==========
  async init() {
    try {
      console.log('Starting Autonomous Sweet Layers Assistant initialization...');
      
      // Create UI
      this.createWidget();
      
      // Connect to backend
      await this.connectToBackend();
      
      // Load user preferences
      await this.loadUserPreferences();
      
      // Start autonomous monitoring
      this.startAutonomousMonitoring();
      
      // Show welcome message
      this.showAutonomousWelcome();
      
      console.log('Autonomous Sweet Layers Assistant initialized successfully!');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize Autonomous Sweet Layers Assistant:', error);
      this.showErrorMessage('Assistant is having trouble starting. Please refresh the page.');
      return false;
    }
  }

  // ========== WIDGET CREATION ==========
  createWidget() {
    // Create main container
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.id = 'autonomous-sweet-layers-assistant';
    this.widgetContainer.className = 'autonomous-assistant-container';
    this.widgetContainer.innerHTML = this.getWidgetHTML();
    
    // Add to page
    document.body.appendChild(this.widgetContainer);
    
    // Cache elements
    this.cacheElements();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Apply theme
    this.applyTheme();
  }

  getWidgetHTML() {
    return `
      <!-- Chat Bubble -->
      <div class="assistant-bubble ${this.config.enableAnimations ? 'pulse-animation' : ''}" id="assistantBubble">
        <div class="mascot-character" id="mascotCharacter">
          <div class="mooncake-avatar">
            <img src="images/mooncake-icon-optimized.svg" alt="Sweet Layers Assistant" width="40" height="40">
            <div class="mascot-mood-indicator" id="mascotMood"></div>
          </div>
        </div>
        <div class="assistant-status">
          <span class="assistant-name">Sweet Layers Assistant</span>
          <span class="assistant-state">
            <span class="status-dot ${this.state.isConnected ? 'online' : 'connecting'}"></span>
            AI Powered
          </span>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="assistant-window" id="assistantWindow">
        <!-- Header -->
        <div class="assistant-header">
          <div class="header-info">
            <div class="mascot-header">
              <img src="images/mooncake-icon-optimized.svg" alt="Sweet Layers" width="32" height="32">
              <div class="mascot-status" id="headerMascotStatus">Ready to help!</div>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn voice-btn" id="voiceBtn" aria-label="Voice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <button class="header-btn minimize-btn" id="minimizeBtn" aria-label="Minimize">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button class="header-btn close-btn" id="closeBtn" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="assistant-messages" id="assistantMessages">
          <div class="welcome-message">
            <div class="assistant-avatar">
              <img src="images/mooncake-icon-optimized.svg" alt="Assistant" width="32" height="32">
            </div>
            <div class="message-content">
              <div class="message-bubble assistant">
                <div class="message-text">
                  Hello! I'm your autonomous Sweet Layers Assistant! I can help you:
                  <ul>
                    <li>Find the perfect cake for any occasion</li>
                    <li>Process orders and track delivery</li>
                    <li>Provide personalized recommendations</li>
                    <li>Answer questions about our bakery</li>
                    <li>Assist with special requests</li>
                  </ul>
                  How can I delight your taste buds today? ${this.getMascotEmoji()}
                </div>
                <div class="message-time">Just now</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" id="quickActions">
          <button class="quick-action" data-action="recommend">Get Recommendations</button>
          <button class="quick-action" data-action="order">Place Order</button>
          <button class="quick-action" data-action="track">Track Order</button>
          <button class="quick-action" data-action="help">Get Help</button>
        </div>

        <!-- Input Area -->
        <div class="assistant-input">
          <div class="input-container">
            <div class="input-wrapper">
              <input 
                type="text" 
                id="messageInput" 
                placeholder="Ask me anything about cakes..."
                maxlength="500"
                autocomplete="off"
              >
              <button class="send-btn" id="sendBtn" aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9"/>
                </svg>
              </button>
            </div>
            <div class="typing-indicator" id="typingIndicator">
              <span class="assistant-avatar small">
                <img src="images/mooncake-icon-optimized.svg" alt="Assistant" width="20" height="20">
              </span>
              <span class="typing-text">Sweet Layers Assistant is thinking...</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== EVENT HANDLERS ==========
  setupEventListeners() {
    // Toggle chat
    this.elements.assistantBubble.addEventListener('click', () => this.toggleAssistant());
    
    // Send message
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Header buttons
    this.elements.closeBtn.addEventListener('click', () => this.closeAssistant());
    this.elements.minimizeBtn.addEventListener('click', () => this.minimizeAssistant());
    this.elements.voiceBtn.addEventListener('click', () => this.toggleVoice());
    
    // Quick actions
    this.elements.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        this.handleQuickAction(e.target.dataset.action);
      }
    });
    
    // Voice input (if enabled)
    if (this.config.enableVoice) {
      this.setupVoiceListeners();
    }
  }

  // ========== AUTONOMOUS CORE FUNCTIONS ==========
  async sendMessage(message = null) {
    const messageText = message || this.elements.messageInput.value.trim();
    
    if (!messageText) return;
    
    // Clear input
    if (!message) {
      this.elements.messageInput.value = '';
    }
    
    // Add user message
    this.addMessage(messageText, 'user');
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Update mascot mood
    this.updateMascotMood('thinking');
    
    try {
      // Process message through AI core
      const response = await this.processMessage(messageText);
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      // Add assistant response
      this.addMessage(response.text, 'assistant', response.actions);
      
      // Update mascot mood based on response
      this.updateMascotMood(response.mood || 'friendly');
      
      // Execute autonomous actions
      if (response.actions && response.actions.length > 0) {
        await this.executeActions(response.actions);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      this.hideTypingIndicator();
      this.addMessage("I'm having trouble understanding. Could you try rephrasing that?", 'assistant');
      this.updateMascotMood('confused');
    }
  }

  async processMessage(message) {
    // Apply filtering
    if (this.config.enableFiltering) {
      const filterResult = this.aiCore.filterSystem.process(message);
      if (filterResult.blocked) {
        return {
          text: filterResult.reason || "I can't process that type of message.",
          mood: 'neutral',
          actions: []
        };
      }
    }
    
    // Process through NLP
    const nlpResult = this.aiCore.nlpProcessor.process(message, this.state.userSession);
    
    // Determine response type and generate response
    let response = {
      text: '',
      mood: 'friendly',
      actions: []
    };
    
    switch (nlpResult.intent) {
      case 'order':
        response = await this.handleOrderIntent(nlpResult);
        break;
      case 'recommendation':
        response = await this.handleRecommendationIntent(nlpResult);
        break;
      case 'tracking':
        response = await this.handleTrackingIntent(nlpResult);
        break;
      case 'help':
        response = await this.handleHelpIntent(nlpResult);
        break;
      case 'greeting':
        response = this.handleGreetingIntent(nlpResult);
        break;
      default:
        response = await this.handleGeneralIntent(nlpResult);
    }
    
    return response;
  }

  // ========== INTENT HANDLERS ==========
  async handleOrderIntent(nlpResult) {
    const orderDetails = this.aiCore.orderProcessor.extractOrderDetails(nlpResult);
    
    try {
      const order = await this.aiCore.orderProcessor.createOrder(orderDetails);
      
      return {
        text: `Perfect! I've created your order for ${order.items.map(item => item.name).join(', ')}. Total: $${order.total}. Would you like to proceed with checkout?`,
        mood: 'excited',
        actions: [
          { type: 'show_order_summary', data: order },
          { type: 'enable_checkout', data: order }
        ]
      };
    } catch (error) {
      return {
        text: "I had trouble creating your order. Could you provide more details about what you'd like to order?",
        mood: 'helpful',
        actions: []
      };
    }
  }

  async handleRecommendationIntent(nlpResult) {
    const recommendations = this.aiCore.recommendationEngine.getRecommendations(
      nlpResult.preferences,
      this.state.userSession.preferences
    );
    
    return {
      text: `Based on your preferences, I recommend: ${recommendations.map(r => r.name).join(', ')}. ${recommendations[0]?.description || ''}`,
      mood: 'enthusiastic',
      actions: [
        { type: 'show_recommendations', data: recommendations }
      ]
    };
  }

  async handleTrackingIntent(nlpResult) {
    const orderId = nlpResult.entities.orderId || this.state.userSession.orderHistory[0]?.id;
    
    if (!orderId) {
      return {
        text: "I don't see any recent orders. Would you like to place a new order?",
        mood: 'helpful',
        actions: []
      };
    }
    
    try {
      const tracking = await this.aiCore.orderProcessor.trackOrder(orderId);
      
      return {
        text: `Your order #${orderId} is ${tracking.status}. ${tracking.estimatedDelivery ? `Estimated delivery: ${tracking.estimatedDelivery}` : ''}`,
        mood: 'informative',
        actions: [
          { type: 'show_tracking', data: tracking }
        ]
      };
    } catch (error) {
      return {
        text: "I couldn't find that order. Could you check the order number?",
        mood: 'apologetic',
        actions: []
      };
    }
  }

  handleHelpIntent(nlpResult) {
    return {
      text: `I'm here to help! I can assist with:
- Finding and ordering cakes
- Tracking deliveries
- Getting recommendations
- Answering questions about our bakery
- Special requests and custom orders

What would you like help with? ${this.getMascotEmoji()}`,
      mood: 'helpful',
      actions: [
        { type: 'show_help_options' }
      ]
    };
  }

  handleGreetingIntent(nlpResult) {
    const greetings = [
      `Hello! Welcome to Sweet Layers! I'm your autonomous assistant, ready to help you find the perfect cake! ${this.getMascotEmoji()}`,
      `Hi there! I'm excited to help you with your cake needs! What can I assist you with today?`,
      `Greetings! Sweet Layers at your service! I can help with orders, recommendations, and more!`
    ];
    
    return {
      text: greetings[Math.floor(Math.random() * greetings.length)],
      mood: 'excited',
      actions: []
    };
  }

  async handleGeneralIntent(nlpResult) {
    // Handle general conversation
    const responses = [
      "That's interesting! While I'm primarily here to help with cakes and orders, I'm happy to chat. Would you like to see our cake selection?",
      "I appreciate the conversation! Is there anything specific about our bakery or cakes I can help you with?",
      "Thanks for sharing! As your Sweet Layers assistant, I'm here to help with all things cake-related. What can I do for you?"
    ];
    
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      mood: 'friendly',
      actions: []
    };
  }

  // ========== UTILITY FUNCTIONS ==========
  toggleAssistant() {
    if (this.state.isOpen) {
      this.closeAssistant();
    } else {
      this.openAssistant();
    }
  }

  openAssistant() {
    this.state.isOpen = true;
    this.elements.assistantWindow.classList.add('open');
    this.elements.assistantBubble.classList.add('hidden');
    this.elements.messageInput.focus();
    this.updateMascotMood('excited');
  }

  closeAssistant() {
    this.state.isOpen = false;
    this.elements.assistantWindow.classList.remove('open');
    this.elements.assistantBubble.classList.remove('hidden');
    this.updateMascotMood('idle');
  }

  minimizeAssistant() {
    // Implementation for minimize functionality
    this.closeAssistant();
  }

  addMessage(text, sender, actions = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'assistant' 
      ? '<img src="images/mooncake-icon-optimized.svg" alt="Assistant" width="32" height="32">'
      : '<div class="user-avatar">You</div>';
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-bubble ${sender}">
          <div class="message-text">${text}</div>
          <div class="message-time">${this.formatTime(new Date())}</div>
        </div>
      </div>
    `;
    
    this.elements.assistantMessages.appendChild(messageDiv);
    this.elements.assistantMessages.scrollTop = this.elements.assistantMessages.scrollHeight;
    
    // Store in session
    this.state.userSession.conversationContext.push({
      text,
      sender,
      timestamp: Date.now(),
      actions
    });
  }

  showTypingIndicator() {
    this.state.isTyping = true;
    this.elements.typingIndicator.style.display = 'flex';
    this.elements.messageInput.disabled = true;
  }

  hideTypingIndicator() {
    this.state.isTyping = false;
    this.elements.typingIndicator.style.display = 'none';
    this.elements.messageInput.disabled = false;
  }

  updateMascotMood(mood) {
    this.state.mascot.currentMood = mood;
    this.elements.mascotMood.className = `mascot-mood ${mood}`;
    this.elements.headerMascotStatus.textContent = this.getMoodMessage(mood);
  }

  getMoodMessage(mood) {
    const moodMessages = {
      friendly: 'Ready to help!',
      excited: 'Excited to assist!',
      thinking: 'Thinking...',
      helpful: 'Here to help!',
      enthusiastic: 'Happy to help!',
      informative: 'Sharing information...',
      apologetic: 'Sorry about that...',
      confused: 'Let me think...',
      idle: 'Standing by...'
    };
    return moodMessages[mood] || 'Ready to help!';
  }

  getMascotEmoji() {
    const emojis = ['\ud83e\uddc1', '\ud83c\udf82', '\u2728', '\ud83d\ude0a', '\ud83c\udf70'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  // ========== BACKEND CONNECTION ==========
  async connectToBackend() {
    try {
      // Connect to WebSocket for real-time updates
      if (this.config.wsEndpoint) {
        this.ws = new WebSocket(this.config.wsEndpoint);
        
        this.ws.onopen = () => {
          this.state.isConnected = true;
          this.updateConnectionStatus();
        };
        
        this.ws.onmessage = (event) => {
          this.handleBackendMessage(JSON.parse(event.data));
        };
        
        this.ws.onclose = () => {
          this.state.isConnected = false;
          this.updateConnectionStatus();
          // Attempt reconnection after delay
          setTimeout(() => this.connectToBackend(), 5000);
        };
      }
      
      // Test API connection
      const response = await fetch(`${this.config.apiEndpoint}/health`);
      if (response.ok) {
        this.state.isConnected = true;
        this.updateConnectionStatus();
      }
      
    } catch (error) {
      console.warn('Backend connection failed, running in offline mode:', error);
      this.state.isConnected = false;
      this.updateConnectionStatus();
    }
  }

  updateConnectionStatus() {
    const statusDot = this.elements.assistantBubble.querySelector('.status-dot');
    if (statusDot) {
      statusDot.className = `status-dot ${this.state.isConnected ? 'online' : 'offline'}`;
    }
  }

  // ========== AUTONOMOUS MONITORING ==========
  startAutonomousMonitoring() {
    // Monitor user behavior and provide proactive assistance
    setInterval(() => {
      if (!this.state.isOpen && this.state.isConnected) {
        this.checkForProactiveAssistance();
      }
    }, 30000); // Check every 30 seconds
  }

  checkForProactiveAssistance() {
    // Analyze user behavior and offer help if needed
    const timeOnPage = Date.now() - this.state.userSession.startTime;
    const hasInteracted = this.state.userSession.conversationContext.length > 0;
    
    if (timeOnPage > 120000 && !hasInteracted) { // 2 minutes on page, no interaction
      this.showProactiveMessage("Hi! I noticed you're browsing our cakes. Can I help you find something perfect for your occasion?");
    }
  }

  showProactiveMessage(message) {
    this.elements.assistantBubble.classList.add('pulse-proactive');
    setTimeout(() => {
      this.elements.assistantBubble.classList.remove('pulse-proactive');
    }, 3000);
  }

  showAutonomousWelcome() {
    setTimeout(() => {
      if (this.state.userSession.conversationContext.length === 1) { // Only welcome message
        this.showProactiveMessage("I'm here whenever you need help with cakes or orders! Don't hesitate to ask! \ud83e\uddc1");
      }
    }, 10000);
  }

  // ========== INITIALIZATION HELPERS ==========
  cacheElements() {
    this.elements = {
      assistantBubble: document.getElementById('assistantBubble'),
      assistantWindow: document.getElementById('assistantWindow'),
      mascotMood: document.getElementById('mascotMood'),
      headerMascotStatus: document.getElementById('headerMascotStatus'),
      assistantMessages: document.getElementById('assistantMessages'),
      messageInput: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      closeBtn: document.getElementById('closeBtn'),
      minimizeBtn: document.getElementById('minimizeBtn'),
      voiceBtn: document.getElementById('voiceBtn'),
      quickActions: document.getElementById('quickActions'),
      typingIndicator: document.getElementById('typingIndicator')
    };
  }

  applyTheme() {
    // Apply Sweet Layers theme styling
    this.widgetContainer.classList.add('sweet-layers-theme');
  }

  async loadUserPreferences() {
    // Load saved user preferences from localStorage
    const saved = localStorage.getItem('sweetLayersAssistantPrefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this.state.userSession.preferences = { ...this.state.userSession.preferences, ...prefs };
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      }
    }
  }

  showErrorMessage(message) {
    console.error(message);
    // Could show a toast notification here
  }

  // ========== CLEANUP ==========
  destroy() {
    if (this.ws) {
      this.ws.close();
    }
    
    if (this.widgetContainer) {
      this.widgetContainer.remove();
    }
    
    // Save user preferences
    localStorage.setItem('sweetLayersAssistantPrefs', JSON.stringify(this.state.userSession.preferences));
  }
}

// ========== SUPPORTING CLASSES ==========

class SweetLayersNLP {
  constructor() {
    this.intents = {
      greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'],
      order: ['order', 'buy', 'purchase', 'want', 'need', 'get', 'add to cart'],
      recommendation: ['recommend', 'suggest', 'what do you', 'which', 'best', 'popular'],
      tracking: ['track', 'status', 'where is', 'delivery', 'shipping', 'order status'],
      help: ['help', 'assist', 'support', 'question', 'how to', 'what can']
    };
    
    this.entities = {
      cake: ['cake', 'cakes', 'pastry', 'dessert', 'sweet', 'treat'],
      flavor: ['chocolate', 'vanilla', 'strawberry', 'lemon', 'red velvet'],
      size: ['small', 'medium', 'large', 'mini', 'regular'],
      occasion: ['birthday', 'wedding', 'anniversary', 'celebration', 'party']
    };
  }

  process(message, session) {
    const text = message.toLowerCase();
    
    // Intent detection
    let intent = 'general';
    let confidence = 0;
    
    for (const [intentName, keywords] of Object.entries(this.intents)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > confidence) {
        intent = intentName;
        confidence = matches;
      }
    }
    
    // Entity extraction
    const entities = {};
    for (const [entityType, keywords] of Object.entries(this.entities)) {
      entities[entityType] = keywords.filter(keyword => text.includes(keyword));
    }
    
    // Preferences extraction
    const preferences = {
      interestedIn: entities.cake.length > 0,
      flavors: entities.flavor,
      sizes: entities.size,
      occasions: entities.occasion
    };
    
    return {
      intent,
      confidence,
      entities,
      preferences,
      originalMessage: message
    };
  }
}

class OrderProcessor {
  constructor(config) {
    this.apiEndpoint = config.apiEndpoint;
  }

  extractOrderDetails(nlpResult) {
    return {
      items: nlpResult.entities.cake || [],
      flavors: nlpResult.entities.flavor || [],
      sizes: nlpResult.entities.size || [],
      occasions: nlpResult.entities.occasion || [],
      preferences: nlpResult.preferences
    };
  }

  async createOrder(orderDetails) {
    // Mock order creation - in production, this would call the backend API
    return {
      id: `ORD_${Date.now()}`,
      items: orderDetails.items.map(item => ({
        name: item,
        price: Math.floor(Math.random() * 30) + 15,
        quantity: 1
      })),
      total: Math.floor(Math.random() * 50) + 25,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  async trackOrder(orderId) {
    // Mock tracking - in production, this would call the backend API
    return {
      id: orderId,
      status: 'in-progress',
      estimatedDelivery: 'Tomorrow, 2-4 PM',
      currentLocation: 'Bakery'
    };
  }
}

class RecommendationEngine {
  constructor() {
    this.cakes = [
      { name: 'Chocolate Fudge', tags: ['chocolate', 'popular'], price: 25 },
      { name: 'Vanilla Dream', tags: ['vanilla', 'classic'], price: 22 },
      { name: 'Strawberry Delight', tags: ['strawberry', 'fruity'], price: 28 },
      { name: 'Red Velvet', tags: ['red velvet', 'luxury'], price: 30 }
    ];
  }

  getRecommendations(preferences, userPrefs) {
    let recommendations = this.cakes;
    
    // Filter based on preferences
    if (preferences.flavors && preferences.flavors.length > 0) {
      recommendations = recommendations.filter(cake => 
        cake.tags.some(tag => preferences.flavors.includes(tag))
      );
    }
    
    // Return top 3
    return recommendations.slice(0, 3);
  }
}

class AdvancedFilterSystem {
  constructor() {
    this.filters = {
      spam: true,
      toxicity: true,
      rateLimit: true
    };
    
    this.spamPatterns = [
      /\b(?:viagra|casino|lottery|winner)\b/i,
      /\b(?:free|cheap|discount|buy now)\b/i,
      /(?:http|https|www\.)\S+/gi
    ];
    
    this.toxicPatterns = [
      /\b(?:stupid|idiot|dumb|moron)\b/i,
      /\b(?:hate|dislike|worst|terrible)\b/i,
      /\b(?:fuck|shit|damn|hell)\b/i
    ];
  }

  process(message) {
    const text = message.toLowerCase();
    
    // Spam filtering
    if (this.filters.spam) {
      for (const pattern of this.spamPatterns) {
        if (pattern.test(text)) {
          return { blocked: true, reason: "Message appears to be spam" };
        }
      }
    }
    
    // Toxicity filtering
    if (this.filters.toxicity) {
      for (const pattern of this.toxicPatterns) {
        if (pattern.test(text)) {
          return { blocked: true, reason: "Message contains inappropriate content" };
        }
      }
    }
    
    return { blocked: false };
  }
}

class VoiceSynthesizer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
  }

  speak(text) {
    if (this.synth && this.voices.length > 0) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voices.find(voice => voice.lang.includes('en')) || this.voices[0];
      this.synth.speak(utterance);
    }
  }
}

// Export for global use
window.AutonomousSweetLayersAssistant = AutonomousSweetLayersAssistant;
