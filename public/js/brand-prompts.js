/**
 * UNIQUE BRAND PROMPTS - Not the Same Generic Stuff
 * 
 * Your brand: Sweet Layers - Artisan Thai-Chinese Bakery
 * Vibe: Warm, Heritage, Handcrafted, Nostalgic, Premium
 * 
 * Use prompts that describe YOUR brand, not generic "product photography"
 */

// ===== YOUR BRAND IDENTITY =====
const BRAND = {
  name: 'Sweet Layers',
  tagline: 'Artisan Thai-Chinese Bakery',
  vibe: 'warm heritage, handcrafted, nostalgic, premium',
  colors: ['golden brown', 'cream', 'deep green'],
  aesthetic: 'traditional yet modern, nostalgic comfort'
};

// These prompts describe YOUR brand specifically
const PRODUCTS = [
  // === MOONCAKES - Your Signature Item ===
  {
    name: 'Premium White Lotus Mooncake',
    prompt: 'Elegant Chinese mooncake with white lotus paste, golden-brown skin with decorative embossed pattern, soft afternoon light, nostalgic Chinese Mid-Autumn memory, warm vintage tone, handcrafted artisan feel'
  },
  {
    name: 'Double Yolk Red Bean Mooncake', 
    prompt: 'Premium mooncake sliced in half showing smooth red bean paste and two golden salted egg yolks, cozy kitchen lighting, traditional gift box beside it, warm nostalgic feel'
  },
  {
    name: 'Black Sesame Mooncake',
    prompt: 'Dark grey-black sesame mooncake with subtle shine, elegant Chinese dessert, warm amber lighting, heritage bakery presentation, sophisticated and premium'
  },
  
  // === PASTRIES - Your Daily Breads ===
  {
    name: 'Red Bean Pastry (Nankatang)',
    prompt: 'Golden flaky Chinese pastry with red bean paste visible at the edge, warm from the oven, rustic wooden counter, traditional bakery window, nostalgic Thai-Chinese comfort'
  },
  {
    name: 'Taro Coconut Roll',
    prompt: 'Purple-taro colored pastry roll, soft pillowy texture visible, warm kitchen counter, traditional Thai bakery morning, cozy nostalgic glow'
  },
  {
    name: 'Egg Tarts',
    prompt: 'Golden egg tarts with wobbly custard top, flaky Portuguese-style crust, warm amber cafe light, premium dessert display, cozy afternoon tea moment'
  },
  
  // === SWEET SOUPS ===
  {
    name: 'Mung Bean Sweet Soup',
    prompt: 'Traditional Chinese tong sui in blue-and-white ceramic bowl, mung beans visible in silky soup, warm steam rising, nostalgic grandmother kitchen, comforting dessert'
  },
  {
    name: 'Red Bean Sweet Soup',
    prompt: 'Sweet red bean soup in vintage bowl, half-open with spoon, warm comforting steam, traditional dessert nostalgia, cozy evening treat'
  },
  
  // === CAKES ===
  {
    name: 'Pandan Custard Cake',
    prompt: 'Green pandan layer cake in切片 showing distinct layers, tropical Thai ingredient, warm kitchen light, birthday moment, comfort dessert'
  },
  
  // === GIFT SETS ===
  {
    name: 'Heritage Gift Box',
    prompt: 'Luxury Chinese pastry gift box with ribbon, variety of mini pastries visible, premium gift presentation, special occasion warmth, elegant but approachable'
  },
  
  // === DRINKS ===
  {
    name: 'Thai Milk Tea',
    prompt: 'Ice Thai milk tea in glass showing signature orange-amber color, condensed milk floating, warm tropical cafe vibe, nostalgic beverage'
  },
  {
    name: 'Thai Coffee',
    prompt: 'Traditional Thai iced coffee in clear glass, dark rich coffee with milk swirled, street vendor aesthetic, Bangkok morning memory'
  }
];

// === PROMPTS FOR OTHER BUSINESS TYPES ===

const BUSINESS_PROMPTS = {
  // Coffee Shops
  'coffee-shop': {
    vibe: 'cozy neighborhood cafe, third wave, warm rustic',
    prompts: {
      'Espresso Shot': 'Rich dark espresso in white cup, golden crema, morning light through cafe window, specialty coffee shop atmosphere',
      'Latte Art': 'Beautiful latte heart in ceramic cup, specialty cafe counter, warm cozy lighting, artisan coffee moment',
      'Cold Brew': 'Cold brew coffee in glass bottle, craft coffee aesthetic, minimalist specialty cafe'
    }
  },
  
  // Boutique/Retail
  'boutique': {
    vibe: 'curated, minimalist, elevated',
    prompts: {
      'Handbag': 'Premium leather handbag, natural light studio, luxury boutique product-photography',
      'Scarf': 'Flowing silk scarf, elegant drape, luxury fabric detail, premium retail display'
    }
  },
  
  // Restaurants
  'restaurant': {
    vibe: 'farm-to-table, elevated comfort',
    prompts: {
      'Signature Pasta': 'Handmade pasta dish with sauce, rustic Italian restaurant plating, evening ambiance, warm dining',
      'Sushi Platter': 'Chef-style sushi selection, Japanese restaurant aesthetic, fresh Ingredients clarity, premium dining'
    }
  },
  
  // Vegan/Natural
  'healthy': {
    vibe: 'fresh, clean, natural, vibrant',
    prompts: {
      'Acai Bowl': 'Vibrant acai bowl with fresh fruits, natural light, health food aesthetic, clean bright colors',
      'Green Smoothie': 'Fresh green smoothie in glass, visible spinach kale, natural glowing light, healthy lifestyle moment'
    }
  },
  
  // Ceramics/Handmade
  'ceramics': {
    vibe: 'artisan, handcrafted, earthy',
    prompts: {
      'Ceramic Bowl': 'Handmade ceramic bowl showing glaze texture, natural light studio, artisan craft detail',
      'Tea Cup': 'Handcrafted tea cup, Japanese aesthetic, warm studio light, artisan pottery moment'
    }
  }
};

// Function to get prompts for a specific business type
function getBusinessPrompts(type) {
  return BUSINESS_PROMPTS[type] || null;
}

// Export
if (typeof window !== 'undefined') {
  window.BRAND = BRAND;
  window.PRODUCTS = PRODUCTS;
  window.BUSINESS_PROMPTS = BUSINESS_PROMPTS;
  window.getBusinessPrompts = getBusinessPrompts;
}