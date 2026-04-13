/**
 * Cart to Checkout Backend Integration
 * 
 * Integrates the existing cart system with the backend API
 * Handles add-to-cart, cart management, and checkout flow
 */

class CartBackendIntegration {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
    localStorage.setItem('sessionId', this.sessionId);
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add to cart with backend tracking
  async addToCart(product) {
    // Update local cart
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        image: product.image,
        category: product.category
      });
    }

    this.saveCart();

    // Track with backend (agentic engine)
    try {
      await this.apiClient.submitObservation('add_to_cart', {
        productId: product.id,
        productName: product.name,
        price: product.price,
        sessionId: this.sessionId
      }, Date.now(), this.sessionId);
    } catch (error) {
      console.warn('Failed to track cart addition:', error);
    }

    return this.cart;
  }

  // Update cart item quantity
  updateQuantity(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
      }
    }
    return this.cart;
  }

  // Remove from cart
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    return this.cart;
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartUI();
  }

  // Update cart UI elements
  updateCartUI() {
    const count = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update cart count badges
    document.querySelectorAll('.cart-count, .cart-badge, #cartCount').forEach(el => {
      if (el) el.textContent = count;
    });

    // Update cart total if present
    document.querySelectorAll('.cart-total, #cartTotal').forEach(el => {
      if (el) el.textContent = total.toFixed(0);
    });

    return { count, total };
  }

  // Get cart summary
  getCartSummary() {
    const itemCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = subtotal >= 500 ? 0 : 50;
    const total = subtotal + shipping;

    return {
      itemCount,
      subtotal,
      shipping,
      total,
      items: this.cart
    };
  }

  // Clear cart
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // Checkout process
  async checkout(customerInfo, deliveryInfo) {
    if (this.cart.length === 0) {
      throw new Error('Cart is empty');
    }

    if (!this.apiClient.isAuthenticated()) {
      throw new Error('Please login to checkout');
    }

    const summary = this.getCartSummary();
    const orderData = {
      customer: customerInfo,
      items: this.cart,
      delivery: deliveryInfo,
      payment: {
        method: 'promptpay',
        amount: summary.total
      },
      total: summary.total,
      sessionId: this.sessionId
    };

    try {
      // Submit order to backend
      const result = await this.apiClient.createOrder(orderData);

      if (result.orderId) {
        // Track checkout completion
        await this.apiClient.submitObservation('checkout_completed', {
          orderId: result.orderId,
          total: summary.total,
          itemCount: summary.itemCount,
          sessionId: this.sessionId
        }, Date.now(), this.sessionId);

        // Clear cart after successful order
        this.clearCart();

        return {
          success: true,
          orderId: result.orderId,
          goalId: result.goalId,
          amount: summary.total
        };
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  // Generate PromptPay payment
  async generatePayment(orderId, amount) {
    try {
      const user = this.apiClient.getUser();
      const paymentData = await this.apiClient.createPromptPayPayment(amount, orderId, user.name);
      return paymentData;
    } catch (error) {
      console.error('Payment generation failed:', error);
      throw error;
    }
  }

  // Verify payment slip
  async verifyPaymentSlip(imageBase64, paymentId, expectedAmount) {
    try {
      const result = await this.apiClient.verifyPaymentSlip(imageBase64, paymentId, expectedAmount);
      return result;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Get order status
  async getOrderStatus(orderId) {
    try {
      const status = await this.apiClient.getOrderStatus(orderId);
      return status;
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw error;
    }
  }

  // Sync cart with backend (for multi-device support)
  async syncCart() {
    try {
      const summary = this.getCartSummary();
      await this.apiClient.submitObservation('cart_sync', {
        itemCount: summary.itemCount,
        total: summary.total,
        items: this.cart,
        sessionId: this.sessionId
      }, Date.now(), this.sessionId);
    } catch (error) {
      console.warn('Cart sync failed:', error);
    }
  }

  // Get recommendations based on cart
  async getRecommendations() {
    try {
      const categories = [...new Set(this.cart.map(item => item.category))];
      const goal = await this.apiClient.submitGoal(
        `Recommend products based on cart: ${categories.join(', ')}`,
        'medium',
        { cartCategories: categories, sessionId: this.sessionId }
      );
      return { goalId: goal.id };
    } catch (error) {
      console.warn('Failed to get recommendations:', error);
      return null;
    }
  }

  // Initialize cart integration
  init() {
    // Update UI on load
    this.updateCartUI();

    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') {
        this.cart = JSON.parse(e.newValue || '[]');
        this.updateCartUI();
      }
    });

    // Sync with backend periodically
    setInterval(() => {
      if (this.cart.length > 0) {
        this.syncCart();
      }
    }, 30000); // Every 30 seconds

    return this;
  }
}

// Initialize cart integration when DOM is ready and API client is available
document.addEventListener('DOMContentLoaded', () => {
  if (window.apiClient) {
    window.cartIntegration = new CartBackendIntegration(window.apiClient).init();
  }
});
