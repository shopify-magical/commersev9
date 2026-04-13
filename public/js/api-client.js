/**
 * API Client for Sweet Layers Frontend-Backend Integration
 * 
 * Handles all communication between frontend and agentic engine backend
 */

class SweetLayersAPIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL || window.location.origin;
    this.token = localStorage.getItem('auth_token') || null;
    this.tenantId = localStorage.getItem('tenant_id') || 'default';
  }

  // Authentication
  async login(email, password, rememberMe = false) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe })
    });
    const data = await response.json();
    if (data.success) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('tenant_id', data.user.tenantId);
      this.tenantId = data.user.tenantId;
    }
    return data;
  }

  async verifyToken() {
    if (!this.token) return { success: false };
    const response = await fetch(`${this.baseURL}/auth/verify`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.token = null;
  }

  // Products
  async getProducts(filters = {}) {
    const params = new URLSearchParams({
      tenantId: this.tenantId,
      ...filters
    });
    const response = await fetch(`${this.baseURL}/api/products?${params}`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  async getProduct(productId) {
    const response = await fetch(`${this.baseURL}/api/products/${productId}?tenantId=${this.tenantId}`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  // Orders
  async createOrder(orderData) {
    const response = await fetch(`${this.baseURL}/triggers/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        tenantId: this.tenantId
      })
    });
    return await response.json();
  }

  async getOrderStatus(orderId) {
    const response = await fetch(`${this.baseURL}/api/orders/${orderId}?tenantId=${this.tenantId}`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  async getOrders() {
    const response = await fetch(`${this.baseURL}/api/orders?tenantId=${this.tenantId}`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  // Quotes
  async createQuote(quoteData) {
    const response = await fetch(`${this.baseURL}/triggers/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...quoteData,
        tenantId: this.tenantId
      })
    });
    return await response.json();
  }

  // Payment
  async createPromptPayPayment(amount, orderId, customer) {
    const response = await fetch(`${this.baseURL}/payment/promptpay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, orderId, customer })
    });
    return await response.json();
  }

  async getPaymentStatus(paymentId) {
    const response = await fetch(`${this.baseURL}/payment/status?paymentId=${paymentId}`);
    return await response.json();
  }

  async verifyPaymentSlip(imageBase64, paymentId, expectedAmount) {
    const response = await fetch(`${this.baseURL}/payment/verify-slip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, paymentId, expectedAmount })
    });
    return await response.json();
  }

  // Chat
  async getChatCommands() {
    const response = await fetch(`${this.baseURL}/chat/commands`);
    return await response.json();
  }

  async processChatMessage(message, sessionId) {
    const response = await fetch(`${this.baseURL}/chat/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, tenantId: this.tenantId })
    });
    return await response.json();
  }

  // Agentic Engine Integration
  async submitGoal(description, priority = 'medium', context = {}) {
    const response = await fetch(`${this.baseURL}/api/agentic/goal`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ description, priority, context })
    });
    return await response.json();
  }

  async submitObservation(type, data, timestamp = Date.now(), sessionId, userId) {
    const response = await fetch(`${this.baseURL}/api/agentic/observation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ type, data, timestamp, sessionId, userId })
    });
    return await response.json();
  }

  async validateDecision(decision, context) {
    const response = await fetch(`${this.baseURL}/api/agentic/validate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ decision, context })
    });
    return await response.json();
  }

  async getAgentMetrics() {
    const response = await fetch(`${this.baseURL}/api/agentic/metrics`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage, onInsight) {
    const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/ws`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'user:connect' }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'insight:push' && onInsight) {
        onInsight(msg.insight);
      } else if (onMessage) {
        onMessage(msg);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return ws;
  }

  // Stats
  async getStats() {
    const response = await fetch(`${this.baseURL}/stats`);
    return await response.json();
  }

  // Helper methods
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
}

// Create singleton instance
const apiClient = new SweetLayersAPIClient();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SweetLayersAPIClient;
}
