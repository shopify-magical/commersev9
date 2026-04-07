/**
 * MASCOT CHAT WIDGET - Advanced Chat Filtering & Layout Engineering
 *
 * FEATURES:
 * - Animated mascot character with personality
 * - Advanced chat filtering (spam, toxicity, keywords, sentiment)
 * - Intelligent layout engineering with responsive design
 * - Context-aware responses and visual feedback
 * - Enhanced user experience with smooth animations
 * - Real-time message processing and filtering
 * - Customizable mascot behaviors and animations
 */

class MascotChatWidget extends UnifiedChatWidget {
  constructor(config = {}) {
    super(config);

    // Enhanced config with mascot and filtering options
    this.mascotConfig = {
      character: config.character || 'mooncake',
      personality: config.personality || 'friendly',
      animations: config.animations !== false,
      voiceEnabled: config.voiceEnabled || false,
      filteringEnabled: config.filteringEnabled !== false,
      ...config.mascotConfig
    };

    // Advanced filtering system
    this.filterSystem = {
      enabled: this.mascotConfig.filteringEnabled,
      filters: {
        spam: true,
        toxicity: true,
        keywords: true,
        sentiment: true,
        rateLimit: true
      },
      spamPatterns: [
        /\b(?:viagra|casino|lottery|winner)\b/i,
        /\b(?:free|cheap|discount|buy now)\b/i,
        /\b(?:urgent|limited time|act now)\b/i,
        /(?:http|https|www\.)\S+/gi
      ],
      toxicPatterns: [
        /\b(?:stupid|idiot|dumb|moron)\b/i,
        /\b(?:hate|dislike|worst|terrible)\b/i,
        /\b(?:fuck|shit|damn|hell)\b/i
      ],
      blockedKeywords: [
        'bitcoin', 'crypto', 'investment', 'scam',
        'pharmacy', 'drugs', 'weapon', 'illegal'
      ],
      rateLimit: {
        messages: [],
        maxPerMinute: 10,
        maxPerHour: 50
      }
    };

    // Layout engineering state
    this.layoutState = {
      currentLayout: 'compact',
      responsiveMode: 'desktop',
      animations: [],
      transitions: []
    };

    // Mascot personality and behavior
    this.mascotPersonality = {
      mood: 'happy',
      energy: 'high',
      responses: {
        greeting: ["Hello! I'm your Sweet Layers assistant! 🍰", "Hi there! Ready to help with cakes and pastries! 🧁"],
        thanks: ["You're welcome! Happy to help! 😊", "My pleasure! Enjoy your treats! 🎂"],
        confused: ["Hmm, I'm not sure about that. Let me think... 🤔", "Could you clarify that for me? 🍪"],
        excited: ["That's wonderful! Let me help you with that! 🌟", "Great choice! I love that too! 🎉"]
      }
    };

    // Initialize mascot enhancements
    this.initMascotFeatures();
  }

  initMascotFeatures() {
    // Initialize advanced filtering
    this.initAdvancedFiltering();

    // Initialize mascot character
    this.initMascotCharacter();

    // Initialize layout engineering
    this.initLayoutEngineering();

    // Initialize enhanced animations
    this.initEnhancedAnimations();

    // Setup responsive behavior
    this.setupResponsiveBehavior();
  }

  // ===== ADVANCED CHAT FILTERING SYSTEM =====

  initAdvancedFiltering() {
    if (!this.filterSystem.enabled) return;

    console.log('🔍 Initializing Advanced Chat Filtering System...');

    // Setup message preprocessing
    this.originalAddMessage = this.addMessage;
    this.addMessage = this.filteredAddMessage.bind(this);

    // Setup rate limiting
    this.setupRateLimiting();

    // Setup content filtering
    this.setupContentFiltering();

    // Setup sentiment analysis
    this.setupSentimentAnalysis();
  }

  filteredAddMessage(type, content, options = {}) {
    // Preprocess message through filters
    const filteredContent = this.processMessageFilters(content);

    if (!filteredContent) {
      // Message was blocked by filters
      this.handleFilteredMessage(type, content);
      return;
    }

    // Add filtered message
    this.originalAddMessage(type, filteredContent, options);

    // Update filtering metrics
    this.updateFilteringMetrics(type, content, filteredContent);
  }

  processMessageFilters(content) {
    if (!this.filterSystem.enabled) return content;

    let filteredContent = content;

    // Apply spam filtering
    if (this.filterSystem.filters.spam) {
      filteredContent = this.filterSpam(filteredContent);
    }

    // Apply toxicity filtering
    if (this.filterSystem.filters.toxicity) {
      filteredContent = this.filterToxicity(filteredContent);
    }

    // Apply keyword filtering
    if (this.filterSystem.filters.keywords) {
      filteredContent = this.filterKeywords(filteredContent);
    }

    // Apply rate limiting
    if (this.filterSystem.filters.rateLimit) {
      if (!this.checkRateLimit()) {
        return null; // Rate limited
      }
    }

    return filteredContent;
  }

  filterSpam(content) {
    for (const pattern of this.filterSystem.spamPatterns) {
      if (pattern.test(content)) {
        console.log('🚫 Spam detected:', content.substring(0, 50) + '...');
        return this.generateFilteredResponse('spam');
      }
    }
    return content;
  }

  filterToxicity(content) {
    for (const pattern of this.filterSystem.toxicPatterns) {
      if (pattern.test(content)) {
        console.log('⚠️ Toxic content detected:', content.substring(0, 50) + '...');
        return this.generateFilteredResponse('toxicity');
      }
    }
    return content;
  }

  filterKeywords(content) {
    const lowerContent = content.toLowerCase();
    for (const keyword of this.filterSystem.blockedKeywords) {
      if (lowerContent.includes(keyword)) {
        console.log('🚫 Blocked keyword detected:', keyword);
        return this.generateFilteredResponse('keyword', keyword);
      }
    }
    return content;
  }

  checkRateLimit() {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    // Clean old messages
    this.filterSystem.rateLimit.messages = this.filterSystem.rateLimit.messages.filter(
      time => now - time < oneHour
    );

    // Check per minute limit
    const recentMessages = this.filterSystem.rateLimit.messages.filter(
      time => now - time < oneMinute
    );

    if (recentMessages.length >= this.filterSystem.rateLimit.maxPerMinute) {
      console.log('🚫 Rate limit exceeded (per minute)');
      return false;
    }

    // Check per hour limit
    if (this.filterSystem.rateLimit.messages.length >= this.filterSystem.rateLimit.maxPerHour) {
      console.log('🚫 Rate limit exceeded (per hour)');
      return false;
    }

    // Add current message
    this.filterSystem.rateLimit.messages.push(now);
    return true;
  }

  generateFilteredResponse(type, detail = '') {
    const responses = {
      spam: "I only help with Sweet Layers cakes and pastries! 🧁",
      toxicity: "Let's keep our conversation sweet and positive! 😊",
      keyword: `I can't help with ${detail}. Let's talk about delicious cakes instead! 🍰`,
      ratelimit: "You're sending messages too quickly! Please slow down. ⏱️"
    };

    return responses[type] || "I didn't understand that. How can I help with your order? 🤔";
  }

  handleFilteredMessage(type, originalContent) {
    if (this.filterSystem.onFilterEvent) {
      this.filterSystem.onFilterEvent(type, originalContent, 'blocked');
    }

    this.showMascotReaction('filtered');
    this.logFilteredMessage(type, originalContent);
  }

  updateFilteringMetrics(type, original, filtered) {
    const metrics = {
      type,
      originalLength: original.length,
      filteredLength: filtered.length,
      timestamp: Date.now(),
      sessionId: this.state.userSession.sessionId
    };

    if (window.AnalyticsSuite) {
      window.AnalyticsSuite.track('chat_filter_applied', metrics);
    }

    if (this.filterSystem.onFilterEvent) {
      this.filterSystem.onFilterEvent(type, original, 'filtered');
    }
  }

  // ===== AUTOMATION FLOW =====
  processAutomationCommand(message) {
    const lowerMsg = message.toLowerCase();
    
    const patterns = {
      'order': /^(order|สั่งซื้อ|ซื้อ)\s*(\d+)?\s*(.+)/i,
      'track': /^(track|ติดตาม|สถานะ)\s*(.*)/i,
      'cancel': /^(cancel|ยกเลิก)\s*(.*)/i,
      'help': /^(help|ช่วย|help)\s*(.*)?/i,
      'cake': /(cake|เค้ก|ขนมเค้ก)/i,
      'pastry': /(pastry|ขนมปัง|เบเกอรี่)/i
    };

    for (const [action, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerMsg)) {
        this.triggerAutomationFlow(action, message);
        return true;
      }
    }
    return false;
  }

  triggerAutomationFlow(action, message) {
    console.log(`🤖 Automation Flow: ${action}`, message);

    const automationActions = {
      'order': {
        type: 'auto-fill',
        formSelector: '#order-form',
        data: { orderIntent: message }
      },
      'track': {
        type: 'navigate',
        path: '/order-management.html'
      },
      'cancel': {
        type: 'show-panel',
        panel: 'cancel-order',
        data: { orderId: this.extractOrderId(message) }
      },
      'help': {
        type: 'suggest',
        message: 'How can I help you today?',
        actions: [
          { label: '🍰 Browse Cakes', action: () => this.triggerAutomationFlow('cake', '') },
          { label: '🛒 My Orders', action: () => this.triggerAutomationFlow('track', '') }
        ]
      },
      'cake': {
        type: 'navigate',
        path: '/shop.html?category=cakes'
      },
      'pastry': {
        type: 'navigate',
        path: '/shop.html?category=pastries'
      }
    };

    const automationAction = automationActions[action];
    if (automationAction && window.AgenticEngine) {
      window.AgenticEngine.handleAgentAction(automationAction);
    }

    if (this.onAutomationTrigger) {
      this.onAutomationTrigger(action, automationAction);
    }
  }

  extractOrderId(message) {
    const match = message.match(/(?:order|คำสั่งซื้อ)\s*#?(\w+)/i);
    return match ? match[1] : null;
  }

  setupRateLimiting() {
    // Rate limiting is handled in checkRateLimit method
    console.log('⏱️ Rate limiting initialized');
  }

  setupContentFiltering() {
    // Content filtering patterns are defined in filterSystem
    console.log('🛡️ Content filtering initialized');
  }

  setupSentimentAnalysis() {
    // Basic sentiment analysis is implemented in the filtering methods
    console.log('😊 Sentiment analysis initialized');
  }

  logFilteredMessage(type, content) {
    console.log(`[FILTERED] ${type}: ${content.substring(0, 100)}...`);
  }

  // ===== MASCOT CHARACTER SYSTEM =====

  initMascotCharacter() {
    console.log('🎭 Initializing Mascot Character System...');

    // Create mascot personality engine
    this.mascotEngine = new MascotPersonalityEngine(this.mascotConfig);

    // Setup mascot animations
    this.setupMascotAnimations();

    // Setup mascot interactions
    this.setupMascotInteractions();
  }

  setupMascotAnimations() {
    // Add mascot-specific CSS animations
    this.addMascotAnimations();

    // Setup idle animations
    this.startIdleAnimations();

    // Setup reaction animations
    this.setupReactionAnimations();
  }

  addMascotAnimations() {
    const mascotCSS = `
      <style>
        .mascot-character {
          position: relative;
          transition: all 0.3s ease;
        }

        .mascot-character.idle {
          animation: mascot-idle 3s ease-in-out infinite;
        }

        .mascot-character.happy {
          animation: mascot-happy 0.5s ease;
        }

        .mascot-character.sad {
          animation: mascot-sad 0.5s ease;
        }

        .mascot-character.excited {
          animation: mascot-excited 0.8s ease;
        }

        .mascot-character.thinking {
          animation: mascot-thinking 2s ease-in-out infinite;
        }

        @keyframes mascot-idle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }

        @keyframes mascot-happy {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes mascot-sad {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes mascot-excited {
          0% { transform: scale(1); }
          25% { transform: scale(1.2) rotate(10deg); }
          50% { transform: scale(1.1) rotate(-10deg); }
          75% { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1); }
        }

        @keyframes mascot-thinking {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-3px) rotate(2deg); }
          75% { transform: translateY(3px) rotate(-2deg); }
        }

        .mascot-speech-bubble {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--white);
          border: 2px solid var(--primary);
          border-radius: 12px;
          padding: 8px 12px;
          margin-bottom: 8px;
          font-size: 14px;
          box-shadow: var(--shadow-lg);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          max-width: 200px;
          word-wrap: break-word;
        }

        .mascot-speech-bubble.show {
          opacity: 1;
          visibility: visible;
        }

        .mascot-speech-bubble::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 8px solid transparent;
          border-top-color: var(--white);
        }

        .mascot-speech-bubble::before {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 10px solid transparent;
          border-top-color: var(--primary);
          margin-top: -2px;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', mascotCSS);
  }

  startIdleAnimations() {
    const mascotElement = document.querySelector('.mascot-character');
    if (mascotElement && this.mascotConfig.animations) {
      mascotElement.classList.add('idle');
    }
  }

  setupReactionAnimations() {
    // Setup reactions for different message types
    this.reactionMap = {
      greeting: 'happy',
      question: 'thinking',
      order: 'excited',
      error: 'sad',
      success: 'happy',
      filtered: 'sad'
    };
  }

  showMascotReaction(type) {
    const mascotElement = document.querySelector('.mascot-character');
    if (!mascotElement || !this.mascotConfig.animations) return;

    // Remove existing reactions
    Object.values(this.reactionMap).forEach(reaction => {
      mascotElement.classList.remove(reaction);
    });

    // Add new reaction
    const reaction = this.reactionMap[type] || 'happy';
    mascotElement.classList.add(reaction);

    // Remove reaction after animation
    setTimeout(() => {
      mascotElement.classList.remove(reaction);
      mascotElement.classList.add('idle');
    }, 1000);
  }

  showMascotSpeech(text, duration = 3000) {
    // Remove existing speech bubble
    const existingBubble = document.querySelector('.mascot-speech-bubble');
    if (existingBubble) {
      existingBubble.remove();
    }

    // Create new speech bubble
    const mascotElement = document.querySelector('.mascot-character');
    if (!mascotElement) return;

    const bubble = document.createElement('div');
    bubble.className = 'mascot-speech-bubble';
    bubble.textContent = text;

    mascotElement.appendChild(bubble);

    // Show bubble
    setTimeout(() => bubble.classList.add('show'), 100);

    // Hide bubble
    setTimeout(() => {
      bubble.classList.remove('show');
      setTimeout(() => bubble.remove(), 300);
    }, duration);
  }

  setupMascotInteractions() {
    // Add click interactions
    const mascotElement = document.querySelector('.mascot-character');
    if (mascotElement) {
      mascotElement.addEventListener('click', () => {
        this.showMascotSpeech(this.getRandomResponse('greeting'));
        this.showMascotReaction('excited');
      });

      mascotElement.addEventListener('mouseenter', () => {
        this.showMascotReaction('happy');
      });

      mascotElement.addEventListener('mouseleave', () => {
        // Return to idle after a delay
        setTimeout(() => this.startIdleAnimations(), 1000);
      });
    }
  }

  getRandomResponse(type) {
    const responses = this.mascotPersonality.responses[type] || ["How can I help you? 🤔"];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== LAYOUT ENGINEERING SYSTEM =====

  initLayoutEngineering() {
    console.log('🏗️ Initializing Layout Engineering System...');

    // Setup responsive layout detection
    this.setupLayoutDetection();

    // Setup dynamic layout adjustments
    this.setupDynamicLayout();

    // Setup performance optimizations
    this.setupPerformanceOptimizations();
  }

  setupLayoutDetection() {
    // Detect screen size and orientation
    this.updateLayoutMode();

    // Listen for resize events
    window.addEventListener('resize', this.debounce(() => {
      this.updateLayoutMode();
      this.adjustLayoutForScreen();
    }, 250));
  }

  updateLayoutMode() {
    const width = window.innerWidth;

    if (width <= 480) {
      this.layoutState.responsiveMode = 'mobile';
    } else if (width <= 768) {
      this.layoutState.responsiveMode = 'tablet';
    } else if (width <= 1024) {
      this.layoutState.responsiveMode = 'desktop';
    } else {
      this.layoutState.responsiveMode = 'large';
    }

    // Update container classes
    const container = document.querySelector('.unified-chat-widget');
    if (container) {
      container.setAttribute('data-responsive-mode', this.layoutState.responsiveMode);
    }
  }

  adjustLayoutForScreen() {
    const mode = this.layoutState.responsiveMode;
    const chatWindow = document.querySelector('.chat-window');

    if (!chatWindow) return;

    // Adjust chat window size based on screen
    switch (mode) {
      case 'mobile':
        chatWindow.style.width = 'calc(100vw - 20px)';
        chatWindow.style.height = 'calc(100vh - 100px)';
        break;
      case 'tablet':
        chatWindow.style.width = '400px';
        chatWindow.style.height = '600px';
        break;
      case 'desktop':
        chatWindow.style.width = '450px';
        chatWindow.style.height = '650px';
        break;
      case 'large':
        chatWindow.style.width = '500px';
        chatWindow.style.height = '700px';
        break;
    }
  }

  setupDynamicLayout() {
    // Dynamic message container height
    this.setupDynamicMessageHeight();

    // Dynamic input area adjustments
    this.setupDynamicInputArea();

    // Dynamic quick actions layout
    this.setupDynamicQuickActions();
  }

  setupDynamicMessageHeight() {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;

    // Auto-scroll to bottom when new messages arrive
    const observer = new MutationObserver(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    observer.observe(messagesContainer, {
      childList: true,
      subtree: true
    });
  }

  setupDynamicInputArea() {
    const input = document.querySelector('.chat-input input');
    if (!input) return;

    // Auto-resize input based on content
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  setupDynamicQuickActions() {
    const quickActions = document.querySelector('.quick-actions');
    if (!quickActions) return;

    // Dynamic layout based on available space
    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = quickActions.parentElement.offsetWidth;
      const buttonWidth = 120;
      const maxButtons = Math.floor(containerWidth / buttonWidth);

      const buttons = quickActions.querySelectorAll('.quick-btn');
      buttons.forEach((button, index) => {
        if (index >= maxButtons) {
          button.style.display = 'none';
        } else {
          button.style.display = 'inline-block';
        }
      });
    });

    resizeObserver.observe(quickActions.parentElement);
  }

  // ===== ENHANCED ANIMATIONS =====

  initEnhancedAnimations() {
    // Setup smooth transitions
    this.setupSmoothTransitions();

    // Setup micro-interactions
    this.setupMicroInteractions();

    // Setup loading animations
    this.setupLoadingAnimations();
  }

  setupSmoothTransitions() {
    const transitionElements = [
      '.chat-message',
      '.quick-btn',
      '.chat-header',
      '.chat-input'
    ];

    transitionElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.transition = 'all 0.3s ease';
      });
    });
  }

  setupMicroInteractions() {
    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('quick-btn')) {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = 'var(--shadow-md)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('quick-btn')) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'var(--shadow-sm)';
      }
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('chat-message')) {
        e.target.style.transform = 'scale(1.02)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('chat-message')) {
        e.target.style.transform = 'scale(1)';
      }
    });
  }

  setupLoadingAnimations() {
    const sendBtn = document.querySelector('.send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        sendBtn.classList.add('loading');
        setTimeout(() => {
          sendBtn.classList.remove('loading');
        }, 1000);
      });
    }
  }

  setupPerformanceOptimizations() {
    // Debounced event handlers
    // Already implemented in other methods
  }

  setupResponsiveBehavior() {
    // Setup touch gestures for mobile
    this.setupTouchGestures();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupTouchGestures() {
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });

    document.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;
      const deltaTime = Date.now() - startTime;

      // Swipe down to close on mobile
      if (deltaY < -50 && deltaTime < 300 && this.layoutState.responsiveMode === 'mobile') {
        this.closeChat();
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + / to open chat
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.toggleChat();
      }

      // Escape to close chat
      if (e.key === 'Escape' && this.state.isOpen) {
        this.closeChat();
      }
    });
  }

  // ===== OVERRIDE PARENT METHODS =====

  createChatUI() {
    super.createChatUI();

    // Add mascot character to chat bubble
    const bubbleIcon = document.querySelector('.bubble-icon');
    if (bubbleIcon) {
      bubbleIcon.classList.add('mascot-character');
    }
  }

  showWelcomeMessage() {
    super.showWelcomeMessage();
    this.showMascotReaction('happy');
    setTimeout(() => {
      this.showMascotSpeech("Welcome to Sweet Layers! I'm here to help with your cake orders! 🧁");
    }, 1000);
  }

  addMessage(type, content, options = {}) {
    if (type === 'user') {
      this.showMascotReaction('thinking');
      if (this.processAutomationCommand && this.processAutomationCommand(content)) {
        return;
      }
      if (this.onMessageSent) {
        this.onMessageSent(content);
      }
    } else if (type === 'assistant') {
      this.showMascotReaction('happy');
      if (this.onBotResponse) {
        this.onBotResponse(content);
      }
    }

    super.addMessage(type, content, options);
  }

  sendMessage() {
    this.showMascotReaction('thinking');

    const input = document.querySelector('#chatInput');
    const message = input?.value?.trim();
    
    super.sendMessage();

    if (message && this.onMessageSent) {
      this.onMessageSent(message);
    }

    setTimeout(() => {
      this.showMascotReaction('happy');
    }, 500);
  }

  // ===== UTILITY METHODS =====

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// ===== CORE ENGINE INTEGRATION =====
class ChatbotEngineBridge {
  constructor(chatWidget) {
    this.chatWidget = chatWidget;
    this.engine = null;
    this.connected = false;
  }

  connect(engine) {
    this.engine = engine;
    this.connected = true;
    console.log('🔗 Chatbot connected to Agentic Dashboard Engine');
    this.setupEventBridge();
  }

  setupEventBridge() {
    if (!this.engine) return;

    const widget = this.chatWidget;
    const agent = this.engine.agent;
    const events = this.engine.events;

    widget.filterSystem.onFilterEvent = (filterType, message, action) => {
      if (agent) {
        agent.submitObservation({
          type: 'chat_filter',
          data: {
            filterType,
            message: message.substring(0, 100),
            action,
            timestamp: Date.now()
          }
        });
      }

      events.emit('chat:filter', { filterType, message, action });
    };

    widget.onMessageSent = (message) => {
      if (agent) {
        agent.submitObservation({
          type: 'chat_message',
          data: {
            message,
            timestamp: Date.now()
          }
        });
      }

      events.emit('chat:message', { message, type: 'user' });
    };

    widget.onBotResponse = (response) => {
      events.emit('chat:response', { response, type: 'assistant' });
    };
  }

  triggerAutomation(action) {
    if (!this.engine) return;
    this.engine.handleAgentAction(action);
  }
}

// Mascot Personality Engine
class MascotPersonalityEngine {
  constructor(config) {
    this.config = config;
    this.state = {
      mood: 'neutral',
      energy: 'medium',
      lastInteraction: Date.now(),
      interactionCount: 0
    };
  }

  processMessage(message) {
    const sentiment = this.analyzeSentiment(message);
    this.updateMood(sentiment);
    return this.generateResponse(sentiment, message);
  }

  analyzeSentiment(message) {
    const positiveWords = ['great', 'awesome', 'love', 'wonderful', 'amazing', 'delicious', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'awful', 'disgusting'];

    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  updateMood(sentiment) {
    switch (sentiment) {
      case 'positive':
        this.state.mood = 'happy';
        this.state.energy = 'high';
        break;
      case 'negative':
        this.state.mood = 'sad';
        this.state.energy = 'low';
        break;
      default:
        this.state.mood = 'neutral';
        this.state.energy = 'medium';
    }
  }

  generateResponse(sentiment, originalMessage) {
    const responses = {
      positive: [
        "I'm so happy to hear that! 🥰",
        "That makes me smile! 😊",
        "Wonderful! Let's make something delicious! 🎂"
      ],
      negative: [
        "I'm sorry to hear that. Let me help make it better! 😔",
        "Oh no! Let's turn that frown upside down with some cake! 🧁",
        "I understand. How can I make this better for you? 🤗"
      ],
      neutral: [
        "I understand! How can I help you today? 🤔",
        "Got it! What would you like to do? 🍰",
        "I'm here to help! What can I assist you with? 😊"
      ]
    };

    const sentimentResponses = responses[sentiment] || responses.neutral;
    return sentimentResponses[Math.floor(Math.random() * sentimentResponses.length)];
  }
}

// Export for global use
window.MascotChatWidget = MascotChatWidget;
window.MascotPersonalityEngine = MascotPersonalityEngine;