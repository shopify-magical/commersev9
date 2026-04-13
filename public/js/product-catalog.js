/**
 * Product Catalog Integration
 * 
 * Connects frontend product display with backend API
 */

class ProductCatalog {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.products = [];
    this.categories = [];
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.init();
  }

  async init() {
    // Load products from backend
    await this.loadProducts();
    
    // Load categories
    this.extractCategories();
    
    // Initialize cart
    this.updateCartUI();
  }

  async loadProducts(filters = {}) {
    try {
      const data = await this.apiClient.getProducts(filters);
      this.products = data.products || [];
      this.renderProducts();
      return this.products;
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback to local products if API fails
      this.products = this.getLocalProducts();
      this.renderProducts();
      return this.products;
    }
  }

  getLocalProducts() {
    // Fallback products if backend is unavailable
    return [
      { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', price: 450, image: 'images/mooncake-1.jpg', description: 'Rich, nutty flavor with golden crust' },
      { id: 2, name: 'Thai Tea Cake', category: 'cakes', price: 380, image: 'images/cake-1.jpg', description: 'Fragrant Thai tea with creamy texture' },
      { id: 3, name: 'Pandan Custard', category: 'pastries', price: 120, image: 'images/pastry-1.jpg', description: 'Fragrant pandan with creamy custard' },
      { id: 4, name: 'Black Sesame Roll', category: 'pastries', price: 95, image: 'images/cookie-1.jpg', description: 'Rich black sesame filling' },
      { id: 5, name: 'Salted Egg Pastry', category: 'pastries', price: 150, image: 'images/pastry-2.jpg', description: 'Traditional salted egg yolk pastry' },
    ];
  }

  extractCategories() {
    const categorySet = new Set();
    this.products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    this.categories = Array.from(categorySet);
    this.renderCategories();
  }

  renderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = this.products.map(product => `
      <div class="card bg-white rounded-lg shadow-sm hover:shadow-md transition-transform cursor-pointer" 
           data-product-id="${product.id}" onclick="productCatalog.addToCart(${product.id})">
        <img src="${product.image || 'placeholder.jpg'}" 
             data-lazy-src="${product.image || 'placeholder.jpg'}" 
             class="w-full h-48 object-cover rounded-t-lg mb-4" 
             alt="${product.name}">
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
          <p class="text-sm text-gray-500 mb-4">${product.description || ''}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-primary">¥${product.price}</span>
            <button class="btn btn-primary text-sm" onclick="event.stopPropagation(); productCatalog.addToCart(${product.id})">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Initialize lazy loading for new images
    if (window.lazyLoader) {
      window.lazyLoader.init();
    }
  }

  renderCategories() {
    const categoryFilter = document.querySelector('.category-filter');
    if (!categoryFilter) return;

    categoryFilter.innerHTML = `
      <button class="category-btn active" data-category="all">All</button>
      ${this.categories.map(category => `
        <button class="category-btn" data-category="${category}">${category}</button>
      `).join('')}
    `;

    // Add event listeners
    categoryFilter.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterByCategory(e.target.dataset.category);
        categoryFilter.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  async filterByCategory(category) {
    if (category === 'all') {
      await this.loadProducts();
    } else {
      await this.loadProducts({ category });
    }
  }

  async searchProducts(query) {
    if (!query) {
      await this.loadProducts();
    } else {
      await this.loadProducts({ search: query });
    }
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showNotification(`${product.name} added to cart`, 'success');
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(productId, change) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total');
    const cartItems = document.querySelector('.cart-items');

    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
    }

    if (cartTotal) {
      const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotal.textContent = `¥${total}`;
    }

    if (cartItems) {
      cartItems.innerHTML = this.cart.map(item => `
        <div class="cart-item">
          <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
          <div class="flex-1">
            <h4 class="font-semibold">${item.name}</h4>
            <p class="text-sm text-gray-500">¥${item.price} × ${item.quantity}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="productCatalog.updateQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="productCatalog.updateQuantity(${item.id}, 1)">+</button>
            <button onclick="productCatalog.removeFromCart(${item.id})" class="text-red-500">× Remove</button>
          </div>
        </div>
      `).join('');
    }
  }

  async checkout() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty', 'error');
      return;
    }

    if (!this.apiClient.isAuthenticated()) {
      this.showNotification('Please login to checkout', 'warning');
      // Redirect to login or show login modal
      return;
    }

    const orderData = {
      customer: this.apiClient.getUser().name,
      items: this.cart,
      total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      delivery: { method: 'standard' },
      payment: { method: 'promptpay' }
    };

    try {
      const result = await this.apiClient.createOrder(orderData);
      
      if (result.orderId) {
        this.showNotification('Order created successfully', 'success');
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        
        // Redirect to payment page
        window.location.href = `checkout.html?orderId=${result.orderId}`;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      this.showNotification('Failed to create order', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Use toast notification system if available
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      // Fallback to simple alert
      console.log(`[${type}] ${message}`);
    }
  }
}

// Initialize product catalog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.apiClient) {
    window.productCatalog = new ProductCatalog(window.apiClient);
  }
});
