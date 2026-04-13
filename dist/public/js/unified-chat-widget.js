/**
 * UNIFIED CHAT WIDGET - Complete Ordering & Task Management
 * Integrates with Agentic Engine for intelligent order processing
 * 
 * FEATURES:
 * - Natural language ordering ("I want 2 chocolate cakes")
 * - Order tracking and status updates
 * - Payment processing integration
 * - Delivery scheduling
 * - Customer service automation
 * - Task management for shop operations
 * - Real-time order status from backend
 */

class UnifiedChatWidget {
  constructor(config = {}) {
    this.config = {
      position: config.position || 'bottom-right',
      theme: config.theme || 'cake-shop',
      apiEndpoint: 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/api/agentic',
      wsEndpoint: 'wss://bizcommerz-agentic-engine.aekbuffalo.workers.dev/ws',
      enableVoice: config.enableVoice || false,
      enableOrders: config.enableOrders !== false,
      enableTasks: config.enableTasks !== false,
      ...config
    };

    this.state = {
      isOpen: false,
      messages: [],
      currentOrder: null,
      activeTask: null,
      userSession: {
        sessionId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        cart: [],
        orders: [],
        preferences: {}
      },
      connected: false,
      typing: false
    };

    this.engine = null;
    this.ws = null;
    this.elements = {};
  }

  async init() {
    console.log('Initializing Unified Chat Widget...');
    
    // Create chat UI
    this.createChatUI();
    
    // Connect to agentic engine
    await this.connectToEngine();
    
    // Setup WebSocket for real-time updates
    await this.connectWebSocket();
    
    // Setup message handlers
    this.setupMessageHandlers();
    
    // Show welcome message
    this.showWelcomeMessage();
    
    console.log('Unified Chat Widget ready!');
  }

  createChatUI() {
    // Create main chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'unified-chat-widget';
    chatContainer.className = 'unified-chat-widget';
    chatContainer.innerHTML = `
      <div class="chat-bubble" id="chatBubble">
        <div class="bubble-icon"><img src="images/mooncake-icon-optimized.svg" alt="Cake" style="width:32px;height:32px;" /></div>
        <div class="bubble-badge" id="chatBadge">1</div>
        <div class="pulse-ring"></div>
      </div>
      
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <div class="header-left">
            <div class="header-title">Sweet Layers Assistant</div>
            <div class="header-status" id="connectionStatus">Online</div>
          </div>
          <div class="header-actions">
            <button class="header-btn" id="voiceBtn" title="Voice Input">Voice</button>
            <button class="header-btn" id="minimizeBtn" title="Minimize">−</button>
            <button class="header-btn" id="closeBtn" title="Close">×</button>
          </div>
        </div>
        
        <div class="chat-body">
          <div class="chat-messages" id="chatMessages"></div>
          
            <div class="quick-actions" id="quickActions">
              <button class="quick-btn" data-action="order">Place Order</button>
              <button class="quick-btn" data-action="track">Track Order</button>
              <button class="quick-btn" data-action="menu">View Menu</button>
              <button class="quick-btn" data-action="help">Help</button>
            </div>
        </div>
        
        <div class="chat-input-area">
          <div class="input-container">
            <input type="text" id="chatInput" placeholder="Type your message or say 'order 2 chocolate cakes'..." />
            <button class="send-btn" id="sendBtn">Send</button>
          </div>
          <div class="input-suggestions" id="inputSuggestions"></div>
        </div>
      </div>
    `;

    // Add styles
    this.addChatStyles();
    
    // Append to body
    document.body.appendChild(chatContainer);
    
    // Cache elements
    this.elements = {
      container: chatContainer,
      bubble: document.getElementById('chatBubble'),
      window: document.getElementById('chatWindow'),
      messages: document.getElementById('chatMessages'),
      input: document.getElementById('chatInput'),
      sendBtn: document.getElementById('sendBtn'),
      badge: document.getElementById('chatBadge'),
      status: document.getElementById('connectionStatus'),
      quickActions: document.getElementById('quickActions'),
      voiceBtn: document.getElementById('voiceBtn'),
      minimizeBtn: document.getElementById('minimizeBtn'),
      closeBtn: document.getElementById('closeBtn'),
      suggestions: document.getElementById('inputSuggestions')
    };

    // Setup event listeners
    this.setupUIEventListeners();
  }

  setupUIEventListeners() {
    // Toggle chat window
    this.elements.bubble.addEventListener('click', () => this.toggleChat());
    
    // Send message
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Quick actions
    this.elements.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-btn')) {
        this.handleQuickAction(e.target.dataset.action);
      }
    });

    // Header buttons
    this.elements.minimizeBtn.addEventListener('click', () => this.minimizeChat());
    this.elements.closeBtn.addEventListener('click', () => this.closeChat());
    
    // Voice input (if enabled)
    if (this.config.enableVoice) {
      this.elements.voiceBtn.addEventListener('click', () => this.startVoiceInput());
    }

    // Input suggestions
    this.elements.input.addEventListener('input', (e) => {
      this.showSuggestions(e.target.value);
    });
  }

  async connectToEngine() {
    try {
      // Initialize agentic dashboard engine
      this.engine = new AgenticDashboardEngine({
        apiEndpoint: this.config.apiEndpoint,
        wsEndpoint: this.config.wsEndpoint,
        enableRealtime: true,
        enableAgent: true,
        tickInterval: 5000
      });

      await this.engine.init();
      this.state.connected = true;
      
      // Submit chat initialization goal
      this.engine.agent.submitGoal(
        'Initialize unified chat widget for customer interaction',
        'high',
        {
          sessionId: this.state.userSession.sessionId,
          widgetType: 'unified-chat',
          capabilities: ['ordering', 'tracking', 'customer-service', 'task-management']
        }
      );

    } catch (err) {
      console.error('Failed to connect to engine:', err);
      this.state.connected = false;
      this.updateConnectionStatus('Offline');
    }
  }

  async connectWebSocket() {
    try {
      this.ws = new WebSocket(this.config.wsEndpoint);
      
      this.ws.onopen = () => {
        console.log('Chat WebSocket connected');
        this.updateConnectionStatus('Connected');
        
        // Send session info
        this.ws.send(JSON.stringify({
          type: 'user:connect',
          data: {
            sessionId: this.state.userSession.sessionId,
            widgetType: 'unified-chat'
          }
        }));
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
        this.updateConnectionStatus('Reconnecting...');
        setTimeout(() => this.connectWebSocket(), 5000);
      };

    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }

  setupMessageHandlers() {
    // Override agent actions for chat context
    if (this.engine?.agent) {
      this.engine.agent.config.onAction = (action) => {
        this.handleAgentAction(action);
      };
    }
  }

  // ========== MESSAGE PROCESSING ==========
  
  async sendMessage() {
    const input = this.elements.input.value.trim();
    if (!input) return;

    // Add user message
    this.addMessage('user', input);
    this.elements.input.value = '';
    this.hideSuggestions();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Process message through agentic engine
      const response = await this.processMessage(input);
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      // Add response
      this.addMessage('assistant', response.text, response.actions);
      
      // Execute any actions
      if (response.actions) {
        this.executeActions(response.actions);
      }

    } catch (err) {
      console.error('Message processing failed:', err);
      this.hideTypingIndicator();
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  async processMessage(message) {
    const lower = message.toLowerCase();
    
    // Submit message to agentic engine for analysis
    if (this.engine?.agent) {
      this.engine.agent.submitGoal(
        `Process chat message: ${message}`,
        'medium',
        {
          type: 'chat',
          message,
          sessionId: this.state.userSession.sessionId,
          context: 'unified-chat'
        }
      );
    }

    // Order processing
    if (this.isOrderMessage(message)) {
      return await this.processOrderMessage(message);
    }

    // Order tracking
    if (lower.includes('track') || lower.includes('status') || lower.includes('where is my order')) {
      return await this.processOrderTracking(message);
    }

    // Menu inquiries
    if (lower.includes('menu') || lower.includes('what do you have') || lower.includes('show me')) {
      return await this.processMenuInquiry(message);
    }

    // Help and support
    if (lower.includes('help') || lower.includes('support') || lower.includes('question')) {
      return await this.processHelpRequest(message);
    }

    // Task management (for shop staff)
    if (lower.includes('task') || lower.includes('todo') || lower.includes('reminder')) {
      return await this.processTaskMessage(message);
    }

    // Payment and checkout
    if (lower.includes('pay') || lower.includes('checkout') || lower.includes('buy')) {
      return await this.processPaymentMessage(message);
    }

    // Default response
    return this.generateDefaultResponse(message);
  }

  isOrderMessage(message) {
    const orderKeywords = [
      'order', 'want', 'need', 'get', 'buy', 'purchase',
      'add', 'cart', 'cake', 'mooncake', 'pastry'
    ];
    
    const lower = message.toLowerCase();
    return orderKeywords.some(keyword => lower.includes(keyword)) &&
           /\d/.test(message); // Contains numbers for quantity
  }

  async processOrderMessage(message) {
    // Parse order using natural language
    const order = this.parseOrder(message);
    
    if (!order.items.length) {
      return {
        text: "I couldn't understand your order. Could you specify what you'd like? For example: 'I want 2 chocolate cakes'",
        actions: [
          { text: 'Show Menu', action: 'show_menu' },
          { text: 'Start Over', action: 'clear_order' }
        ]
      };
    }

    // Add to cart
    order.items.forEach(item => {
      this.state.userSession.cart.push(item);
    });

    // Submit order goal to engine
    if (this.engine?.agent) {
      this.engine.agent.submitGoal(
        `Process customer order: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
        'high',
        {
          type: 'order',
          items: order.items,
          total: order.total,
          sessionId: this.state.userSession.sessionId
        }
      );
    }

    // Generate response
    return {
      text: `Perfect! I've added ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')} to your cart. Total: $${order.total.toFixed(2)}. Would you like to checkout or add more items?`,
      actions: [
        { text: 'Checkout', action: 'checkout' },
        { text: 'Add More', action: 'continue_shopping' },
        { text: 'View Cart', action: 'view_cart' }
      ]
    };
  }

  parseOrder(message) {
    const items = [];
    const cakes = [
      { name: 'Black Sesame Mooncake', price: 18, keywords: ['black sesame', 'sesame', 'mooncake'] },
      { name: 'Pandan Custard Mooncake', price: 12, keywords: ['pandan', 'custard', 'green'] },
      { name: 'Traditional Red Bean', price: 22, keywords: ['red bean', 'traditional', 'red'] },
      { name: 'Taro Coconut Delight', price: 16, keywords: ['taro', 'coconut', 'purple'] },
      { name: 'Salted Egg Yolk Lava', price: 28, keywords: ['salted egg', 'egg', 'lava', 'yellow'] },
      { name: 'Heritage Bakery Set', price: 65, keywords: ['heritage', 'set', 'gift', 'box'] }
    ];

    // Extract quantities and items
    const words = message.toLowerCase().split(/\s+/);
    
    cakes.forEach(cake => {
      const quantity = this.extractQuantity(words, cake.keywords);
      if (quantity > 0) {
        items.push({
          name: cake.name,
          price: cake.price,
          quantity: quantity
        });
      }
    });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return { items, total };
  }

  extractQuantity(words, keywords) {
    // Look for numbers before or after keywords
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check if current word is a keyword
      if (keywords.some(keyword => word.includes(keyword))) {
        // Check previous word for quantity
        if (i > 0 && /^\d+$/.test(words[i - 1])) {
          return parseInt(words[i - 1]);
        }
        // Check next word for quantity
        if (i < words.length - 1 && /^\d+$/.test(words[i + 1])) {
          return parseInt(words[i + 1]);
        }
        // Default to 1 if keyword found
        return 1;
      }
    }
    return 0;
  }

  async processOrderTracking(message) {
    const orders = this.state.userSession.orders;
    
    if (orders.length === 0) {
      return {
        text: "You don't have any orders yet. Would you like to place an order?",
        actions: [
          { text: 'Place Order', action: 'start_order' },
          { text: 'View Menu', action: 'show_menu' }
        ]
      };
    }

    const latestOrder = orders[orders.length - 1];
    
    return {
      text: `Your latest order (#${latestOrder.id}) is ${latestOrder.status}. Estimated delivery: ${latestOrder.estimatedDelivery || '30 minutes'}. Total: $${latestOrder.total.toFixed(2)}`,
      actions: [
        { text: 'Order Details', action: 'order_details' },
        { text: 'Track Delivery', action: 'track_delivery' },
        { text: 'Contact Support', action: 'contact_support' }
      ]
    };
  }

  async processMenuInquiry(message) {
    return {
      text: "Here's our menu!\n\n• Black Sesame Mooncake - $18\n• Pandan Custard Mooncake - $12\n• Traditional Red Bean - $22\n• Taro Coconut Delight - $16\n• Salted Egg Yolk Lava - $28\n• Heritage Bakery Set - $65\n\nWhat would you like to order?",
      actions: [
        { text: 'Order Bestseller', action: 'order_bestseller' },
        { text: 'Order Gluten-Free', action: 'order_glutenfree' },
        { text: 'View Full Menu', action: 'full_menu' }
      ]
    };
  }

  async processHelpRequest(message) {
    return {
      text: "I'm here to help! I can assist you with:\n\nPlacing orders (just say what you want)\nTracking order status\nMenu information\nPayment and checkout\nDelivery scheduling\n\nHow can I help you today?",
      actions: [
        { text: 'Place Order', action: 'start_order' },
        { text: 'Track Order', action: 'track_order' },
        { text: 'Contact Human', action: 'contact_human' }
      ]
    };
  }

  async processTaskMessage(message) {
    // For shop staff - task management
    return {
      text: "Task management feature detected. Current tasks:\n\n[x] Bake 20 Black Sesame Mooncakes\n[ ] Prepare 5 gift boxes\n[ ] Call customer about order #1234\n\nWould you like to add a new task?",
      actions: [
        { text: 'Add Task', action: 'add_task' },
        { text: 'View All Tasks', action: 'view_tasks' },
        { text: 'Complete Task', action: 'complete_task' }
      ]
    };
  }

  async processPaymentMessage(message) {
    const cart = this.state.userSession.cart;
    
    if (cart.length === 0) {
      return {
        text: "Your cart is empty! Add some items first.",
        actions: [
          { text: 'View Menu', action: 'show_menu' },
          { text: 'Start Shopping', action: 'start_shopping' }
        ]
      };
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      text: `Ready to checkout? Your total is $${total.toFixed(2)}.\n\nPayment options:\n• Credit/Debit Card\n• PromptPay (Thai)\n• Cash on Delivery\n\nHow would you like to pay?`,
      actions: [
        { text: 'Pay with Card', action: 'pay_card' },
        { text: 'PromptPay', action: 'pay_promptpay' },
        { text: 'Cash on Delivery', action: 'pay_cod' }
      ]
    };
  }

  generateDefaultResponse(message) {
    const suggestions = [
      "I can help you order cakes! Try saying 'I want 2 chocolate cakes'",
      "Need to track an order? Just ask 'Where is my order?'",
      "Want to see our menu? Just ask 'What do you have?'"
    ];

    return {
      text: `I'm not sure how to help with "${message}". ${suggestions[Math.floor(Math.random() * suggestions.length)]}`,
      actions: [
        { text: 'Place Order', action: 'start_order' },
        { text: 'Track Order', action: 'track_order' },
        { text: 'Get Help', action: 'get_help' }
      ]
    };
  }

  // ========== UI METHODS ==========
  
  toggleChat() {
    this.state.isOpen = !this.state.isOpen;
    
    if (this.state.isOpen) {
      this.elements.window.classList.add('open');
      this.elements.bubble.classList.remove('pulse');
      this.elements.input.focus();
      this.clearBadge();
    } else {
      this.elements.window.classList.remove('open');
    }
  }

  minimizeChat() {
    this.elements.window.classList.remove('open');
    this.state.isOpen = false;
  }

  closeChat() {
    this.elements.window.classList.remove('open');
    this.elements.container.style.display = 'none';
    this.state.isOpen = false;
  }

  addMessage(type, text, actions = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let actionsHTML = '';
    if (actions.length > 0) {
      actionsHTML = `
        <div class="message-actions">
          ${actions.map(action => 
            `<button class="action-btn" data-action="${action.action}">${action.text}</button>`
          ).join('')}
        </div>
      `;
    }
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">${text}</div>
        ${actionsHTML}
      </div>
      <div class="message-time">${time}</div>
    `;
    
    this.elements.messages.appendChild(messageDiv);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    
    // Add action listeners
    messageDiv.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.executeAction(btn.dataset.action);
      });
    });
    
    // Store message
    this.state.messages.push({ type, text, actions, timestamp: Date.now() });
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    
    this.elements.messages.appendChild(typingDiv);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.addMessage('assistant', 
        "Welcome to Sweet Layers!\n\n**Today's Specials:**\n• Black Sesame Mooncake - $18 (Bestseller!)\n• Taro Coconut Cake - $15\n• Free delivery on orders $50+\n\nI can help you:\n- Place an order in seconds\n- Track your delivery\n- Get personalized recommendations\n\nWhat would you like today?",
        [
          { text: 'Shop Now', action: 'start_order' },
          { text: 'Bestsellers', action: 'show_bestsellers' },
          { text: 'Gift Ideas', action: 'show_gifts' }
        ]
      );
    }, 1000);
  }

  updateConnectionStatus(status) {
    this.elements.status.textContent = status;
  }

  showSuggestions(input) {
    if (input.length < 2) {
      this.hideSuggestions();
      return;
    }

    const suggestions = this.generateSuggestions(input);
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.elements.suggestions.innerHTML = suggestions
      .map(suggestion => `<div class="suggestion-item">${suggestion}</div>`)
      .join('');

    this.elements.suggestions.style.display = 'block';

    // Add click handlers
    this.elements.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        this.elements.input.value = item.textContent;
        this.hideSuggestions();
        this.elements.input.focus();
      });
    });
  }

  hideSuggestions() {
    this.elements.suggestions.style.display = 'none';
    this.elements.suggestions.innerHTML = '';
  }

  generateSuggestions(input) {
    const lower = input.toLowerCase();
    const suggestions = [];

    if (lower.includes('order') || lower.includes('want')) {
      suggestions.push('I want 2 chocolate cakes');
      suggestions.push('Order 1 black sesame mooncake');
    }

    if (lower.includes('track')) {
      suggestions.push('Where is my order?');
      suggestions.push('Track my delivery');
    }

    if (lower.includes('help')) {
      suggestions.push('I need help with my order');
      suggestions.push('Contact customer service');
    }

    return suggestions;
  }

  // ========== ACTION HANDLERS ==========
  
  handleQuickAction(action) {
    this.executeAction(action);
  }

  executeAction(action) {
    switch (action) {
      case 'start_order':
        this.elements.input.value = 'I want to order';
        this.elements.input.focus();
        break;
      case 'show_menu':
        this.processMenuInquiry('show menu').then(response => {
          this.addMessage('assistant', response.text, response.actions);
        });
        break;
      case 'track_order':
        this.processOrderTracking('track my order').then(response => {
          this.addMessage('assistant', response.text, response.actions);
        });
        break;
      case 'checkout':
        this.processPaymentMessage('checkout').then(response => {
          this.addMessage('assistant', response.text, response.actions);
        });
        break;
      case 'view_cart':
        this.showCart();
        break;
      case 'clear_order':
        this.state.userSession.cart = [];
        this.addMessage('assistant', 'Cart cleared! Ready to start a new order.');
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  executeActions(actions) {
    // Execute multiple actions from agent
    actions.forEach(action => {
      this.executeAction(action.action);
    });
  }

  handleAgentAction(action) {
    // Handle actions from agentic engine
    switch (action.type) {
      case 'show_message':
        this.addMessage('assistant', action.message, action.actions);
        break;
      case 'update_order_status':
        this.updateOrderStatus(action.orderId, action.status);
        break;
      case 'show_notification':
        this.showNotification(action.title, action.message);
        break;
    }
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'order:update':
        this.handleOrderUpdate(message.data);
        break;
      case 'task:assigned':
        this.handleTaskAssignment(message.data);
        break;
      case 'notification':
        this.showNotification(message.title, message.message);
        break;
    }
  }

  showCart() {
    const cart = this.state.userSession.cart;
    
    if (cart.length === 0) {
      this.addMessage('assistant', 'Your cart is empty!');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartText = cart.map(item => 
      `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    this.addMessage('assistant', 
      `Your cart:\n\n${cartText}\n\nTotal: $${total.toFixed(2)}`,
      [
        { text: 'Checkout', action: 'checkout' },
        { text: 'Clear Cart', action: 'clear_order' }
      ]
    );
  }

  showNotification(title, message) {
    // Update badge
    this.incrementBadge();
    
    // Show toast notification
    if (window.showToast) {
      showToast(`${title}: ${message}`);
    }
  }

  incrementBadge() {
    const current = parseInt(this.elements.badge.textContent) || 0;
    this.elements.badge.textContent = current + 1;
    this.elements.badge.style.display = 'flex';
  }

  clearBadge() {
    this.elements.badge.textContent = '0';
    this.elements.badge.style.display = 'none';
  }

  // ========== STYLES ==========
  
  addChatStyles() {
    const styles = `
      .unified-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: 'Inter', -apple-system, sans-serif;
      }

      .chat-bubble {
        width: 60px;
        height: 60px;
        background: var(--primary, #2A6B52);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        position: relative;
      }

      .chat-bubble:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }

      .bubble-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bubble-icon img {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .bubble-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: var(--accent, #C4A647);
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 10px;
        display: none;
        min-width: 18px;
        text-align: center;
      }

      .pulse-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid var(--primary, #2A6B52);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.3); opacity: 0; }
      }

      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      .chat-window.open {
        display: flex;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .chat-header {
        background: var(--primary, #2A6B52);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-title {
        font-weight: 600;
        font-size: 16px;
      }

      .header-status {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .header-btn {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
      }

      .header-btn:hover {
        background: rgba(255,255,255,0.2);
      }

      .chat-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chat-message {
        max-width: 80%;
        word-wrap: break-word;
      }

      .chat-message.user {
        align-self: flex-end;
      }

      .chat-message.user .message-content {
        background: var(--primary, #2A6B52);
        color: white;
        border-radius: 18px 18px 4px 18px;
      }

      .chat-message.assistant {
        align-self: flex-start;
      }

      .chat-message.assistant .message-content {
        background: var(--gray-100, #F5EDE4);
        color: var(--brown, #3D2E22);
        border-radius: 18px 18px 18px 4px;
      }

      .message-content {
        padding: 12px 16px;
        margin-bottom: 4px;
      }

      .message-time {
        font-size: 11px;
        color: var(--gray-500, #9A7D6A);
        padding: 0 16px;
      }

      .chat-message.user .message-time {
        text-align: right;
      }

      .message-actions {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .action-btn {
        background: white;
        border: 1px solid var(--gray-300, #D4C4B5);
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .chat-message.user .action-btn {
        background: rgba(255,255,255,0.2);
        border-color: rgba(255,255,255,0.3);
        color: white;
      }

      .action-btn:hover {
        background: var(--accent, #C4A647);
        color: white;
        border-color: var(--accent, #C4A647);
      }

      .typing-dots {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .typing-dots span {
        width: 8px;
        height: 8px;
        background: var(--gray-400, #B8A08A);
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }

      .quick-actions {
        padding: 12px 16px;
        border-top: 1px solid var(--gray-200, #E8DCD0);
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .quick-btn {
        background: var(--gray-100, #F5EDE4);
        border: 1px solid var(--gray-300, #D4C4B5);
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .quick-btn:hover {
        background: var(--primary, #2A6B52);
        color: white;
        border-color: var(--primary, #2A6B52);
      }

      .chat-input-area {
        padding: 16px;
        border-top: 1px solid var(--gray-200, #E8DCD0);
      }

      .input-container {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      #chatInput {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--gray-300, #D4C4B5);
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
      }

      #chatInput:focus {
        border-color: var(--primary, #2A6B52);
      }

      .send-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: var(--primary, #2A6B52);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }

      .send-btn:hover {
        background: var(--primary-dark, #1F4A3A);
      }

      .input-suggestions {
        position: absolute;
        bottom: 100%;
        left: 16px;
        right: 16px;
        background: white;
        border: 1px solid var(--gray-300, #D4C4B5);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: none;
        z-index: 1;
      }

      .suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid var(--gray-200, #E8DCD0);
      }

      .suggestion-item:last-child {
        border-bottom: none;
      }

      .suggestion-item:hover {
        background: var(--gray-100, #F5EDE4);
      }

      @media (max-width: 480px) {
        .unified-chat-widget {
          bottom: 10px;
          right: 10px;
          left: 10px;
        }

        .chat-window {
          width: 100%;
          height: 70vh;
          bottom: 70px;
        }

        .quick-actions {
          flex-wrap: nowrap;
          overflow-x: auto;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // ========== PUBLIC API ==========
  
  destroy() {
    if (this.ws) this.ws.close();
    if (this.engine) this.engine.destroy();
    this.elements.container.remove();
  }

  showMessage(text) {
    this.addMessage('assistant', text);
    if (!this.state.isOpen) {
      this.incrementBadge();
    }
  }

  setTheme(theme) {
    this.elements.container.setAttribute('data-theme', theme);
  }
}

// Export for global use
window.UnifiedChatWidget = UnifiedChatWidget;
