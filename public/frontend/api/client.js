// API Client - Connects to Backend API
const API_BASE = 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      return { error: error.message };
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      return { error: error.message };
    }
  }

  async getProducts(category = null) {
    try {
      const url = category 
        ? `${this.baseUrl}/db/products?category=${category}`
        : `${this.baseUrl}/db/products`;
      const response = await fetch(url);
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      const response = await fetch(`${this.baseUrl}/db/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getOrders(customerId = null, status = null) {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customer_id', customerId);
      if (status) params.append('status', status);
      
      const url = `${this.baseUrl}/db/orders${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async processOCR(imageData) {
    return this.post('/ai/ocr', { imageData });
  }

  // Agent methods
  async dashboardAgent(action) {
    return this.post('/agent/dashboard', { action });
  }

  async automationAgent(action) {
    return this.post('/agent/automation', { action });
  }

  async insightsAgent(action) {
    return this.post('/agent/insights', { action });
  }

  // Chat methods
  async getChatCommands() {
    return this.get('/chat/commands');
  }

  async processChat(message, command) {
    return this.post('/chat/process', { message, command });
  }

  async getChatSessions() {
    return this.get('/chat/sessions');
  }

  // Payment methods
  async promptPayPayment(amount) {
    return this.post('/payment/promptpay', { amount });
  }

  async getPaymentStatus(paymentId) {
    return this.get(`/payment/status?id=${paymentId}`);
  }

  // Line methods
  async getLineLiff() {
    return this.get('/line/liff');
  }

  // Transform methods
  async convertData(data, format) {
    return this.post('/transform/convert', { data, format });
  }

  // Email methods
  async sendEmail(to, subject, template) {
    return this.post('/email/send', { to, subject, template });
  }

  // Admin methods
  async getAdminDashboard() {
    return this.get('/admin/dashboard');
  }

  async getAdminShops() {
    return this.get('/admin/shops');
  }
}

// Export for use in components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
