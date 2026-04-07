const { test, expect } = require('@playwright/test');

// Sweet Layers E-commerce Test Suite
// ทดสอบระบบ e-commerce ครบวงจร

test.describe('Sweet Layers E-commerce', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup ก่อนทุก test
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('🏠 Homepage loads correctly', async ({ page }) => {
    // 1. ตรวจสอบหน้าแรก
    await expect(page).toHaveTitle(/Sweet Layers/);
    
    // 2. ตรวจสอบ elements หลัก
    await expect(page.locator('.logo')).toContainText('Sweet Layers');
    await expect(page.locator('[data-cake-customizer]')).toBeVisible();
    
    // 3. ตรวจสอบ performance
    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      };
    });
    
    console.log('⚡ Performance:', performance);
    expect(performance.loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('🎂 Cake Customizer works', async ({ page }) => {
    // 1. เปิดหน้า custom cake
    await page.goto('http://localhost:8080/custom-cake.html');
    
    // 2. ตรวจสอบ customizer โหลด
    await expect(page.locator('#cakeCustomizer')).toBeVisible();
    await expect(page.locator('.flavor-btn')).toHaveCount(6);
    await expect(page.locator('.size-btn')).toHaveCount(5);
    
    // 3. ทดสอบเลือก flavor
    await page.click('[data-flavor="chocolate"]');
    await expect(page.locator('[data-flavor="chocolate"]')).toHaveClass(/active/);
    
    // 4. ทดสอบเลือก size
    await page.click('[data-size="1"]');
    await expect(page.locator('[data-size="1"]')).toHaveClass(/active/);
    
    // 5. ทดสอบเลือก toppings
    await page.click('[data-topping="fresh-fruits"]');
    await expect(page.locator('[data-topping="fresh-fruits"]')).toHaveClass(/active/);
    
    // 6. ทดสอบราคาอัพเดท
    const price = await page.locator('#totalPrice').textContent();
    expect(price).toMatch(/฿\d+/);
    
    // 7. ทดสอบเพิ่มลงตะกร้า
    await page.click('.add-to-cart-btn');
    
    // 8. ตรวจสอบ toast แจ้งเตือน
    await expect(page.locator('.toast')).toContainText('เพิ่ม');
  });

  test('🛒 Cart functionality', async ({ page }) => {
    // 1. เพิ่มสินค้าลงตะกร้า
    await page.goto('http://localhost:8080/custom-cake.html');
    await page.click('[data-flavor="vanilla"]');
    await page.click('[data-size="1"]');
    await page.click('.add-to-cart-btn');
    
    // 2. ไปหน้าตะกร้า
    await page.goto('http://localhost:8080/cart.html');
    
    // 3. ตรวจสอบสินค้าในตะกร้า
    await expect(page.locator('.cart-item')).toHaveCount(1);
    await expect(page.locator('.cart-item')).toContainText('เค้กวานิลลา');
    
    // 4. ทดสอบปรับจำนวน
    await page.click('.qty-plus');
    await expect(page.locator('#quantity')).toHaveValue('2');
    
    // 5. ทดสอบราคารวม
    const total = await page.locator('.cart-total').textContent();
    expect(total).toMatch(/฿\d+/);
    
    // 6. ทดสอบปุ่ม checkout
    await expect(page.locator('.checkout-btn')).toBeVisible();
  });

  test('💳 Checkout process', async ({ page }) => {
    // 1. เพิ่มสินค้าและไป checkout
    await page.goto('http://localhost:8080/custom-cake.html');
    await page.click('[data-flavor="chocolate"]');
    await page.click('[data-size="1"]');
    await page.click('.add-to-cart-btn');
    
    await page.goto('http://localhost:8080/checkout.html');
    
    // 2. ตรวจสอบ progress indicator
    await expect(page.locator('.progress-step')).toHaveCount(4);
    await expect(page.locator('.progress-step.active')).toHaveText(/1/);
    
    // 3. กรอกข้อมูลลูกค้า
    await page.fill('#name', 'ทดสอบ ระบบ');
    await page.fill('#phone', '0812345678');
    await page.fill('#email', 'test@sweetlayers.com');
    
    // 4. ตรวจสอบ progress อัพเดท
    await expect(page.locator('.progress-step.active')).toHaveText(/2/);
    
    // 5. กรอกที่อยู่
    await page.fill('#address', '123 ถนนสวยงาม');
    await page.fill('#province', 'กรุงเทพมหานคร');
    await page.fill('#postal', '10110');
    
    // 6. เลือกการชำระเงิน
    await page.click('[data-payment="promptpay"]');
    await expect(page.locator('#qrSection')).toHaveClass(/show/);
    
    // 7. ตรวจสอบ validation
    await page.click('.place-order-btn');
    // ควรแจ้งเตือนเรื่อง slip upload
    await expect(page.locator('.toast')).toContainText('สลิป');
  });

  test('📱 Mobile responsiveness', async ({ page }) => {
    // 1. ทดสอบบน mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone
    
    await page.goto('http://localhost:8080');
    
    // 2. ตรวจสอบ mobile menu
    await expect(page.locator('.hamburger-btn')).toBeVisible();
    
    // 3. ทดสอบ mobile navigation
    await page.click('.hamburger-btn');
    await expect(page.locator('.mobile-menu')).toHaveClass(/show/);
    
    // 4. ทดสอบ customizer บน mobile
    await page.goto('http://localhost:8080/custom-cake.html');
    await expect(page.locator('#cakeCustomizer')).toBeVisible();
    
    // 5. ทดสอบ checkout บน mobile
    await page.goto('http://localhost:8080/checkout.html');
    await expect(page.locator('.order-summary')).toHaveCSS('position', 'static');
  });

  test('⚡ Performance metrics', async ({ page }) => {
    // 1. เก็บ performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.FID = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.CLS = entry.value;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });
    
    console.log('📊 Core Web Vitals:', metrics);
    
    // 2. ตรวจสอบ thresholds
    expect(metrics.LCP).toBeLessThan(2500); // Good LCP
    expect(metrics.FID).toBeLessThan(100);  // Good FID
    expect(metrics.CLS).toBeLessThan(0.1);  // Good CLS
  });

  test('🔧 Error handling', async ({ page }) => {
    // 1. ทดสอบ 404 page
    await page.goto('http://localhost:8080/nonexistent.html');
    await expect(page.locator('h1')).toContainText('404');
    
    // 2. ทดสอบ empty cart
    await page.goto('http://localhost:8080/cart.html');
    await page.evaluate(() => localStorage.removeItem('cart'));
    await page.reload();
    await expect(page.locator('.empty-cart')).toBeVisible();
    
    // 3. ทดสอบ form validation
    await page.goto('http://localhost:8080/checkout.html');
    await page.click('.place-order-btn');
    await expect(page.locator('.form-group.error')).toHaveCount.greaterThan(0);
  });

  test('💬 LINE integration', async ({ page }) => {
    // 1. ตรวจสอบ LINE script โหลด
    await page.goto('http://localhost:8080/checkout.html');
    
    const lineScript = await page.locator('script[src*="line-integration"]').count();
    expect(lineScript).toBeGreaterThan(0);
    
    // 2. ทดสอบ LINE Integration class
    const lineIntegrationExists = await page.evaluate(() => {
      return typeof window.LINEIntegration !== 'undefined';
    });
    expect(lineIntegrationExists).toBe(true);
    
    // 3. ทดสอบ LIFF page
    await page.goto('http://localhost:8080/line-liff.html');
    await expect(page.locator('.liff-container')).toBeVisible();
    await expect(page.locator('.quick-actions')).toHaveCount(4);
  });

  test('🎨 UI/UX interactions', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // 1. ทดสอบ hover effects
    await page.hover('[data-cake-customizer]');
    await expect(page.locator('[data-cake-customizer]')).toHaveCSS('transform', /matrix/);
    
    // 2. ทดสอบ focus states
    await page.tab();
    await expect(page.locator(':focus')).toBeVisible();
    
    // 3. ทดสอบ animations
    await page.click('[data-cake-customizer]');
    await expect(page.locator('.cake-customizer')).toBeVisible();
    
    // 4. ทดสอบ toast notifications
    await page.evaluate(() => {
      if (typeof showToast === 'function') {
        showToast('Test message', 1000);
      }
    });
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('🔒 Security & Privacy', async ({ page }) => {
    // 1. ตรวจสอบ CSP headers
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.content : null;
    });
    
    // 2. ตรวจสอบ cookie consent
    await expect(page.locator('#cookie-consent')).toBeVisible();
    
    // 3. ตรวจสอบ secure forms
    await page.goto('http://localhost:8080/checkout.html');
    const formAction = await page.locator('form').getAttribute('action');
    expect(formAction).toMatch(/^https:/);
  });

});
