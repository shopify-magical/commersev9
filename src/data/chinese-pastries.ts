/**
 * Chinese Pastry Product Catalog
 * Complete product database for the pastry store with agentic metadata
 */

export interface ChinesePastry {
  id: string;
  name: {
    english: string;
    chinese: string;
    pinyin: string;
  };
  category: PastryCategory;
  region: PastryRegion;
  description: string;
  ingredients: string[];
  price: number;
  currency: string;
  images: string[];
  tags: string[];
  seasonal: boolean;
  season?: Season;
  spiceLevel: 0 | 1 | 2 | 3;
  sweetness: 0 | 1 | 2 | 3;
  popularity: number;
  stock: number;
  agenticMetadata: AgenticMetadata;
}

export type PastryCategory = 
  | 'mooncake'
  | 'dim-sum'
  | 'baked-goods'
  | 'traditional'
  | 'regional'
  | 'festival'
  | 'daily';

export type PastryRegion =
  | 'cantonese'
  | 'shanghai'
  | 'beijing'
  | 'sichuan'
  | 'hunan'
  | 'fujian'
  | 'international';

export type Season =
  | 'mid-autumn'
  | 'chinese-new-year'
  | 'dragon-boat'
  | 'winter-solstice'
  | 'spring-festival';

export interface AgenticMetadata {
  recommendationScore: number;
  purchaseFrequency: number;
  customerSatisfaction: number;
  inventoryTurnover: number;
  seasonalDemand: number[];
  complementaryProducts: string[];
  targetDemographics: string[];
  occasions: string[];
}

export const chinesePastries: ChinesePastry[] = [
  // Mooncakes (月饼)
  {
    id: 'mooncake-lotus-seed',
    name: {
      english: 'Lotus Seed Paste Mooncake',
      chinese: '莲蓉月饼',
      pinyin: 'lián róng yuè bǐng'
    },
    category: 'mooncake',
    region: 'cantonese',
    description: 'Traditional mooncake with smooth lotus seed paste filling, encased in golden pastry crust. A symbol of reunion and completeness.',
    ingredients: ['lotus seed paste', 'flour', 'sugar', 'vegetable oil', 'salted egg yolk'],
    price: 45.00,
    currency: 'CNY',
    images: ['/images/mooncake-lotus.jpg'],
    tags: ['traditional', 'festival', 'gift', 'premium'],
    seasonal: true,
    season: 'mid-autumn',
    spiceLevel: 0,
    sweetness: 2,
    popularity: 95,
    stock: 150,
    agenticMetadata: {
      recommendationScore: 0.92,
      purchaseFrequency: 0.85,
      customerSatisfaction: 0.94,
      inventoryTurnover: 0.78,
      seasonalDemand: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0, 0.6, 0.3],
      complementaryProducts: ['tea-pu-erh', 'mooncake-five-kernel', 'mooncake-egg-yolk'],
      targetDemographics: ['families', 'gift-givers', 'traditionalists'],
      occasions: ['mid-autumn-festival', 'family-gathering', 'corporate-gifting']
    }
  },
  {
    id: 'mooncake-five-kernel',
    name: {
      english: 'Five Kernel Mooncake',
      chinese: '五仁月饼',
      pinyin: 'wǔ rén yuè bǐng'
    },
    category: 'mooncake',
    region: 'cantonese',
    description: 'Traditional mooncake filled with five types of nuts and seeds, offering a rich, nutty flavor and crunchy texture.',
    ingredients: ['walnuts', 'almonds', 'sesame seeds', 'pumpkin seeds', 'peanuts', 'flour', 'sugar'],
    price: 42.00,
    currency: 'CNY',
    images: ['/images/mooncake-five-kernel.jpg'],
    tags: ['traditional', 'nutty', 'crunchy'],
    seasonal: true,
    season: 'mid-autumn',
    spiceLevel: 0,
    sweetness: 1,
    popularity: 75,
    stock: 120,
    agenticMetadata: {
      recommendationScore: 0.78,
      purchaseFrequency: 0.65,
      customerSatisfaction: 0.82,
      inventoryTurnover: 0.65,
      seasonalDemand: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.9, 0.95, 0.5, 0.25],
      complementaryProducts: ['tea-green', 'mooncake-lotus-seed'],
      targetDemographics: ['elderly', 'traditionalists', 'nut-lovers'],
      occasions: ['mid-autumn-festival', 'family-gathering']
    }
  },
  {
    id: 'mooncake-egg-yolk',
    name: {
      english: 'Salted Egg Yolk Mooncake',
      chinese: '蛋黄月饼',
      pinyin: 'dàn huáng yuè bǐng'
    },
    category: 'mooncake',
    region: 'cantonese',
    description: 'Rich mooncake featuring savory salted egg yolks surrounded by sweet lotus paste, creating a perfect sweet-savory balance.',
    ingredients: ['salted egg yolks', 'lotus seed paste', 'flour', 'sugar', 'vegetable oil'],
    price: 48.00,
    currency: 'CNY',
    images: ['/images/mooncake-egg-yolk.jpg'],
    tags: ['premium', 'savory-sweet', 'traditional'],
    seasonal: true,
    season: 'mid-autumn',
    spiceLevel: 0,
    sweetness: 2,
    popularity: 88,
    stock: 100,
    agenticMetadata: {
      recommendationScore: 0.85,
      purchaseFrequency: 0.72,
      customerSatisfaction: 0.89,
      inventoryTurnover: 0.72,
      seasonalDemand: [0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.93, 0.98, 0.55, 0.28],
      complementaryProducts: ['tea-oolong', 'mooncake-lotus-seed'],
      targetDemographics: ['connoisseurs', 'gift-givers', 'foodies'],
      occasions: ['mid-autumn-festival', 'corporate-gifting', 'premium-gifts']
    }
  },
  {
    id: 'mooncake-snow-skin',
    name: {
      english: 'Snow Skin Mooncake',
      chinese: '冰皮月饼',
      pinyin: 'bīng pí yuè bǐng'
    },
    category: 'mooncake',
    region: 'international',
    description: 'Modern variation with soft, translucent skin and various fillings. No-bake, refrigerated, and visually stunning.',
    ingredients: ['glutinous rice flour', 'mango paste', 'custard', 'fruit', 'sugar'],
    price: 52.00,
    currency: 'CNY',
    images: ['/images/mooncake-snow-skin.jpg'],
    tags: ['modern', 'no-bake', 'colorful', 'premium'],
    seasonal: true,
    season: 'mid-autumn',
    spiceLevel: 0,
    sweetness: 3,
    popularity: 82,
    stock: 80,
    agenticMetadata: {
      recommendationScore: 0.81,
      purchaseFrequency: 0.68,
      customerSatisfaction: 0.87,
      inventoryTurnover: 0.70,
      seasonalDemand: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0, 0.6, 0.3],
      complementaryProducts: ['tea-jasmine', 'mango-pudding'],
      targetDemographics: ['young-adults', 'modern-traditionalists', 'gift-givers'],
      occasions: ['mid-autumn-festival', 'modern-celebrations', 'gift-giving']
    }
  },

  // Dim Sum (点心)
  {
    id: 'dim-sum-har-gow',
    name: {
      english: 'Shrimp Dumplings (Har Gow)',
      chinese: '虾饺',
      pinyin: 'xiā jiǎo'
    },
    category: 'dim-sum',
    region: 'cantonese',
    description: 'Translucent dumplings filled with succulent shrimp, bamboo shoots, and seasonings. A dim sum classic.',
    ingredients: ['shrimp', 'bamboo shoots', 'wheat starch', 'tapioca starch', 'seasonings'],
    price: 28.00,
    currency: 'CNY',
    images: ['/images/har-gow.jpg'],
    tags: ['classic', 'seafood', 'dim-sum'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 0,
    popularity: 90,
    stock: 200,
    agenticMetadata: {
      recommendationScore: 0.88,
      purchaseFrequency: 0.75,
      customerSatisfaction: 0.91,
      inventoryTurnover: 0.82,
      seasonalDemand: [0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85],
      complementaryProducts: ['dim-sum-siu-mai', 'tea-pu-erh'],
      targetDemographics: ['families', 'dim-sum-lovers', 'seafood-lovers'],
      occasions: ['dim-sum-brunch', 'family-gathering', 'weekend-treat']
    }
  },
  {
    id: 'dim-sum-siu-mai',
    name: {
      english: 'Pork and Shrimp Dumplings (Siu Mai)',
      chinese: '烧卖',
      pinyin: 'shāo mài'
    },
    category: 'dim-sum',
    region: 'cantonese',
    description: 'Open-topped dumplings filled with pork, shrimp, and mushrooms, topped with roe or carrot.',
    ingredients: ['pork', 'shrimp', 'mushrooms', 'wonton wrappers', 'seasonings'],
    price: 26.00,
    currency: 'CNY',
    images: ['/images/siu-mai.jpg'],
    tags: ['classic', 'savory', 'dim-sum'],
    seasonal: false,
    spiceLevel: 1,
    sweetness: 0,
    popularity: 88,
    stock: 180,
    agenticMetadata: {
      recommendationScore: 0.86,
      purchaseFrequency: 0.73,
      customerSatisfaction: 0.89,
      inventoryTurnover: 0.80,
      seasonalDemand: [0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85],
      complementaryProducts: ['dim-sum-har-gow', 'tea-oolong'],
      targetDemographics: ['families', 'dim-sum-lovers'],
      occasions: ['dim-sum-brunch', 'casual-dining']
    }
  },
  {
    id: 'dim-sum-char-siu-bao',
    name: {
      english: 'BBQ Pork Buns (Char Siu Bao)',
      chinese: '叉烧包',
      pinyin: 'chā shāo bāo'
    },
    category: 'dim-sum',
    region: 'cantonese',
    description: 'Fluffy steamed buns filled with sweet and savory BBQ pork. A Hong Kong dim sum staple.',
    ingredients: ['bbq pork', 'flour', 'sugar', 'yeast', 'hoisin sauce', 'oyster sauce'],
    price: 22.00,
    currency: 'CNY',
    images: ['/images/char-siu-bao.jpg'],
    tags: ['classic', 'savory-sweet', 'popular'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 2,
    popularity: 92,
    stock: 220,
    agenticMetadata: {
      recommendationScore: 0.90,
      purchaseFrequency: 0.80,
      customerSatisfaction: 0.93,
      inventoryTurnover: 0.85,
      seasonalDemand: [0.85, 0.9, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.9],
      complementaryProducts: ['tea-pu-erh', 'dim-sum-har-gow'],
      targetDemographics: ['everyone', 'families', 'casual-diners'],
      occasions: ['breakfast', 'brunch', 'snack', 'any-time']
    }
  },

  // Baked Goods (烘焙)
  {
    id: 'baked-egg-tart',
    name: {
      english: 'Portuguese Egg Tart',
      chinese: '蛋挞',
      pinyin: 'dàn tà'
    },
    category: 'baked-goods',
    region: 'international',
    description: 'Crisp pastry shell filled with smooth egg custard, slightly caramelized on top. Portuguese-Chinese fusion.',
    ingredients: ['eggs', 'sugar', 'milk', 'flour', 'butter'],
    price: 18.00,
    currency: 'CNY',
    images: ['/images/egg-tart.jpg'],
    tags: ['popular', 'sweet', 'portuguese'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 3,
    popularity: 94,
    stock: 250,
    agenticMetadata: {
      recommendationScore: 0.92,
      purchaseFrequency: 0.85,
      customerSatisfaction: 0.95,
      inventoryTurnover: 0.88,
      seasonalDemand: [0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85],
      complementaryProducts: ['coffee', 'tea-milk'],
      targetDemographics: ['everyone', 'sweet-tooth', 'coffee-lovers'],
      occasions: ['breakfast', 'afternoon-tea', 'dessert', 'snack']
    }
  },
  {
    id: 'baked-pineapple-bun',
    name: {
      english: 'Pineapple Bun (Bo Lo Bao)',
      chinese: '菠萝包',
      pinyin: 'bō luó bāo'
    },
    category: 'baked-goods',
    region: 'cantonese',
    description: 'Sweet bun with crunchy, sugary topping resembling pineapple skin. No actual pineapple in traditional recipe.',
    ingredients: ['flour', 'sugar', 'butter', 'eggs', 'milk'],
    price: 15.00,
    currency: 'CNY',
    images: ['/images/pineapple-bun.jpg'],
    tags: ['classic', 'sweet', 'breakfast'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 2,
    popularity: 87,
    stock: 200,
    agenticMetadata: {
      recommendationScore: 0.84,
      purchaseFrequency: 0.70,
      customerSatisfaction: 0.88,
      inventoryTurnover: 0.78,
      seasonalDemand: [0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85],
      complementaryProducts: ['tea-milk', 'butter'],
      targetDemographics: ['everyone', 'breakfast-lovers'],
      occasions: ['breakfast', 'snack', 'tea-time']
    }
  },
  {
    id: 'baked-wife-cake',
    name: {
      english: 'Wife Cake (Sweet Pastry)',
      chinese: '老婆饼',
      pinyin: 'lǎo pó bǐng'
    },
    category: 'baked-goods',
    region: 'cantonese',
    description: 'Flaky pastry filled with sweet winter melon paste. Named for its shape resembling a wife's smiling face.',
    ingredients: ['winter melon paste', 'flour', 'sugar', 'lard'],
    price: 16.00,
    currency: 'CNY',
    images: ['/images/wife-cake.jpg'],
    tags: ['traditional', 'sweet', 'flaky'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 2,
    popularity: 78,
    stock: 150,
    agenticMetadata: {
      recommendationScore: 0.76,
      purchaseFrequency: 0.62,
      customerSatisfaction: 0.80,
      inventoryTurnover: 0.68,
      seasonalDemand: [0.75, 0.8, 0.85, 0.8, 0.75, 0.7, 0.65, 0.7, 0.75, 0.8, 0.85, 0.8],
      complementaryProducts: ['tea-oolong', 'baked-egg-tart'],
      targetDemographics: ['traditionalists', 'sweet-tooth'],
      occasions: ['tea-time', 'snack', 'gift']
    }
  },

  // Traditional Pastries
  {
    id: 'traditional-egg-roll',
    name: {
      english: 'Chinese Egg Roll',
      chinese: '蛋卷',
      pinyin: 'dàn juǎn'
    },
    category: 'traditional',
    region: 'cantonese',
    description: 'Crispy, hollow egg rolls made from eggs, sugar, and flour. Light, airy, and delicately sweet.',
    ingredients: ['eggs', 'sugar', 'flour', 'butter'],
    price: 25.00,
    currency: 'CNY',
    images: ['/images/egg-roll.jpg'],
    tags: ['crispy', 'light', 'traditional'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 2,
    popularity: 83,
    stock: 180,
    agenticMetadata: {
      recommendationScore: 0.82,
      purchaseFrequency: 0.68,
      customerSatisfaction: 0.86,
      inventoryTurnover: 0.75,
      seasonalDemand: [0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85],
      complementaryProducts: ['tea-jasmine', 'traditional-almond-cookie'],
      targetDemographics: ['elderly', 'traditionalists', 'gift-givers'],
      occasions: ['gift-giving', 'tea-time', 'festival']
    }
  },
  {
    id: 'traditional-almond-cookie',
    name: {
      english: 'Almond Cookie',
      chinese: '杏仁饼',
      pinyin: 'xìng rén bǐng'
    },
    category: 'traditional',
    region: 'cantonese',
    description: 'Crumbly, nutty cookies made with almond flour and mung bean filling. Classic Chinese pastry.',
    ingredients: ['almond flour', 'mung bean paste', 'sugar', 'lard'],
    price: 20.00,
    currency: 'CNY',
    images: ['/images/almond-cookie.jpg'],
    tags: ['nutty', 'crumbly', 'traditional'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 2,
    popularity: 80,
    stock: 160,
    agenticMetadata: {
      recommendationScore: 0.79,
      purchaseFrequency: 0.65,
      customerSatisfaction: 0.84,
      inventoryTurnover: 0.72,
      seasonalDemand: [0.75, 0.8, 0.85, 0.8, 0.75, 0.7, 0.65, 0.7, 0.75, 0.8, 0.85, 0.8],
      complementaryProducts: ['tea-green', 'traditional-egg-roll'],
      targetDemographics: ['elderly', 'traditionalists', 'nut-lovers'],
      occasions: ['gift-giving', 'tea-time', 'festival']
    }
  },

  // Regional Specialties
  {
    id: 'regional-scallion-pancake',
    name: {
      english: 'Shanghai Scallion Pancake',
      chinese: '葱油饼',
      pinyin: 'cōng yóu bǐng'
    },
    category: 'regional',
    region: 'shanghai',
    description: 'Flaky, multi-layered pancake with scallions and oil. Pan-fried to golden perfection.',
    ingredients: ['flour', 'scallions', 'oil', 'salt'],
    price: 12.00,
    currency: 'CNY',
    images: ['/images/scallion-pancake.jpg'],
    tags: ['savory', 'flaky', 'shanghai'],
    seasonal: false,
    spiceLevel: 1,
    sweetness: 0,
    popularity: 85,
    stock: 200,
    agenticMetadata: {
      recommendationScore: 0.83,
      purchaseFrequency: 0.70,
      customerSatisfaction: 0.87,
      inventoryTurnover: 0.80,
      seasonalDemand: [0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85],
      complementaryProducts: ['soy-milk', 'tea-green'],
      targetDemographics: ['everyone', 'savory-lovers'],
      occasions: ['breakfast', 'snack', 'street-food']
    }
  },
  {
    id: 'regional-soup-dumpling',
    name: {
      english: 'Shanghai Soup Dumpling (Xiao Long Bao)',
      chinese: '小笼包',
      pinyin: 'xiǎo lóng bāo'
    },
    category: 'regional',
    region: 'shanghai',
    description: 'Delicate dumplings filled with pork and hot soup. Burst with flavor when bitten.',
    ingredients: ['pork', 'gelatin', 'flour', 'scallions', 'ginger'],
    price: 32.00,
    currency: 'CNY',
    images: ['/images/soup-dumpling.jpg'],
    tags: ['specialty', 'soup-filled', 'shanghai'],
    seasonal: false,
    spiceLevel: 1,
    sweetness: 0,
    popularity: 93,
    stock: 150,
    agenticMetadata: {
      recommendationScore: 0.91,
      purchaseFrequency: 0.78,
      customerSatisfaction: 0.94,
      inventoryTurnover: 0.86,
      seasonalDemand: [0.85, 0.9, 0.9, 0.85, 0.8, 0.75, 0.7, 0.75, 0.8, 0.85, 0.9, 0.9],
      complementaryProducts: ['vinegar', 'ginger', 'tea-black'],
      targetDemographics: ['foodies', 'connoisseurs', 'tourists'],
      occasions: ['special-dining', 'weekend-treat', 'foodie-experience']
    }
  },
  {
    id: 'regional-walnut-cake',
    name: {
      english: 'Beijing Walnut Cake',
      chinese: '核桃酥',
      pinyin: 'hé táo sū'
    },
    category: 'regional',
    region: 'beijing',
    description: 'Crisp, crumbly pastry filled with walnut paste. Traditional Beijing snack.',
    ingredients: ['walnuts', 'flour', 'sugar', 'lard'],
    price: 18.00,
    currency: 'CNY',
    images: ['/images/walnut-cake.jpg'],
    tags: ['nutty', 'crisp', 'beijing'],
    seasonal: false,
    spiceLevel: 0,
    sweetness: 2,
    popularity: 72,
    stock: 140,
    agenticMetadata: {
      recommendationScore: 0.74,
      purchaseFrequency: 0.58,
      customerSatisfaction: 0.78,
      inventoryTurnover: 0.65,
      seasonalDemand: [0.7, 0.75, 0.8, 0.75, 0.7, 0.65, 0.6, 0.65, 0.7, 0.75, 0.8, 0.75],
      complementaryProducts: ['tea-jasmine', 'traditional-almond-cookie'],
      targetDemographics: ['elderly', 'traditionalists', 'nut-lovers'],
      occasions: ['gift-giving', 'tea-time']
    }
  }
];

/**
 * Get pastries by category
 */
export function getPastriesByCategory(category: PastryCategory): ChinesePastry[] {
  return chinesePastries.filter(pastry => pastry.category === category);
}

/**
 * Get pastries by region
 */
export function getPastriesByRegion(region: PastryRegion): ChinesePastry[] {
  return chinesePastries.filter(pastry => pastry.region === region);
}

/**
 * Get seasonal pastries
 */
export function getSeasonalPastries(): ChinesePastry[] {
  return chinesePastries.filter(pastry => pastry.seasonal);
}

/**
 * Get popular pastries
 */
export function getPopularPastries(limit: number = 10): ChinesePastry[] {
  return chinesePastries
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search pastries by tags
 */
export function searchPastriesByTags(tags: string[]): ChinesePastry[] {
  return chinesePastries.filter(pastry =>
    tags.some(tag => pastry.tags.includes(tag))
  );
}

/**
 * Get agentic recommendations based on preferences
 */
export function getAgenticRecommendations(
  preferences: {
    sweetness?: number;
    spiceLevel?: number;
    region?: PastryRegion;
    category?: PastryCategory;
    budget?: number;
  },
  limit: number = 5
): ChinesePastry[] {
  let scored = chinesePastries.map(pastry => {
    let score = pastry.agenticMetadata.recommendationScore;
    
    // Sweetness preference
    if (preferences.sweetness !== undefined) {
      const sweetnessDiff = Math.abs(pastry.sweetness - preferences.sweetness);
      score -= sweetnessDiff * 0.1;
    }
    
    // Spice level preference
    if (preferences.spiceLevel !== undefined) {
      const spiceDiff = Math.abs(pastry.spiceLevel - preferences.spiceLevel);
      score -= spiceDiff * 0.1;
    }
    
    // Region preference
    if (preferences.region && pastry.region === preferences.region) {
      score += 0.15;
    }
    
    // Category preference
    if (preferences.category && pastry.category === preferences.category) {
      score += 0.15;
    }
    
    // Budget constraint
    if (preferences.budget && pastry.price > preferences.budget) {
      score -= 0.5;
    }
    
    return { pastry, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.pastry);
}
