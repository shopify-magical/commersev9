/**
 * Pastry Product Card Component
 * Displays Chinese pastry products with agentic recommendations
 */

import React, { useState } from 'react';
import { ChinesePastry } from '../../src/data/chinese-pastries';

interface PastryProductCardProps {
  pastry: ChinesePastry;
  onAddToCart?: (pastry: ChinesePastry) => void;
  showAgenticScore?: boolean;
  compact?: boolean;
}

export default function PastryProductCard({ 
  pastry, 
  onAddToCart, 
  showAgenticScore = true,
  compact = false 
}: PastryProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(pastry);
    }
  };

  const getSpiceLevelColor = (level: number) => {
    const colors = ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800'];
    return colors[level];
  };

  const getSweetnessLevelColor = (level: number) => {
    const colors = ['bg-gray-100 text-gray-800', 'bg-pink-100 text-pink-800', 'bg-pink-200 text-pink-900', 'bg-pink-300 text-pink-900'];
    return colors[level];
  };

  const getStockStatus = () => {
    if (pastry.stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (pastry.stock < 20) return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const stockStatus = getStockStatus();

  if (compact) {
    return (
      <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
          {pastry.images[0] ? (
            <img 
              src={pastry.images[0]} 
              alt={pastry.name.english}
              className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              loading="lazy"
            />
          ) : (
            <div className="text-4xl">🥮</div>
          )}
          {showAgenticScore && pastry.agenticMetadata.recommendationScore > 0.8 && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              AI Pick
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-900 truncate">{pastry.name.english}</h3>
          <p className="text-xs text-gray-500 truncate">{pastry.name.chinese}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-amber-600">¥{pastry.price.toFixed(2)}</span>
            <button 
              onClick={handleAddToCart}
              disabled={pastry.stock === 0}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Agentic Score Badge */}
      {showAgenticScore && pastry.agenticMetadata.recommendationScore > 0.85 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            🤖 AI Pick {(pastry.agenticMetadata.recommendationScore * 100).toFixed(0)}%
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
        {pastry.images[0] ? (
          <img 
            src={pastry.images[0]} 
            alt={pastry.name.english}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🥮
          </div>
        )}
        
        {/* Seasonal Badge */}
        {pastry.seasonal && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {pastry.season === 'mid-autumn' && '🌕 Mid-Autumn'}
            {pastry.season === 'chinese-new-year' && '🧧 CNY'}
            {pastry.season === 'dragon-boat' && '🐉 Dragon Boat'}
          </div>
        )}

        {/* Stock Status */}
        <div className={`absolute bottom-3 left-3 ${stockStatus.bg} ${stockStatus.color} text-xs font-medium px-2 py-1 rounded-full`}>
          {stockStatus.text}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Names */}
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 text-lg">{pastry.name.english}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{pastry.name.chinese}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 italic">{pastry.name.pinyin}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pastry.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pastry.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {pastry.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{pastry.tags.length - 3}</span>
          )}
        </div>

        {/* Flavor Profile */}
        <div className="flex items-center gap-3 mb-3 text-xs">
          <div className={`px-2 py-1 rounded-full ${getSweetnessLevelColor(pastry.sweetness)}`}>
            Sweetness: {pastry.sweetness}/3
          </div>
          <div className={`px-2 py-1 rounded-full ${getSpiceLevelColor(pastry.spiceLevel)}`}>
            Spice: {pastry.spiceLevel}/3
          </div>
        </div>

        {/* Agentic Insights */}
        {showAgenticScore && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 mb-3">
            <div className="text-xs text-gray-600 mb-1">🤖 AI Insights</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="text-gray-500">Satisfaction:</span>
                <span className="font-medium text-purple-700">{(pastry.agenticMetadata.customerSatisfaction * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-gray-500">Popularity:</span>
                <span className="font-medium text-pink-700">{pastry.popularity}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-amber-600">¥{pastry.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-1">CNY</span>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={pastry.stock === 0}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            {pastry.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
