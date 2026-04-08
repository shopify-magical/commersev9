// Sales Page Component - Manages product catalog and cart
class SalesPage {
  constructor(apiClient) {
    this.api = apiClient;
    this.products = [];
    this.cart = [];
    this.orders = [];
    
    // Product data (matches the images available)
    this.productData = [
      {
        id: 1,
        name: "Heritage Mooncake",
        category: "mooncakes",
        price: 180,
        image: "images/mooncake-traditional.jpg",
        description: "Traditional lotus seed mooncake with golden crust"
      },
      {
        id: 2,
        name: "Pandan Custard Pastry",
        category: "pastries",
        price: 45,
        image: "images/pandan-custard.jpg",
        description: "Green pandan custard with flaky layers"
      },
      {
        id: 3,
        name: "Black Sesame Roll",
        category: "pastries",
        price: 55,
        image: "images/black-sesame.jpg",
        description: "Traditional black sesame paste roll"
      },
      {
        id: 4,
        name: "Salted Egg Pastry",
        category: "pastries",
        price: 60,
        image: "images/salted-egg.jpg",
        description: "Golden pastry with salted egg yolk center"
      },
      {
        id: 5,
        name: "Red Bean Mooncake",
        category: "mooncakes",
        price: 160,
        image: "images/red-bean.jpg",
        description: "Sweet red bean filling in traditional crust"
      },
      {
        id: 6,
        name: "Taro Coconut Pastry",
        category: "pastries",
        price: 50,
        image: "images/taro-coconut.jpg",
        description: "Creamy taro and coconut filling"
      },
      {
        id: 7,
        name: "White Lotus Mooncake",
        category: "mooncakes",
        price: 190,
        image: "images/mooncake-white-lotus.png",
        description: "Premium white lotus seed mooncake"
      },
      {
        id: 8,
        name: "Mung Bean Pastry",
        category: "pastries",
        price: 40,
        image: "images/mung-bean.jpg",
        description: "Traditional mung bean paste pastry"
      }
    ];
  }

  init() {
    this.renderProducts();
    this.setupEventListeners();
    this.loadFromStorage();
  }

  renderProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filteredProducts = filter === 'all' 
      ? this.productData 
      : this.productData.filter(p => p.category === filter);

    grid.innerHTML = filteredProducts.map(product => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <div class="product-name">${product.name}</div>
          <div class="product-price">฿${product.price}</div>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
            Add to Cart
          </button>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderProducts(btn.dataset.filter);
      });
    });

    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        const filterBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (filterBtn) {
          filterBtns.forEach(b => b.classList.remove('active'));
          filterBtn.classList.add('active');
          this.renderProducts(category);
          document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  addToCart(productId) {
    const product = this.productData.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    this.renderCart();
    this.saveToStorage();
    this.showNotification(`${product.name} added to cart`);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.renderCart();
    this.saveToStorage();
  }

  updateQuantity(productId, change) {
    const item = this.cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.renderCart();
      this.saveToStorage();
    }
  }

  renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems) return;

    if (this.cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      cartTotal.textContent = '฿0';
      return;
    }

    cartItems.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">฿${item.price * item.quantity}</div>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
    `).join('');

    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `฿${total}`;
  }

  async processOrder() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty', 'error');
      return;
    }

    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order object
    const order = {
      id: Date.now(),
      items: [...this.cart],
      total: total,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Send to backend API
    const response = await this.api.post('/agent/orders', { 
      action: 'create_order',
      order: order 
    });

    if (response.goalId) {
      // Add to orders
      this.orders.unshift(order);
      this.renderOrders();
      
      // Clear cart
      this.cart = [];
      this.renderCart();
      this.saveToStorage();
      
      this.showNotification('Order placed successfully!', 'success');
      return order;
    } else {
      this.showNotification('Failed to place order', 'error');
      return null;
    }
  }

  renderOrders() {
    const ordersList = document.getElementById('recent-orders-list');
    if (!ordersList) return;

    if (this.orders.length === 0) {
      ordersList.innerHTML = '<p class="no-orders">No recent orders</p>';
      return;
    }

    ordersList.innerHTML = this.orders.slice(0, 5).map(order => `
      <div class="order-item">
        <div class="order-item-id">Order #${order.id}</div>
        <div class="order-item-status ${order.status}">${order.status}</div>
        <div>Total: ฿${order.total}</div>
      </div>
    `).join('');
  }

  saveToStorage() {
    localStorage.setItem('sales_cart', JSON.stringify(this.cart));
    localStorage.setItem('sales_orders', JSON.stringify(this.orders));
  }

  loadFromStorage() {
    const savedCart = localStorage.getItem('sales_cart');
    const savedOrders = localStorage.getItem('sales_orders');
    
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.renderCart();
    }
    
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
      this.renderOrders();
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#22c55e' : '#ef4444'};
      color: white;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  getCart() {
    return this.cart;
  }

  getOrders() {
    return this.orders;
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

// Global functions for HTML onclick handlers
let salesPageInstance;

function addToCart(productId) {
  if (salesPageInstance) {
    salesPageInstance.addToCart(productId);
  }
}

function updateQuantity(productId, change) {
  if (salesPageInstance) {
    salesPageInstance.updateQuantity(productId, change);
  }
}

function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function proceedToCheckout() {
  if (salesPageInstance) {
    salesPageInstance.processOrder();
  }
}
