/**
 * Cake Customizer Widget - Advanced Product Builder
 * Allows customers to customize their cakes in real-time with pricing
 */

class CakeCustomizer {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('cake-customizer');
    this.onComplete = options.onComplete || (() => {});
    this.basePrice = options.basePrice || 450;
    this.baseSize = options.baseSize || '1 ปอนด์';
    
    // Configuration options
    this.flavors = [
      { id: 'vanilla', name: 'วานิลลา', price: 0, image: '🍰' },
      { id: 'chocolate', name: 'ช็อกโกแลต', price: 50, image: '🍫' },
      { id: 'redvelvet', name: 'เรดเวลเวต', price: 80, image: '❤️' },
      { id: 'strawberry', name: 'สตรอเบอร์รี่', price: 60, image: '🍓' },
      { id: 'matcha', name: 'มัทฉะ', price: 80, image: '🍵' },
      { id: 'coconut', name: 'มะพร้าว', price: 40, image: '🥥' }
    ];
    
    this.sizes = [
      { id: '0.5', name: '0.5 ปอนด์ (4-6 คน)', price: 350, serves: '4-6' },
      { id: '1', name: '1 ปอนด์ (8-10 คน)', price: 450, serves: '8-10' },
      { id: '1.5', name: '1.5 ปอนด์ (12-15 คน)', price: 650, serves: '12-15' },
      { id: '2', name: '2 ปอนด์ (16-20 คน)', price: 850, serves: '16-20' },
      { id: '3', name: '3 ปอนด์ (25-30 คน)', price: 1200, serves: '25-30' }
    ];
    
    this.toppings = [
      { id: 'fresh-fruits', name: 'ผลไม้สด', price: 120, image: '🍓🥝' },
      { id: 'chocolate-chips', name: 'ช็อกโกแลตชิป', price: 80, image: '🍫' },
      { id: 'nuts', name: 'ถั่วอัลมอนด์', price: 100, image: '🥜' },
      { id: 'macarons', name: 'มาการอง', price: 200, image: '🍪' },
      { id: 'gold-leaf', name: 'ทองคำเปลว', price: 300, image: '✨' },
      { id: 'fresh-flowers', name: 'ดอกไม้สด', price: 250, image: '🌸' }
    ];
    
    this.candles = [
      { id: 'none', name: 'ไม่ต้องการ', price: 0, image: '❌' },
      { id: 'standard', name: 'เทียนมาตรฐาน', price: 30, image: '🕯️' },
      { id: 'sparkler', name: 'เทียนพลุ', price: 50, image: '✨' },
      { id: 'number', name: 'เทียนตัวเลข', price: 40, image: '🔢' },
      { id: 'magic', name: 'เทียนมายากล', price: 80, image: '🎆' }
    ];
    
    this.messages = [
      { id: 'none', name: 'ไม่มีข้อความ', price: 0 },
      { id: 'happy-birthday', name: 'สุขสันต์วันเกิด', price: 0 },
      { id: 'congrats', name: 'ยินดีด้วย', price: 0 },
      { id: 'love', name: 'รักนะ ❤️', price: 0 },
      { id: 'custom', name: 'ข้อความกำหนดเอง', price: 0 }
    ];
    
    // Current selection
    this.selection = {
      flavor: 'vanilla',
      size: '1',
      toppings: [],
      candle: 'none',
      message: 'none',
      customMessage: '',
      quantity: 1
    };
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEvents();
    this.calculatePrice();
  }
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="cake-customizer">
        <div class="customizer-header">
          <h3>🎂 ออกแบบเค้กของคุณ</h3>
          <p class="customizer-subtitle">ปรับแต่งเค้กตามต้องการ พรีเมียมทุกชิ้น</p>
        </div>
        
        <div class="customizer-preview">
          <div class="preview-cake">
            <div class="cake-visual" id="cakeVisual">
              <span class="cake-base">🎂</span>
              <span class="cake-toppings" id="toppingVisual"></span>
            </div>
            <div class="preview-details">
              <div class="preview-name" id="previewName">เค้กวานิลลา 1 ปอนด์</div>
              <div class="preview-desc" id="previewDesc">พร้อมส่งใน 24 ชม.</div>
            </div>
          </div>
          <div class="preview-price" id="previewPrice">฿450</div>
        </div>
        
        <div class="customizer-options">
          <!-- Flavor Selection -->
          <div class="option-section">
            <h4>1. เลือกรสชาติ</h4>
            <div class="flavor-grid" id="flavorGrid">
              ${this.flavors.map(f => `
                <button class="flavor-btn ${this.selection.flavor === f.id ? 'active' : ''}" 
                        data-flavor="${f.id}" data-price="${f.price}">
                  <span class="flavor-icon">${f.image}</span>
                  <span class="flavor-name">${f.name}</span>
                  <span class="flavor-price">${f.price > 0 ? '+฿' + f.price : 'มาตรฐาน'}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Size Selection -->
          <div class="option-section">
            <h4>2. เลือกขนาด</h4>
            <div class="size-options" id="sizeOptions">
              ${this.sizes.map(s => `
                <button class="size-btn ${this.selection.size === s.id ? 'active' : ''}" 
                        data-size="${s.id}" data-price="${s.price}">
                  <span class="size-name">${s.name}</span>
                  <span class="size-serves">สำหรับ ${s.serves} คน</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Toppings Selection -->
          <div class="option-section">
            <h4>3. เลือกท็อปปิ้ง <span class="multi-select">เลือกได้หลายอย่าง</span></h4>
            <div class="toppings-grid" id="toppingsGrid">
              ${this.toppings.map(t => `
                <button class="topping-btn ${this.selection.toppings.includes(t.id) ? 'active' : ''}" 
                        data-topping="${t.id}" data-price="${t.price}">
                  <span class="topping-icon">${t.image}</span>
                  <span class="topping-name">${t.name}</span>
                  <span class="topping-price">+฿${t.price}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Candle Selection -->
          <div class="option-section">
            <h4>4. เทียนวันเกิด</h4>
            <div class="candle-options" id="candleOptions">
              ${this.candles.map(c => `
                <button class="candle-btn ${this.selection.candle === c.id ? 'active' : ''}" 
                        data-candle="${c.id}" data-price="${c.price}">
                  <span class="candle-icon">${c.image}</span>
                  <span class="candle-name">${c.name}</span>
                  <span class="candle-price">${c.price > 0 ? '+฿' + c.price : 'ฟรี'}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Message Selection -->
          <div class="option-section">
            <h4>5. ข้อความบนเค้ก</h4>
            <div class="message-options" id="messageOptions">
              ${this.messages.map(m => `
                <button class="message-btn ${this.selection.message === m.id ? 'active' : ''}" 
                        data-message="${m.id}">
                  <span class="message-name">${m.name}</span>
                </button>
              `).join('')}
            </div>
            <div class="custom-message-input ${this.selection.message === 'custom' ? 'show' : ''}" 
                 id="customMessageInput">
              <input type="text" id="customMessage" maxlength="30" 
                     placeholder="พิมพ์ข้อความที่ต้องการ (สูงสุด 30 ตัวอักษร)"
                     value="${this.selection.customMessage}">
              <span class="char-count">0/30</span>
            </div>
          </div>
          
          <!-- Quantity -->
          <div class="option-section">
            <h4>จำนวน</h4>
            <div class="quantity-selector">
              <button class="qty-btn minus" id="qtyMinus">−</button>
              <input type="number" id="quantity" value="1" min="1" max="10" readonly>
              <button class="qty-btn plus" id="qtyPlus">+</button>
            </div>
          </div>
        </div>
        
        <div class="customizer-summary">
          <div class="summary-line">
            <span>ราคา/ชิ้น</span>
            <span id="unitPrice">฿450</span>
          </div>
          <div class="summary-line">
            <span>จำนวน</span>
            <span id="qtyDisplay">× 1</span>
          </div>
          <div class="summary-line total">
            <span>ราคารวม</span>
            <span id="totalPrice">฿450</span>
          </div>
        </div>
        
        <div class="customizer-actions">
          <button class="add-to-cart-btn" id="addToCartBtn">
            <span class="btn-icon">🛒</span>
            <span>เพิ่มลงตะกร้า</span>
          </button>
        </div>
      </div>
    `;
    
    // Inject styles
    this.injectStyles();
  }
  
  injectStyles() {
    if (document.getElementById('cake-customizer-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'cake-customizer-styles';
    styles.textContent = `
      .cake-customizer {
        background: var(--white, #ffffff);
        border-radius: 20px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.1);
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      }
      
      .customizer-header {
        background: linear-gradient(135deg, #2A6B52 0%, #1F4A3A 100%);
        color: white;
        padding: 24px;
        text-align: center;
      }
      
      .customizer-header h3 {
        font-family: 'Playfair Display', serif;
        font-size: 1.5rem;
        margin: 0 0 8px 0;
      }
      
      .customizer-subtitle {
        opacity: 0.9;
        font-size: 0.9rem;
        margin: 0;
      }
      
      .customizer-preview {
        background: linear-gradient(135deg, #FDF9F5 0%, #F5EDE4 100%);
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #E8DCD0;
      }
      
      .preview-cake {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .cake-visual {
        position: relative;
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transition: transform 0.3s ease;
      }
      
      .cake-visual:hover {
        transform: scale(1.05);
      }
      
      .cake-toppings {
        position: absolute;
        top: -8px;
        right: -8px;
        font-size: 1.5rem;
        animation: bounce 1s ease infinite;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      
      .preview-details {
        flex: 1;
      }
      
      .preview-name {
        font-weight: 600;
        color: #3D2E22;
        font-size: 1rem;
      }
      
      .preview-desc {
        font-size: 0.8rem;
        color: #9A7D6A;
        margin-top: 4px;
      }
      
      .preview-price {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2A6B52;
      }
      
      .customizer-options {
        padding: 24px;
        max-height: 500px;
        overflow-y: auto;
      }
      
      .option-section {
        margin-bottom: 24px;
      }
      
      .option-section h4 {
        font-size: 0.9rem;
        font-weight: 600;
        color: #3D2E22;
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .multi-select {
        font-size: 0.75rem;
        color: #9A7D6A;
        font-weight: 400;
        background: #F5EDE4;
        padding: 2px 8px;
        border-radius: 12px;
      }
      
      .flavor-grid, .toppings-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      
      .flavor-btn, .topping-btn, .candle-btn, .message-btn, .size-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px 8px;
        border: 2px solid #E8DCD0;
        border-radius: 12px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      
      .flavor-btn:hover, .topping-btn:hover, .candle-btn:hover, 
      .message-btn:hover, .size-btn:hover {
        border-color: #2A6B52;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(42, 107, 82, 0.15);
      }
      
      .flavor-btn.active, .topping-btn.active, .candle-btn.active,
      .message-btn.active, .size-btn.active {
        border-color: #2A6B52;
        background: #E8F5F0;
        box-shadow: 0 4px 12px rgba(42, 107, 82, 0.2);
      }
      
      .flavor-icon, .topping-icon, .candle-icon {
        font-size: 1.5rem;
      }
      
      .flavor-name, .topping-name, .candle-name, .message-name {
        font-size: 0.75rem;
        font-weight: 500;
        color: #3D2E22;
        text-align: center;
      }
      
      .flavor-price, .topping-price, .candle-price {
        font-size: 0.7rem;
        color: #C4A647;
        font-weight: 600;
      }
      
      .size-options, .candle-options, .message-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .size-btn {
        flex-direction: row;
        justify-content: flex-start;
        padding: 12px;
        gap: 8px;
      }
      
      .size-name {
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .size-serves {
        font-size: 0.7rem;
        color: #9A7D6A;
        margin-left: auto;
      }
      
      .custom-message-input {
        display: none;
        margin-top: 12px;
      }
      
      .custom-message-input.show {
        display: block;
      }
      
      .custom-message-input input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #E8DCD0;
        border-radius: 10px;
        font-size: 0.9rem;
        transition: border-color 0.2s;
      }
      
      .custom-message-input input:focus {
        outline: none;
        border-color: #2A6B52;
      }
      
      .char-count {
        display: block;
        text-align: right;
        font-size: 0.75rem;
        color: #9A7D6A;
        margin-top: 4px;
      }
      
      .quantity-selector {
        display: flex;
        align-items: center;
        gap: 12px;
        justify-content: center;
      }
      
      .qty-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #2A6B52;
        background: white;
        color: #2A6B52;
        font-size: 1.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .qty-btn:hover {
        background: #2A6B52;
        color: white;
      }
      
      .qty-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      #quantity {
        width: 60px;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 600;
        border: none;
        background: transparent;
      }
      
      .customizer-summary {
        background: #F5EDE4;
        padding: 20px 24px;
        border-top: 1px solid #E8DCD0;
      }
      
      .summary-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: #5A4535;
      }
      
      .summary-line.total {
        font-size: 1.1rem;
        font-weight: 700;
        color: #2A6B52;
        border-top: 2px solid #E8DCD0;
        padding-top: 12px;
        margin-top: 12px;
      }
      
      .customizer-actions {
        padding: 20px 24px;
      }
      
      .add-to-cart-btn {
        width: 100%;
        padding: 16px;
        background: linear-gradient(135deg, #2A6B52 0%, #1F4A3A 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
        box-shadow: 0 4px 16px rgba(42, 107, 82, 0.3);
      }
      
      .add-to-cart-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(42, 107, 82, 0.4);
      }
      
      .add-to-cart-btn:active {
        transform: translateY(0);
      }
      
      .btn-icon {
        font-size: 1.25rem;
      }
      
      @media (max-width: 480px) {
        .flavor-grid, .toppings-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .customizer-preview {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  attachEvents() {
    // Flavor selection
    this.container.querySelectorAll('.flavor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selection.flavor = btn.dataset.flavor;
        this.updateSelectionUI();
        this.calculatePrice();
        this.updatePreview();
      });
    });
    
    // Size selection
    this.container.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selection.size = btn.dataset.size;
        this.updateSelectionUI();
        this.calculatePrice();
        this.updatePreview();
      });
    });
    
    // Toppings (multi-select)
    this.container.querySelectorAll('.topping-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const topping = btn.dataset.topping;
        const index = this.selection.toppings.indexOf(topping);
        
        if (index > -1) {
          this.selection.toppings.splice(index, 1);
        } else {
          this.selection.toppings.push(topping);
        }
        
        this.updateSelectionUI();
        this.calculatePrice();
        this.updatePreview();
      });
    });
    
    // Candle selection
    this.container.querySelectorAll('.candle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selection.candle = btn.dataset.candle;
        this.updateSelectionUI();
        this.calculatePrice();
      });
    });
    
    // Message selection
    this.container.querySelectorAll('.message-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selection.message = btn.dataset.message;
        this.updateSelectionUI();
        
        const customInput = this.container.querySelector('#customMessageInput');
        if (this.selection.message === 'custom') {
          customInput.classList.add('show');
          this.container.querySelector('#customMessage').focus();
        } else {
          customInput.classList.remove('show');
        }
        
        this.updatePreview();
      });
    });
    
    // Custom message input
    const customMessageInput = this.container.querySelector('#customMessage');
    if (customMessageInput) {
      customMessageInput.addEventListener('input', (e) => {
        this.selection.customMessage = e.target.value;
        this.container.querySelector('.char-count').textContent = 
          `${e.target.value.length}/30`;
        this.updatePreview();
      });
    }
    
    // Quantity
    const qtyMinus = this.container.querySelector('#qtyMinus');
    const qtyPlus = this.container.querySelector('#qtyPlus');
    const qtyInput = this.container.querySelector('#quantity');
    
    qtyMinus?.addEventListener('click', () => {
      if (this.selection.quantity > 1) {
        this.selection.quantity--;
        qtyInput.value = this.selection.quantity;
        this.calculatePrice();
      }
    });
    
    qtyPlus?.addEventListener('click', () => {
      if (this.selection.quantity < 10) {
        this.selection.quantity++;
        qtyInput.value = this.selection.quantity;
        this.calculatePrice();
      }
    });
    
    // Add to cart
    const addToCartBtn = this.container.querySelector('#addToCartBtn');
    addToCartBtn?.addEventListener('click', () => this.addToCart());
  }
  
  updateSelectionUI() {
    // Update flavor
    this.container.querySelectorAll('.flavor-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.flavor === this.selection.flavor);
    });
    
    // Update size
    this.container.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === this.selection.size);
    });
    
    // Update toppings
    this.container.querySelectorAll('.topping-btn').forEach(btn => {
      btn.classList.toggle('active', 
        this.selection.toppings.includes(btn.dataset.topping));
    });
    
    // Update candle
    this.container.querySelectorAll('.candle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.candle === this.selection.candle);
    });
    
    // Update message
    this.container.querySelectorAll('.message-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.message === this.selection.message);
    });
  }
  
  calculatePrice() {
    let price = 0;
    
    // Base price from size
    const size = this.sizes.find(s => s.id === this.selection.size);
    price += size ? size.price : 450;
    
    // Flavor modifier
    const flavor = this.flavors.find(f => f.id === this.selection.flavor);
    price += flavor ? flavor.price : 0;
    
    // Toppings
    this.selection.toppings.forEach(toppingId => {
      const topping = this.toppings.find(t => t.id === toppingId);
      if (topping) price += topping.price;
    });
    
    // Candle
    const candle = this.candles.find(c => c.id === this.selection.candle);
    if (candle) price += candle.price;
    
    const unitPrice = price;
    const totalPrice = unitPrice * this.selection.quantity;
    
    // Update display
    this.container.querySelector('#unitPrice').textContent = `฿${unitPrice}`;
    this.container.querySelector('#qtyDisplay').textContent = `× ${this.selection.quantity}`;
    this.container.querySelector('#totalPrice').textContent = `฿${totalPrice}`;
    this.container.querySelector('#previewPrice').textContent = `฿${unitPrice}`;
    
    return { unitPrice, totalPrice };
  }
  
  updatePreview() {
    const flavor = this.flavors.find(f => f.id === this.selection.flavor);
    const size = this.sizes.find(s => s.id === this.selection.size);
    
    let previewText = `เค้ก${flavor?.name || 'วานิลลา'} ${size?.name.split(' ')[0] || '1 ปอนด์'}`;
    
    if (this.selection.toppings.length > 0) {
      const toppingNames = this.selection.toppings.map(id => {
        const t = this.toppings.find(t => t.id === id);
        return t?.name;
      }).filter(Boolean);
      previewText += ` +${toppingNames.length} ท็อปปิ้ง`;
    }
    
    if (this.selection.message !== 'none') {
      const msg = this.selection.message === 'custom' 
        ? this.selection.customMessage 
        : this.messages.find(m => m.id === this.selection.message)?.name;
      if (msg) previewText += ` (${msg})`;
    }
    
    this.container.querySelector('#previewName').textContent = previewText;
    
    // Update toppings visual
    const toppingVisual = this.container.querySelector('#toppingVisual');
    if (this.selection.toppings.length > 0) {
      const icons = this.selection.toppings.slice(0, 3).map(id => {
        const t = this.toppings.find(t => t.id === id);
        return t?.image?.split('')[0] || '✨';
      }).join('');
      toppingVisual.textContent = icons;
    } else {
      toppingVisual.textContent = '';
    }
  }
  
  addToCart() {
    const { unitPrice, totalPrice } = this.calculatePrice();
    
    const flavor = this.flavors.find(f => f.id === this.selection.flavor);
    const size = this.sizes.find(s => s.id === this.selection.size);
    const candle = this.candles.find(c => c.id === this.selection.candle);
    
    const toppingNames = this.selection.toppings.map(id => {
      const t = this.toppings.find(t => t.id === id);
      return t?.name;
    }).filter(Boolean);
    
    let messageText = '';
    if (this.selection.message !== 'none') {
      messageText = this.selection.message === 'custom'
        ? this.selection.customMessage
        : this.messages.find(m => m.id === this.selection.message)?.name;
    }
    
    const cartItem = {
      id: `custom-cake-${Date.now()}`,
      name: `เค้ก${flavor?.name} ${size?.name.split(' ')[0]} (สั่งทำ)`,
      price: unitPrice,
      qty: this.selection.quantity,
      image: '/images/custom-cake.jpg',
      type: 'custom',
      options: {
        flavor: flavor?.name,
        size: size?.name,
        toppings: toppingNames,
        candle: candle?.name,
        message: messageText
      }
    };
    
    // Add to cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success toast
    if (typeof showToast === 'function') {
      showToast(`✅ เพิ่ม ${cartItem.name} ลงตะกร้าแล้ว!`, 3000);
    }
    
    // Trigger cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    
    // Callback
    this.onComplete(cartItem);
    
    // Animation feedback
    const btn = this.container.querySelector('#addToCartBtn');
    btn.innerHTML = '<span class="btn-icon">✅</span><span>เพิ่มแล้ว!</span>';
    setTimeout(() => {
      btn.innerHTML = '<span class="btn-icon">🛒</span><span>เพิ่มลงตะกร้า</span>';
    }, 1500);
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Find all customizer containers
  document.querySelectorAll('[data-cake-customizer]').forEach(container => {
    new CakeCustomizer({ container });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CakeCustomizer;
}
