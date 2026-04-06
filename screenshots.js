/**
 * Playwright Screenshot Automation Script
 * สคริปต์ถ่ายสกรีนช็อตอัตโนมัติสำหรับ StoreGo Dashboard
 * 
 * วิธีใช้:
 * 1. npm install playwright
 * 2. npx playwright install chromium
 * 3. node screenshots.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseURL: 'https://d8c168f7.bizcommerz-cake-shop.pages.dev/dashboard.html',
  outputDir: './screenshots',
  viewport: { width: 1920, height: 1080 },
  delay: 2000, // รอ 2 วินาทีหลังโหลดหน้า
};

// Screenshot tasks - รายการหน้าที่ต้องถ่าย
const SCREENSHOTS = [
  { name: '01-dashboard-overview', action: 'dashboard', desc: 'Dashboard หน้าหลักแสดงสถิติ' },
  { name: '02-dashboard-sidebar', action: 'showSidebar', desc: 'Sidebar navigation เต็ม' },
  { name: '03-store-list', action: 'companies', desc: 'Store Management - รายการร้านค้า' },
  { name: '04-store-basic-info', action: 'storeBasicTab', desc: 'Store - Basic Info Tab' },
  { name: '05-store-domain', action: 'storeDomainTab', desc: 'Store - Domain Tab' },
  { name: '06-store-theme', action: 'storeThemeTab', desc: 'Store - Theme Tab (ธีม 12 แบบ)' },
  { name: '07-store-settings', action: 'storeSettingsTab', desc: 'Store - Settings Tab' },
  { name: '08-store-content', action: 'storeContentTab', desc: 'Store - Content Tab' },
  { name: '09-products-list', action: 'products', desc: 'Product Management - รายการสินค้า' },
  { name: '10-products-add', action: 'productsAdd', desc: 'Products - Add Product Modal' },
  { name: '11-orders-management', action: 'orders', desc: 'Order Management - รายการออเดอร์' },
  { name: '12-orders-detail', action: 'ordersDetail', desc: 'Orders - Order Detail View' },
  { name: '13-customers-list', action: 'customers', desc: 'Customer Management - รายการลูกค้า' },
  { name: '14-payment-promptpay', action: 'payment', desc: 'Payment Gateway - PromptPay' },
  { name: '15-payment-creditcard', action: 'paymentCredit', desc: 'Payment - Credit Card & Bank' },
  { name: '16-analytics-revenue', action: 'advanced-analytics', desc: 'Analytics - Revenue Charts' },
  { name: '17-analytics-payment', action: 'analyticsPayment', desc: 'Analytics - Payment Pie Chart' },
  { name: '18-api-test', action: 'api-test', desc: 'API Test Section' },
  { name: '19-image-upload', action: 'api-test-image', desc: 'API Test - Image Upload Demo' },
  { name: '20-language-toggle', action: 'api-test-lang', desc: 'API Test - Language TH/EN' },
  { name: '21-super-admin-companies', action: 'companies', desc: 'Super Admin - Companies' },
  { name: '22-super-admin-plans', action: 'super-plans', desc: 'Super Admin - Plans Management' },
  { name: '23-super-admin-settings', action: 'super-settings', desc: 'Super Admin - Global Settings' },
];

// Helper: Create output directory
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`✅ Created directory: ${CONFIG.outputDir}`);
  }
}

// Helper: Navigate and screenshot
async function takeScreenshot(page, task) {
  try {
    console.log(`📸 Taking: ${task.name} - ${task.desc}`);
    
    // Navigate based on action type
    switch (task.action) {
      case 'dashboard':
        await page.goto(CONFIG.baseURL);
        await page.waitForSelector('.stats-grid', { timeout: 10000 });
        break;
        
      case 'showSidebar':
        await page.goto(CONFIG.baseURL);
        await page.waitForSelector('.sidebar', { timeout: 10000 });
        // Scroll sidebar to show all items
        await page.evaluate(() => {
          document.querySelector('.nav').scrollTop = 0;
        });
        break;
        
      case 'companies':
      case 'products':
      case 'orders':
      case 'customers':
      case 'payment':
      case 'advanced-analytics':
      case 'api-test':
      case 'super-plans':
      case 'super-settings':
        await page.goto(CONFIG.baseURL);
        await page.waitForTimeout(1000);
        // Click menu item
        await page.evaluate((section) => {
          const items = document.querySelectorAll('.nav-item');
          items.forEach(item => {
            if (item.getAttribute('onclick')?.includes(section)) {
              item.click();
            }
          });
        }, task.action);
        await page.waitForTimeout(CONFIG.delay);
        break;
        
      case 'storeBasicTab':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('companies'));
        await page.waitForTimeout(2000);
        await page.evaluate(() => switchTab('basic'));
        break;
        
      case 'storeDomainTab':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('companies'));
        await page.waitForTimeout(2000);
        await page.evaluate(() => switchTab('domain'));
        break;
        
      case 'storeThemeTab':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('companies'));
        await page.waitForTimeout(2000);
        await page.evaluate(() => switchTab('theme'));
        break;
        
      case 'storeSettingsTab':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('companies'));
        await page.waitForTimeout(2000);
        await page.evaluate(() => switchTab('settings'));
        break;
        
      case 'storeContentTab':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('companies'));
        await page.waitForTimeout(2000);
        await page.evaluate(() => switchTab('content'));
        break;
        
      case 'productsAdd':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('products'));
        await page.waitForTimeout(2000);
        await page.evaluate(() => showAddProductModal());
        await page.waitForTimeout(1000);
        break;
        
      case 'ordersDetail':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('orders'));
        await page.waitForTimeout(2000);
        // Click first order's view button
        await page.evaluate(() => {
          const viewBtn = document.querySelector('[onclick^="viewOrder"]');
          if (viewBtn) viewBtn.click();
        });
        break;
        
      case 'paymentCredit':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('payment'));
        await page.waitForTimeout(2000);
        // Scroll to credit card section
        await page.evaluate(() => {
          const cards = document.querySelectorAll('.card');
          if (cards[1]) cards[1].scrollIntoView({ behavior: 'instant', block: 'center' });
        });
        break;
        
      case 'analyticsPayment':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showAdvancedAnalyticsSection());
        await page.waitForTimeout(2000);
        // Scroll to pie chart
        await page.evaluate(() => {
          const pieChart = document.querySelector('#paymentChart');
          if (pieChart) pieChart.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
        break;
        
      case 'api-test-image':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('api-test'));
        await page.waitForTimeout(2000);
        // Scroll to image upload section
        await page.evaluate(() => {
          const cards = document.querySelectorAll('.card');
          if (cards[1]) cards[1].scrollIntoView({ behavior: 'instant', block: 'center' });
        });
        break;
        
      case 'api-test-lang':
        await page.goto(CONFIG.baseURL);
        await page.evaluate(() => showSection('api-test'));
        await page.waitForTimeout(2000);
        // Scroll to language section
        await page.evaluate(() => {
          const cards = document.querySelectorAll('.card');
          if (cards[2]) cards[2].scrollIntoView({ behavior: 'instant', block: 'center' });
        });
        break;
    }
    
    // Wait for any animations
    await page.waitForTimeout(500);
    
    // Take screenshot
    const screenshotPath = path.join(CONFIG.outputDir, `${task.name}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false // Use viewport size
    });
    
    console.log(`✅ Saved: ${screenshotPath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed: ${task.name} - ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Screenshot Automation...\n');
  
  ensureOutputDir();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  
  // Add custom styles for better screenshots
  await page.addStyleTag({
    content: `
      /* Hide scrollbars for clean screenshots */
      ::-webkit-scrollbar { display: none !important; }
      body { overflow: -moz-scrollbars-none; -ms-overflow-style: none; }
      
      /* Ensure consistent rendering */
      * { -webkit-font-smoothing: antialiased; }
    `
  });
  
  const results = {
    success: [],
    failed: []
  };
  
  // Take all screenshots
  for (let i = 0; i < SCREENSHOTS.length; i++) {
    const task = SCREENSHOTS[i];
    console.log(`\n[${i + 1}/${SCREENSHOTS.length}] ${task.desc}`);
    
    const success = await takeScreenshot(page, task);
    if (success) {
      results.success.push(task.name);
    } else {
      results.failed.push(task.name);
    }
    
    // Small delay between screenshots
    await page.waitForTimeout(500);
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Screenshot Summary');
  console.log('='.repeat(50));
  console.log(`✅ Success: ${results.success.length}/${SCREENSHOTS.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${SCREENSHOTS.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed items:');
    results.failed.forEach(name => console.log(`  - ${name}`));
  }
  
  console.log(`\n📁 Output directory: ${path.resolve(CONFIG.outputDir)}`);
  console.log('✨ Done!\n');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
