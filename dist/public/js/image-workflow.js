/**
 * PRODUCT IMAGE GENERATION WORKFLOW
 * For Sweet Layers Cake Shop
 * 
 * WORKFLOW:
 * 1. Open Mercury Forge: https://image-generator.sv9.workers.dev/
 * 2. Enter prompt describing the product
 * 3. Click FORGE CHROMIUM to generate
 * 4. Download ONLY the generated image (not screenshot with UI)
 * 
 * PROMPTS FOR CAKE SHOP PRODUCTS:
 */

const PRODUCT_PROMPTS = {
  // Mooncakes
  'Premium White Lotus Mooncake': 'Traditional Chinese mooncake with white lotus seed paste, golden brown pastry, food photography, white studio background, 4 pieces in box, professional product shot',
  'Double Yolk Red Bean Mooncake': 'Chinese mooncake with red bean paste and two golden egg yolks, cut in half showing filling, food photography, white studio background',
  'Black Sesame Mooncake': 'Chinese black sesame mooncake, dark golden-brown exterior, food photography, white studio background',
  'Mini Assorted Mooncake Set': 'Box of 6 mini assorted mooncakes, various flavors visible, gift box packaging, professional product photography',
  
  // Pastries
  'Red Bean Pastry (Nankatang)': 'Chinese red bean pastry (nankatang), flaky golden brown crust, visible red bean filling, food photography, white studio',
  'Taro Coconut Pastry': 'Taro coconut pastry, purple-taro layer visible, flaky pastry, food photography, white studio background',
  'Mini Assorted Pastry Set': 'Assorted Chinese pastries in box, variety of colors and fillings, gift packaging, professional food photography',
  
  // Egg Yolk
  'Salted Egg Yolk Fritter': 'Golden salted egg yolk fritter (khong thong), golden crispy exterior, food photography, white studio background',
  'Salted Egg Pastry': 'Pastry with salted egg yolk filling, cut showing golden yolk, food photography, white studio',
  
  // Cakes
  'Pandan Custard Cake': 'Green pandan custard cake layer cake, visible pandan layers, top view, food photography, white studio',
  'Pandan Layer Cake': 'Pandan custard layer cake, side view showing layers, food photography, white studio',
  
  // Desserts
  'Mung Bean Sweet Soup': 'Chinese mung bean sweet soup (tong sui), in bowl, topped with coconut milk, food photography',
  'Red Bean Sweet Soup': 'Red bean sweet soup (tong sui), in decorative bowl, food photography, white studio',
  
  // Gift Sets
  'Heritage Gift Box Set': 'Luxury Chinese pastry gift box, various items inside, ribbon packaging, premium product photography'
};

/**
 * IMAGE SPECIFICATIONS FOR PRODUCT PHOTOS:
 * - Aspect ratio: 1:1 (square) or 4:3
 * - Background: White (#FFFFFF) or transparent
 * - Style: Professional food/product photography
 * - Lighting: Soft, even lighting
 * - No text, logos, or UI elements in image
 * - Clean edges, no shadows
 * 
 * TO GENERATE NEW IMAGES:
 * 1. Go to https://image-generator.sv9.workers.dev/
 * 2. Type prompt from PRODUCT_PROMPTS above
 * 3. Click FORGE CHROMIUM
 * 4. Wait for generation (10-15 seconds)
 * 5. Right-click generated image → Save Image As...
 * 6. Save to public/images/ with product name
 * 7. Update shop.html productData with new image path
 */

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.PRODUCT_PROMPTS = PRODUCT_PROMPTS;
  window.IMAGE_SPECS = {
    aspectRatio: '1:1',
    background: '#FFFFFF',
    style: 'professional food photography',
    quality: 'high'
  };
}