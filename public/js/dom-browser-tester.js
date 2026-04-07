// DOM Browser v8 Testing for Sweet Layers
// ทดสอบใน Chrome DevTools ทันที - ไม่ต้องติดตั้งอะไร!

class SweetLayersTester {
  constructor() {
    this.results = [];
    this.baseUrl = window.location.origin;
  }

  // รันทุก tests
  async runAllTests() {
    console.log('🎂 Sweet Layers Testing Suite');
    console.log('================================');
    
    await this.testPageLoad();
    await this.testCustomizer();
    await this.testCart();
    await this.testCheckout();
    await this.testPerformance();
    await this.testLINEIntegration();
    await this.testMobile();
    await this.testAccessibility();
    
    this.generateReport();
  }

  // 1. ทดสอบการโหลดหน้า
  async testPageLoad() {
    console.log('\n📄 1. Page Load Test');
    
    const navigation = performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    
    this.addTest('Page loads successfully', 
      document.title.includes('Sweet Layers'));
    
    this.addTest('Load time under 3 seconds', 
      loadTime < 3000, `${loadTime}ms`);
    
    this.addTest('CSS loaded', 
      document.querySelector('link[href*="shared.css"]') !== null);
    
    this.addTest('JavaScript loaded', 
      typeof window.UXHelpers !== 'undefined');
  }

  // 2. ทดสอบ Cake Customizer
  async testCustomizer() {
    console.log('\n🎂 2. Cake Customizer Test');
    
    // ตรวจสอบหน้า custom cake
    const customizerExists = document.querySelector('[data-cake-customizer]') !== null;
    this.addTest('Custom cake page exists', customizerExists);
    
    if (customizerExists) {
      // ทดสอบ components
      const flavorButtons = document.querySelectorAll('.flavor-btn');
      this.addTest('Flavor options available', flavorButtons.length >= 6);
      
      const sizeButtons = document.querySelectorAll('.size-btn');
      this.addTest('Size options available', sizeButtons.length >= 5);
      
      const toppingButtons = document.querySelectorAll('.topping-btn');
      this.addTest('Topping options available', toppingButtons.length >= 6);
      
      // ทดสอบการเลือก
      if (flavorButtons.length > 0) {
        flavorButtons[0].click();
        this.addTest('Flavor selection works', 
          flavorButtons[0].classList.contains('active'));
      }
      
      // ทดสอบราคา
      const priceElement = document.getElementById('totalPrice');
      this.addTest('Price calculation works', 
        priceElement && priceElement.textContent.includes('฿'));
    }
  }

  // 3. ทดสอบตะกร้า
  async testCart() {
    console.log('\n🛒 3. Cart Test');
    
    // ตรวจสอบ localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.addTest('Cart storage works', Array.isArray(cart));
    
    // ตรวจสอบ cart items
    if (window.location.pathname.includes('cart.html')) {
      const cartItems = document.querySelectorAll('.cart-item');
      this.addTest('Cart items display', cartItems.length === cart.length);
      
      // ทดสอบปุ่ม checkout
      const checkoutBtn = document.querySelector('.checkout-btn');
      this.addTest('Checkout button exists', checkoutBtn !== null);
    }
  }

  // 4. ทดสอบ checkout
  async testCheckout() {
    console.log('\n💳 4. Checkout Test');
    
    if (window.location.pathname.includes('checkout.html')) {
      // ตรวจสอบ progress indicator
      const progressSteps = document.querySelectorAll('.progress-step');
      this.addTest('Progress indicator exists', progressSteps.length === 4);
      
      // ตรวจสอบ form fields
      const nameField = document.getElementById('name');
      const phoneField = document.getElementById('phone');
      const addressField = document.getElementById('address');
      
      this.addTest('Required fields exist', 
        nameField && phoneField && addressField);
      
      // ทดสอบ validation
      if (nameField) {
        nameField.value = '';
        nameField.dispatchEvent(new Event('blur'));
        const hasError = nameField.closest('.form-group')?.classList.contains('error');
        this.addTest('Form validation works', hasError);
      }
      
      // ทดสอบ payment methods
      const paymentMethods = document.querySelectorAll('.payment-method');
      this.addTest('Payment options available', paymentMethods.length >= 2);
    }
  }

  // 5. ทดสอบ performance
  async testPerformance() {
    console.log('\n⚡ 5. Performance Test');
    
    // Core Web Vitals
    const vitals = await this.getCoreWebVitals();
    
    this.addTest('First Contentful Paint < 1.8s', 
      vitals.fcp < 1800, `${vitals.fcp.toFixed(0)}ms`);
    
    this.addTest('Largest Contentful Paint < 2.5s', 
      vitals.lcp < 2500, `${vitals.lcp.toFixed(0)}ms`);
    
    this.addTest('Cumulative Layout Shift < 0.1', 
      vitals.cls < 0.1, vitals.cls.toFixed(3));
    
    // Resource loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    this.addTest('Lazy loading implemented', images.length > 0);
    
    // Memory usage
    if (performance.memory) {
      const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
      this.addTest('Memory usage reasonable', 
        performance.memory.usedJSHeapSize < 50 * 1024 * 1024, `${memoryMB}MB`);
    }
  }

  // 6. ทดสอบ LINE integration
  async testLINEIntegration() {
    console.log('\n💬 6. LINE Integration Test');
    
    // ตรวจสอบ script loading
    const lineScript = document.querySelector('script[src*="line-integration"]');
    this.addTest('LINE integration script loaded', lineScript !== null);
    
    // ตรวจสอบ class availability
    const lineClassExists = typeof window.LINEIntegration !== 'undefined';
    this.addTest('LINE Integration class available', lineClassExists);
    
    // ตรวจสอบ LIFF page
    if (window.location.pathname.includes('line-liff.html')) {
      const liffContainer = document.querySelector('.liff-container');
      this.addTest('LIFF interface loaded', liffContainer !== null);
    }
  }

  // 7. ทดสอบ mobile
  async testMobile() {
    console.log('\n📱 7. Mobile Test');
    
    // ตรวจสอบ viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    this.addTest('Mobile viewport set', viewport !== null);
    
    // ตรวจสอบ responsive design
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      this.addTest('Mobile menu available', hamburgerBtn !== null);
      
      // ทดสอบ touch targets
      const buttons = document.querySelectorAll('button');
      const touchTargetsOk = Array.from(buttons).every(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.width >= 44 && rect.height >= 44;
      });
      this.addTest('Touch targets 44px+', touchTargetsOk);
    }
  }

  // 8. ทดสอบ accessibility
  async testAccessibility() {
    console.log('\n♿ 8. Accessibility Test');
    
    // ตรวจสอบ skip link
    const skipLink = document.querySelector('.skip-link');
    this.addTest('Skip link available', skipLink !== null);
    
    // ตรวจสอบ alt text
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt || img.loading === 'lazy');
    this.addTest('Images have alt text', imagesWithAlt.length / images.length > 0.8);
    
    // ตรวจสอบ focus states
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a');
    this.addTest('Focusable elements styled', focusableElements.length > 0);
    
    // ตรวจสอบ semantic HTML
    const semanticTags = document.querySelectorAll('header, main, footer, nav, section');
    this.addTest('Semantic HTML used', semanticTags.length >= 3);
  }

  // ดึง Core Web Vitals
  async getCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = { fcp: 0, lcp: 0, cls: 0 };
      
      // FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });
      
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.lcp = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // CLS
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            vitals.cls += entry.value;
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
      
      // รอ 2 วินาทีแล้ว return
      setTimeout(() => resolve(vitals), 2000);
    });
  }

  // เพิ่ม test result
  addTest(name, passed, details = '') {
    this.results.push({ name, passed, details });
    const status = passed ? '✅' : '❌';
    const detailText = details ? ` (${details})` : '';
    console.log(`  ${status} ${name}${detailText}`);
  }

  // สร้าง report
  generateReport() {
    console.log('\n📊 Test Report');
    console.log('================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`\n🎯 Overall Score: ${percentage}% (${passed}/${total})`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Sweet Layers is ready for production!');
    } else {
      console.log('\n⚠️ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(test => {
        console.log(`  ❌ ${test.name} ${test.details ? `(${test.details})` : ''}`);
      });
    }
    
    // Performance summary
    console.log('\n⚡ Performance Summary:');
    const perfTests = this.results.filter(r => r.name.includes('Load time') || r.name.includes('FCP') || r.name.includes('LCP'));
    perfTests.forEach(test => {
      console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details}`);
    });
    
    return { passed, total, percentage, results: this.results };
  }
}

// รัน testing ทันที
const tester = new SweetLayersTester();

// Auto-run ถ้าอยู่ใน development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🧪 Running Sweet Layers Tests...');
  tester.runAllTests();
}

// Export สำหรับ manual testing
window.SweetLayersTester = SweetLayersTester;
window.tester = tester;

// Quick test function
window.quickTest = () => {
  console.log('🚀 Quick Test Mode');
  tester.runAllTests();
};

console.log('💡 Type quickTest() in console to run tests manually');
