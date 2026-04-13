/**
 * UNIVERSAL PRODUCT IMAGE PROMPT GENERATOR
 * Works for ANY business - just change the products array
 * 
 * Usage:
 * 1. Edit products list below for your business
 * 2. Open image-generator-universal.html
 * 3. Select or type your product
 * 4. Generate clean product images
 */

// ===== CHANGE THESE FOR YOUR BUSINESS =====
const BUSINESS_CONFIG = {
  name: 'Your Business Name',
  category: 'Products', // or Services, Items, etc.
  style: 'professional product photography, white studio background',
  website: 'https://your-domain.com'
};

// Add your products here
const products = [
  // FOOD & BEVERAGE
  { name: 'Fresh Bread', category: 'Bakery', prompt: 'Freshly baked bread, golden crust, artisanal bakery, food photography, white studio background' },
  { name: 'Artisan Coffee', category: 'Drinks', prompt: 'Specialty coffee in ceramic cup, latte art, coffee shop, food photography, white studio' },
  { name: 'Gourmet Pizza', category: 'Food', prompt: 'Gourmet pizza with toppings, wood-fired style, food photography, white studio background' },
  { name: 'Fresh Salad', category: 'Food', prompt: 'Healthy green salad with vegetables, food photography, white studio background, top view' },
  { name: 'Smoothie Bowl', category: 'Drinks', prompt: 'Colorful smoothie bowl with fruits and toppings, food photography, white studio' },
  
  // RETAIL
  { name: 'T-Shirt', category: 'Apparel', prompt: 'Cotton t-shirt, flat lay, white background, product photography' },
  { name: 'Sneakers', category: 'Footwear', prompt: 'Sports sneakers, white background, product photography, side view' },
  { name: 'Backpack', category: 'Accessories', prompt: 'Modern backpack, white background, product photography, front view' },
  { name: 'Watch', category: 'Accessories', prompt: 'Luxury watch, white background, product photography, close-up' },
  { name: 'Sunglasses', category: 'Accessories', prompt: 'Designer sunglasses, white background, product photography, front view' },
  
  // ELECTRONICS
  { name: 'Wireless Earbuds', category: 'Electronics', prompt: 'Wireless earbuds, white background, product photography, case open' },
  { name: 'Smart Watch', category: 'Electronics', prompt: 'Smart watch on wrist, white background, product photography' },
  { name: 'Phone Case', category: 'Electronics', prompt: 'Smartphone case, white background, product photography' },
  
  // SERVICES
  { name: 'Haircut', category: 'Services', prompt: 'Professional haircut styling, salon, photography' },
  { name: 'Manicure', category: 'Services', prompt: 'Beautiful manicure nails, nail salon, close-up photography' },
  { name: 'Massage', category: 'Services', prompt: 'Relaxing massage spa treatment, professional photography' },
  
  // DIGITAL
  { name: 'Logo Design', category: 'Design', prompt: 'Minimalist logo design on white, professional vector style' },
  { name: 'Website Mockup', category: 'Design', prompt: 'Website design mockup on laptop, clean white background, digital product' },
  { name: 'Business Cards', category: 'Design', prompt: 'Stack of business cards, white background, product photography' },
  
  // MORE PRODUCTS - Add as many as you need
  // { name: 'Product Name', category: 'Category', prompt: 'Your custom prompt here' },
];

// Generate prompts for AI image generators
function generatePrompt(productName, customPrompt = '') {
  const product = products.find(p => p.name === productName);
  const basePrompt = customPrompt || product?.prompt || '';
  
  if (customPrompt) {
    return `${customPrompt}, ${BUSINESS_CONFIG.style}`;
  }
  
  return `${productName}, ${basePrompt}`;
}

// Get products by category
function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

// Get all categories
function getCategories() {
  return [...new Set(products.map(p => p.category))];
}

// Export for global use
if (typeof window !== 'undefined') {
  window.BUSINESS_CONFIG = BUSINESS_CONFIG;
  window.products = products;
  window.generatePrompt = generatePrompt;
  window.getProductsByCategory = getProductsByCategory;
  window.getCategories = getCategories;
}