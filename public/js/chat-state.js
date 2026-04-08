/**
 * Chat Widget State Manager
 * Centralized state management with event-driven updates
 */

const ChatState = (() => {
  // Private state
  const state = {
    isOpen: false,
    isProcessing: false,
    messages: [],
    error: null,
    unreadCount: 0,
  };

  // Event listeners registry
  const listeners = new Map();

  // State change history for debugging
  const history = [];

  /**
   * Get a copy of the current state
   */
  function getState() {
    return { ...state };
  }

  /**
   * Update state and notify listeners
   */
  function setState(partialState, action = 'UPDATE') {
    const prevState = { ...state };
    const changes = {};

    for (const [key, value] of Object.entries(partialState)) {
      if (state[key] !== value) {
        changes[key] = { from: state[key], to: value };
        state[key] = value;
      }
    }

    if (Object.keys(changes).length > 0) {
      history.push({ action, changes, timestamp: Date.now() });
      emit('stateChange', { prevState, currentState: { ...state }, changes, action });

      // Emit specific change events
      for (const key of Object.keys(changes)) {
        emit(`${key}Change`, { value: state[key], prevValue: prevState[key] });
      }
    }
  }

  /**
   * Subscribe to state events
   */
  function on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an event to all listeners
   */
  function emit(event, data) {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      for (const callback of eventListeners) {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in listener for event "${event}":`, err);
        }
      }
    }
  }

  /**
   * Open the chat widget
   */
  function open() {
    if (!state.isOpen) {
      setState({ isOpen: true, unreadCount: 0 }, 'OPEN');
    }
  }

  /**
   * Close the chat widget
   */
  function close() {
    if (state.isOpen) {
      setState({ isOpen: false }, 'CLOSE');
    }
  }

  /**
   * Toggle the chat widget
   */
  function toggle() {
    if (state.isOpen) {
      close();
    } else {
      open();
    }
  }

  /**
   * Add a message to the chat
   */
  function addMessage(role, content) {
    const message = { role, content, timestamp: Date.now(), id: generateId() };
    setState({
      messages: [...state.messages, message],
    }, 'ADD_MESSAGE');
    return message;
  }

  /**
   * Update the last assistant message (for streaming)
   */
  function updateLastAssistantMessage(content) {
    const messages = [...state.messages];
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        messages[i] = { ...messages[i], content };
        break;
      }
    }
    setState({ messages }, 'UPDATE_MESSAGE');
  }

  /**
   * Set processing state
   */
  function setProcessing(isProcessing) {
    setState({ isProcessing }, isProcessing ? 'PROCESSING_START' : 'PROCESSING_END');
  }

  /**
   * Set error state
   */
  function setError(error) {
    setState({ error }, error ? 'ERROR' : 'ERROR_CLEAR');
  }

  /**
   * Increment unread count
   */
  function incrementUnread() {
    if (!state.isOpen) {
      setState({ unreadCount: state.unreadCount + 1 }, 'UNREAD_INCREMENT');
    }
  }

  /**
   * Reset state to initial values
   */
  function reset() {
    setState({
      isOpen: false,
      isProcessing: false,
      messages: [],
      error: null,
      unreadCount: 0,
    }, 'RESET');
  }

  /**
   * Generate unique message ID
   */
  function generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Get state history for debugging
   */
  function getHistory() {
    return [...history];
  }

  // Product catalog for real-time search
  const productCatalog = [
    { id: 'mooncake-traditional', name: 'Traditional Mooncakes', desc: 'Lotus paste, red bean, mung bean with salted egg yolk', price: 'From $8', tags: ['mooncake', 'classic', 'lotus', 'red bean', 'mung bean', 'traditional', 'gift'], img: 'images/mooncake-traditional.webp', category: 'Classic' },
    { id: 'pastry-arrangement', name: 'Pastry Arrangement Box', desc: 'Curated gift boxes with assorted pastries', price: 'From $45', tags: ['gift', 'box', 'arrangement', 'assorted', 'curated', 'present'], img: 'images/pastry-arrangement.webp', category: 'Signature' },
    { id: 'pandan-custard', name: 'Pandan Custard Cake', desc: 'Fragrant pandan sponge layered with silky coconut custard cream', price: 'From $32', tags: ['pandan', 'custard', 'cake', 'coconut', 'layer', 'popular'], img: 'images/pandan-custard.webp', category: 'Popular' },
    { id: 'black-sesame', name: 'Black Sesame Layer Cake', desc: 'Rich roasted sesame cream between delicate sponge layers', price: 'From $35', tags: ['sesame', 'black', 'cake', 'layer', 'roasted', 'specialty'], img: 'images/black-sesame.webp', category: 'Specialty' },
    { id: 'salted-egg', name: 'Salted Egg Lava Pastry', desc: 'Flaky crust with molten salted egg custard center', price: 'From $6', tags: ['salted', 'egg', 'lava', 'pastry', 'flaky', 'custard', 'new'], img: 'images/salted-egg.webp', category: 'New' },
    { id: 'taro-coconut', name: 'Taro Coconut Cake', desc: 'Creamy taro mousse with coconut shreds on a buttery biscuit base', price: 'From $28', tags: ['taro', 'coconut', 'cake', 'mousse', 'seasonal'], img: 'images/taro-coconut.webp', category: 'Seasonal' },
    { id: 'mung-bean', name: 'Mung Bean Pastry', desc: 'Smooth mung bean paste in a golden, flaky traditional pastry shell', price: 'From $5', tags: ['mung', 'bean', 'pastry', 'flaky', 'traditional', 'heritage'], img: 'images/mung-bean.webp', category: 'Heritage' },
    { id: 'red-bean', name: 'Red Bean Delight', desc: 'Sweet red bean paste wrapped in a soft, pillowy mochi-style shell', price: 'From $5', tags: ['red', 'bean', 'mochi', 'sweet', 'classic'], img: 'images/red-bean.webp', category: 'Classic' },
  ];

  /**
   * Search products by query string
   */
  function searchProducts(query) {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    
    return productCatalog
      .map(product => {
        let score = 0;
        const nameLower = product.name.toLowerCase();
        const descLower = product.desc.toLowerCase();
        const tagsStr = product.tags.join(' ').toLowerCase();
        const catLower = product.category.toLowerCase();

        for (const word of words) {
          if (nameLower.includes(word)) score += 10;
          if (catLower.includes(word)) score += 5;
          if (tagsStr.includes(word)) score += 3;
          if (descLower.includes(word)) score += 1;
        }
        // Exact name match bonus
        if (nameLower === q) score += 20;
        // Starts with bonus
        if (nameLower.startsWith(q)) score += 8;
        
        return { ...product, score };
      })
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  /**
   * Get all products
   */
  function getAllProducts() {
    return [...productCatalog];
  }

  // Public API
  return {
    getState,
    setState,
    on,
    open,
    close,
    toggle,
    addMessage,
    updateLastAssistantMessage,
    setProcessing,
    setError,
    incrementUnread,
    reset,
    getHistory,
    searchProducts,
    getAllProducts,
  };
})();
