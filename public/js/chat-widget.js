/**
 * Chat Widget Controller
 * Handles UI interactions, message routing, and API communication
 */

const ChatWidget = (() => {
  // DOM elements - will be initialized in init()
  let elements = {};

  // Configuration
  const config = {
    apiEndpoint: 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/chat/process',
    maxRetries: 3,
    retryDelay: 1000,
    errorDisplayDuration: 4000,
    typingDelay: 300,
    demoMode: false,
  };

  // Chat history for API context
  let chatHistory = [
    {
      role: 'system',
      content: `You are a warm, friendly sales agent for "SweetLayerz" — an artisan bakery specializing in traditional Asian pastries, mooncakes, and heritage cakes. Your job is to help customers find the perfect pastry for their needs.

PRODUCT CATALOG:
- Traditional Mooncakes: Lotus paste, red bean, mung bean with salted egg yolk (from $8 each, boxes of 4/6/8)
- Pastry Arrangement Boxes: Curated gift boxes with assorted pastries (from $28 small, $45 large)
- Layer Cakes: Pandan custard, black sesame, taro coconut (from $28-$35, serves 6-8)
- Individual Pastries: Salted egg lava pastry ($6), red bean delight ($5), mung bean pastry ($5)
- Seasonal: Limited edition flavors during Mid-Autumn, Lunar New Year
- Gift Wrapping: Premium gift boxes and ribbon available (+$5)
- Delivery: Same-day for orders before 12pm, next-day standard

YOUR ROLE:
- Be warm, enthusiastic, and helpful — like a friendly bakery assistant
- Ask about the occasion, number of guests, flavor preferences, and dietary restrictions
- Recommend products based on their needs (e.g., mooncakes for gifting, layer cakes for celebrations)
- Mention current promotions when relevant (e.g., "10% off first order!")
- Offer to help with gift wrapping and corporate orders
- Keep responses concise and conversational (2-4 sentences)
- Use occasional emojis to keep it fun (เค้ก ใบไม้ แสง)

IMPORTANT: Stay in character as the SweetLayerz pastry sales agent at all times. If asked something unrelated, gently redirect to how SweetLayerz pastries can make their occasion special.`,
    },
    {
      role: 'assistant',
      content: "Welcome to SweetLayerz! เค้ก I'd love to help you find the perfect pastry. What are you looking for today?",
    },
  ];

  /**
   * Initialize the chat widget
   */
  function init() {
    console.log('[ChatWidget] Starting initialization...');
    
    // Initialize DOM elements
    elements = {
      trigger: document.getElementById('chat-trigger'),
      mask: document.getElementById('chat-mask'),
      widget: document.getElementById('chat-widget'),
      close: document.getElementById('chat-close'),
      messages: document.getElementById('chat-messages'),
      input: document.getElementById('user-input'),
      sendBtn: document.getElementById('send-button'),
      typing: document.getElementById('typing-indicator'),
      errorToast: document.getElementById('error-toast'),
      badge: document.getElementById('notification-badge'),
      search: document.getElementById('chat-search'),
      searchClear: document.getElementById('chat-search-clear'),
      searchResults: document.getElementById('search-results'),
      searchContainer: document.getElementById('chat-search-container'),
    };

    console.log('[ChatWidget] Elements found:', {
      trigger: !!elements.trigger,
      mask: !!elements.mask,
      widget: !!elements.widget,
      close: !!elements.close,
      messages: !!elements.messages,
      input: !!elements.input,
      sendBtn: !!elements.sendBtn
    });

    // Verify all required elements exist
    if (!elements.trigger || !elements.mask || !elements.widget) {
      console.error('[ChatWidget] Required DOM elements not found');
      return;
    }

    bindEvents();
    setupStateListeners();
    setupKeyboardShortcuts();
    console.log('[ChatWidget] Initialized successfully');
  }

  /**
   * Bind DOM event handlers
   */
  function bindEvents() {
    // Trigger button - toggle widget open/close
    elements.trigger.addEventListener('click', handleTriggerClick);

    // Close button
    elements.close.addEventListener('click', handleCloseClick);

    // Mask backdrop click - close widget
    elements.mask.addEventListener('click', handleMaskClick);

    // Widget click - prevent propagation (don't close on widget click)
    elements.widget.addEventListener('click', (e) => e.stopPropagation());

    // Send button
    elements.sendBtn.addEventListener('click', handleSendClick);

    // Input events
    elements.input.addEventListener('input', handleInputChange);
    elements.input.addEventListener('keydown', handleInputKeydown);

    // Snack filter buttons
    document.querySelectorAll('.snack-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = btn.getAttribute('data-msg');
        if (msg) {
          elements.input.value = msg;
          sendMessage();
          // Hide snack filter after first selection
          const filter = document.getElementById('snack-filter');
          if (filter) filter.style.display = 'none';
        }
      });
    });

    // Prevent body scroll when widget is open on mobile
    elements.mask.addEventListener('touchmove', (e) => {
      if (e.target === elements.mask) {
        e.preventDefault();
      }
    }, { passive: false });

    // Search input with debounce
    let searchDebounce = null;
    elements.search.addEventListener('input', () => {
      const query = elements.search.value;
      elements.searchClear.style.display = query ? 'flex' : 'none';
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => performSearch(query), 150);
    });

    // Search clear button
    elements.searchClear.addEventListener('click', () => {
      elements.search.value = '';
      elements.searchClear.style.display = 'none';
      elements.searchResults.innerHTML = '';
      elements.searchResults.classList.remove('visible');
      const quickTags = document.getElementById('quick-search-tags');
      if (quickTags) quickTags.style.display = 'flex';
      elements.search.focus();
    });

    // Search on Enter - send query as message
    elements.search.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = elements.search.value.trim();
        if (query) {
          elements.input.value = `Tell me about ${query}`;
          sendMessage();
          elements.search.value = '';
          elements.searchClear.style.display = 'none';
          elements.searchResults.innerHTML = '';
          elements.searchResults.classList.remove('visible');
          const quickTags = document.getElementById('quick-search-tags');
          if (quickTags) quickTags.style.display = 'flex';
        }
      }
      if (e.key === 'Escape') {
        elements.search.value = '';
        elements.searchClear.style.display = 'none';
        elements.searchResults.innerHTML = '';
        elements.searchResults.classList.remove('visible');
        const quickTags = document.getElementById('quick-search-tags');
        if (quickTags) quickTags.style.display = 'flex';
        elements.input.focus();
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.searchContainer.contains(e.target)) {
        elements.searchResults.classList.remove('visible');
      }
    });

    // Show search results on focus if there are results
    elements.search.addEventListener('focus', () => {
      if (elements.searchResults.innerHTML) {
        elements.searchResults.classList.add('visible');
      }
    });

    // Quick search tags
    document.querySelectorAll('.quick-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-query');
        elements.search.value = query;
        elements.searchClear.style.display = 'flex';
        performSearch(query);
        elements.search.focus();
      });
    });
  }

  /**
   * Focus trap handler for chat dialog
   */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = elements.widget.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /**
   * Setup state change listeners
   */
  function setupStateListeners() {
    // Toggle open/close visual state
    ChatState.on('isOpenChange', ({ value }) => {
      elements.trigger.classList.toggle('active', value);
      elements.mask.classList.toggle('open', value);
      elements.trigger.setAttribute('aria-expanded', value);
      document.body.style.overflow = value ? 'hidden' : '';

      if (value) {
        // Focus input when opening
        setTimeout(() => elements.input.focus(), 300);
        // Hide notification badge
        elements.badge.classList.remove('visible');
        // Enable focus trap
        elements.widget.addEventListener('keydown', trapFocus);
      } else {
        // Remove focus trap
        elements.widget.removeEventListener('keydown', trapFocus);
      }
    });

    // Toggle processing state
    ChatState.on('isProcessingChange', ({ value }) => {
      elements.input.disabled = value;
      elements.sendBtn.disabled = value;
      elements.typing.classList.toggle('visible', value);

      if (!value) {
        elements.input.focus();
      }
    });

    // Show/hide error toast
    ChatState.on('errorChange', ({ value }) => {
      if (value) {
        showError(value);
      } else {
        hideError();
      }
    });

    // Update notification badge
    ChatState.on('unreadCountChange', ({ value }) => {
      if (value > 0) {
        elements.badge.textContent = value > 9 ? '9+' : value;
        elements.badge.classList.add('visible');
      } else {
        elements.badge.classList.remove('visible');
      }
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape to close widget
      if (e.key === 'Escape' && ChatState.getState().isOpen) {
        ChatState.close();
      }
    });
  }

  /**
   * Event Handlers
   */
  function handleTriggerClick() {
    console.log('[ChatWidget] Trigger clicked, toggling chat...');
    ChatState.toggle();
  }

  function handleCloseClick() {
    ChatState.close();
  }

  function handleMaskClick(e) {
    if (e.target === elements.mask) {
      ChatState.close();
    }
  }

  function handleSendClick() {
    sendMessage();
  }

  function handleInputChange() {
    // Auto-resize textarea
    elements.input.style.height = 'auto';
    elements.input.style.height = Math.min(elements.input.scrollHeight, 120) + 'px';
  }

  function handleInputKeydown(e) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /**
   * Perform real-time product search
   */
  function performSearch(query) {
    const quickTags = document.getElementById('quick-search-tags');
    if (!query || query.trim().length < 2) {
      elements.searchResults.innerHTML = '';
      elements.searchResults.classList.remove('visible');
      if (quickTags) quickTags.style.display = 'flex';
      return;
    }

    if (quickTags) quickTags.style.display = 'none';
    const results = ChatState.searchProducts(query);
    renderSearchResults(results, query);
  }

  /**
   * Render search results as clickable product cards
   */
  function renderSearchResults(results, query) {
    if (results.length === 0) {
      elements.searchResults.innerHTML = `
        <div class="search-no-results">
          <span>No pastries found for "${escapeHtml(query)}"</span>
          <button class="search-ask-btn" onclick="ChatWidget.askAbout('${escapeHtml(query)}')">Ask our assistant →</button>
        </div>`;
      elements.searchResults.classList.add('visible');
      return;
    }

    elements.searchResults.innerHTML = results.map(product => `
      <button class="search-result-card" data-product-id="${product.id}" data-product-name="${escapeHtml(product.name)}">
        <img src="${product.img}" alt="${escapeHtml(product.name)}" class="search-result-img" loading="lazy">
        <div class="search-result-info">
          <span class="search-result-cat">${escapeHtml(product.category)}</span>
          <span class="search-result-name">${highlightMatch(product.name, query)}</span>
          <span class="search-result-desc">${escapeHtml(product.desc)}</span>
          <span class="search-result-price">${escapeHtml(product.price)}</span>
        </div>
      </button>
    `).join('');

    // Bind click handlers for result cards
    elements.searchResults.querySelectorAll('.search-result-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.getAttribute('data-product-name');
        elements.input.value = `I'd like to know more about ${name}`;
        sendMessage();
        elements.search.value = '';
        elements.searchClear.style.display = 'none';
        elements.searchResults.innerHTML = '';
        elements.searchResults.classList.remove('visible');
      });
    });

    elements.searchResults.classList.add('visible');
  }

  /**
   * Highlight matching text in search results
   */
  function highlightMatch(text, query) {
    const words = query.toLowerCase().trim().split(/\s+/);
    let result = escapeHtml(text);
    for (const word of words) {
      if (word.length < 2) continue;
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
  }

  /**
   * Public method to ask about a topic (used by search no-results)
   */
  function askAbout(topic) {
    elements.input.value = `Tell me about ${topic}`;
    sendMessage();
    elements.search.value = '';
    elements.searchClear.style.display = 'none';
    elements.searchResults.innerHTML = '';
    elements.searchResults.classList.remove('visible');
  }

  /**
   * Add product recommendation cards to the last assistant message
   */
  function addProductCardsToLastMessage(productIds) {
    const products = ChatState.getAllProducts();
    const matched = productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    if (matched.length === 0) return;

    const lastMsg = elements.messages.querySelector('.assistant-message:last-of-type');
    if (!lastMsg) return;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'product-cards';

    matched.forEach(product => {
      const card = document.createElement('button');
      card.className = 'product-card-msg';
      card.innerHTML = `
        <img src="${product.img}" alt="${escapeHtml(product.name)}" class="product-card-msg-img" loading="lazy">
        <div class="product-card-msg-info">
          <span class="product-card-msg-name">${escapeHtml(product.name)}</span>
          <span class="product-card-msg-price">${escapeHtml(product.price)}</span>
        </div>
        <span class="product-card-msg-action">View →</span>
      `;
      card.addEventListener('click', () => {
        // Add to cart and redirect to checkout
        addToCart(product);
        elements.input.value = `I'd like to order ${product.name}`;
        sendMessage();
        
        // Show toast notification
        showToast(`${product.name} added to cart!`);
      });
      cardsContainer.appendChild(card);
    });

    lastMsg.appendChild(cardsContainer);
    scrollToBottom();
  }

  /**
   * Send a message to the AI
   */
  async function sendMessage() {
    const message = elements.input.value.trim();
    const { isProcessing } = ChatState.getState();

    // Validation
    if (!message || isProcessing) return;

    // Clear input and reset height
    elements.input.value = '';
    elements.input.style.height = 'auto';

    // Add user message to UI and state
    addMessageToUI('user', message);
    ChatState.addMessage('user', message);
    chatHistory.push({ role: 'user', content: message });

    // Set processing state
    ChatState.setProcessing(true);
    ChatState.setError(null);

    // Create assistant message placeholder
    const assistantEl = createMessageElement('assistant');
    elements.messages.appendChild(assistantEl);
    const textEl = assistantEl.querySelector('p');
    scrollToBottom();

    let retries = 0;
    let success = false;

    while (retries <= config.maxRetries && !success) {
      try {
        if (retries > 0) {
          textEl.textContent = `Retrying... (${retries}/${config.maxRetries})`;
          await delay(config.retryDelay * retries);
        }

        await streamResponse(textEl);
        success = true;
      } catch (error) {
        console.error(`[ChatWidget] Send error (attempt ${retries + 1}):`, error);
        retries++;

        if (retries > config.maxRetries) {
          textEl.textContent = 'Sorry, I encountered an error. Please try again.';
          ChatState.setError(error.message || 'Failed to get response');
          ChatState.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
          chatHistory.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
        }
      }
    }

    // Save final response to history
    const finalContent = textEl.textContent;
    if (finalContent && success) {
      const lastHistoryItem = chatHistory[chatHistory.length - 1];
      if (lastHistoryItem?.role !== 'assistant' || lastHistoryItem.content !== finalContent) {
        chatHistory.push({ role: 'assistant', content: finalContent });
        ChatState.addMessage('assistant', finalContent);
      }

      // Auto-show relevant product cards based on user's message
      const relevantProducts = ChatState.searchProducts(message);
      if (relevantProducts.length > 0) {
        addProductCardsToLastMessage(relevantProducts.map(p => p.id));
      }
    }

    ChatState.setProcessing(false);
  }

  /**
   * Demo responses for static hosting
   */
  const demoResponses = [
    "That's a great question! As an AI assistant powered by Cloudflare Workers AI, I can help you with a wide variety of tasks including answering questions, writing content, brainstorming ideas, and more.",
    "I'd be happy to help with that. Let me think about the best approach for you. Feel free to ask me anything, and I'll do my best to provide helpful and accurate information.",
    "Interesting! I can certainly assist with that. This chat widget demonstrates smooth message routing, state management, and responsive design patterns. What else would you like to know?",
    "Thanks for your message! This widget overlay showcases proper event handling with a centralized state management approach. The mask component provides an elegant backdrop for the chat interface.",
    "I appreciate you reaching out! This chat application demonstrates modern frontend patterns including streaming responses, error handling with retry logic, and accessible keyboard navigation.",
  ];

  function getDemoResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hello! Welcome to the AI Chat Widget demo. I'm here to help you explore the features of this chat overlay component. Feel free to ask me anything!";
    }
    if (lower.includes('help') || lower.includes('what can you')) {
      return "I can help you understand this chat widget's architecture! It features: a floating trigger button, animated overlay mask, centralized state management, streaming message responses, error handling with auto-retry, responsive design for mobile and desktop, and keyboard accessibility (Escape to close, Enter to send).";
    }
    if (lower.includes('feature') || lower.includes('what')) {
      return "This chat widget includes several key features: smooth CSS transitions for the overlay mask, event-driven state management, auto-resizing text input, typing indicators, notification badges, and graceful error recovery. It's fully responsive and works great on mobile!";
    }
    if (lower.includes('how') && lower.includes('work')) {
      return "The widget works by routing all messages through a centralized state manager (ChatState). When you send a message, it flows through: input validation, state update, UI rendering, API call (or demo response), and finally state persistence. The overlay mask uses CSS transitions for smooth animations.";
    }
    if (lower.includes('thank')) {
      return "You're welcome! This chat widget demo showcases best practices in frontend development including separation of concerns, accessible design, and smooth user interactions. Enjoy exploring!";
    }
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
  }

  /**
   * Simulate streaming response for demo mode
   */
  async function simulateStreamingResponse(textEl, fullText) {
    const words = fullText.split(' ');
    let responseText = '';

    for (let i = 0; i < words.length; i++) {
      responseText += (i === 0 ? '' : ' ') + words[i];
      textEl.textContent = responseText;
      scrollToBottom();
      await delay(30 + Math.random() * 40);
    }

    return fullText;
  }

  /**
   * Stream the AI response
   */
  async function streamResponse(textEl) {
    // Demo mode - simulate AI response
    if (config.demoMode) {
      const userMessage = chatHistory[chatHistory.length - 1]?.content || '';
      const demoResponse = getDemoResponse(userMessage);
      await delay(500 + Math.random() * 500); // Simulate thinking delay
      return await simulateStreamingResponse(textEl, demoResponse);
    }

    // Production mode - call real API
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process remaining buffer
        const parsed = consumeSseEvents(buffer + '\n\n');
        for (const data of parsed.events) {
          if (data === '[DONE]') break;
          const content = extractContent(data);
          if (content) {
            responseText += content;
            textEl.textContent = responseText;
            scrollToBottom();
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parsed = consumeSseEvents(buffer);
      buffer = parsed.buffer;

      for (const data of parsed.events) {
        if (data === '[DONE]') {
          buffer = '';
          break;
        }
        const content = extractContent(data);
        if (content) {
          responseText += content;
          textEl.textContent = responseText;
          scrollToBottom();
        }
      }
    }

    return responseText;
  }

  /**
   * Extract content from SSE data (supports Workers AI and OpenAI formats)
   */
  function extractContent(data) {
    try {
      const json = JSON.parse(data);

      // Workers AI format
      if (typeof json.response === 'string' && json.response.length > 0) {
        return json.response;
      }

      // OpenAI format
      if (json.choices?.[0]?.delta?.content) {
        return json.choices[0].delta.content;
      }

      return '';
    } catch (e) {
      console.error('[ChatWidget] SSE parse error:', e, data);
      return '';
    }
  }

  /**
   * Parse SSE events from buffer
   */
  function consumeSseEvents(buffer) {
    const normalized = buffer.replace(/\r/g, '');
    const events = [];
    let remaining = normalized;
    let eventEndIndex;

    while ((eventEndIndex = remaining.indexOf('\n\n')) !== -1) {
      const rawEvent = remaining.slice(0, eventEndIndex);
      remaining = remaining.slice(eventEndIndex + 2);

      const lines = rawEvent.split('\n');
      const dataLines = [];

      for (const line of lines) {
        if (line.startsWith('data:')) {
          dataLines.push(line.slice('data:'.length).trimStart());
        }
      }

      if (dataLines.length > 0) {
        events.push(dataLines.join('\n'));
      }
    }

    return { events, buffer: remaining };
  }

  /**
   * UI Helpers
   */
  function addMessageToUI(role, content) {
    const el = createMessageElement(role, content);
    elements.messages.appendChild(el);
    scrollToBottom();
  }

  function createMessageElement(role, content = '') {
    const el = document.createElement('div');
    el.className = `message ${role}-message`;
    el.innerHTML = `<p>${escapeHtml(content)}</p>`;
    return el;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      elements.messages.scrollTop = elements.messages.scrollHeight;
    });
  }

  function showError(message) {
    elements.errorToast.textContent = message;
    elements.errorToast.classList.add('visible');

    // Auto-hide after duration
    clearTimeout(showError._timer);
    showError._timer = setTimeout(() => {
      ChatState.setError(null);
    }, config.errorDisplayDuration);
  }

  function hideError() {
    elements.errorToast.classList.remove('visible');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Add product to cart and redirect to checkout
   */
  function addToCart(product) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.img
      });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge if exists
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  /**
   * Show toast notification
   */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: var(--jade-500);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    init,
    sendMessage,
    askAbout,
    addProductCardsToLastMessage,
    open: ChatState.open,
    close: ChatState.close,
    toggle: ChatState.toggle,
    getState: ChatState.getState,
  };
})();
