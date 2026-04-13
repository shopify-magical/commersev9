/**
 * Pastry Store Homepage
 * Main landing page for the Chinese pastry store with agentic features
 */

import React, { useState, useEffect } from 'react';
import { ChinesePastry, getPopularPastries, getSeasonalPastries } from '../../src/data/chinese-pastries';
import PastryProductCard from './PastryProductCard';
import AgenticRecommendationPanel from './AgenticRecommendationPanel';

export default function PastryStoreHomepage() {
  const [popularPastries, setPopularPastries] = useState<ChinesePastry[]>([]);
  const [seasonalPastries, setSeasonalPastries] = useState<ChinesePastry[]>([]);
  const [cart, setCart] = useState<ChinesePastry[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    setPopularPastries(getPopularPastries(6));
    setSeasonalPastries(getSeasonalPastries());
  }, []);

  const handleAddToCart = (pastry: ChinesePastry) => {
    setCart(prev => [...prev, pastry]);
    // Show toast notification
    console.log(`Added ${pastry.name.english} to cart`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-3xl">🥮</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sweet Layers</h1>
                <p className="text-xs text-gray-500">Chinese Pastry Store</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-700 hover:text-amber-600 font-medium">Home</a>
              <a href="#products" className="text-gray-700 hover:text-amber-600 font-medium">Products</a>
              <a href="#seasonal" className="text-gray-700 hover:text-amber-600 font-medium">Seasonal</a>
              <a href="#about" className="text-gray-700 hover:text-amber-600 font-medium">About</a>
            </nav>

            {/* Cart Button */}
            <button 
              onClick={() => setShowCart(!showCart)}
              className="relative bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🛒 Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Authentic Chinese Pastries
              </h2>
              <p className="text-xl mb-6 text-amber-100">
                Experience the rich tradition of Chinese pastry craftsmanship, enhanced by AI-powered recommendations
              </p>
              <div className="flex gap-4">
                <a 
                  href="#products" 
                  className="bg-white text-amber-600 hover:bg-amber-50 px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Shop Now
                </a>
                <button className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-6 py-3 rounded-lg font-bold transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="text-8xl md:text-9xl">
              🥮
            </div>
          </div>
        </div>
      </section>

      {/* Agentic Recommendations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🤖 AI-Powered Recommendations
            </h2>
            <p className="text-gray-600">
              Let our agentic engine suggest the perfect pastries for you
            </p>
          </div>
          <AgenticRecommendationPanel onAddToCart={handleAddToCart} />
        </div>
      </section>

      {/* Popular Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Popular Pastries
            </h2>
            <p className="text-gray-600">
              Our most loved traditional and modern Chinese pastries
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPastries.map(pastry => (
              <PastryProductCard 
                key={pastry.id} 
                pastry={pastry} 
                onAddToCart={handleAddToCart}
                showAgenticScore={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Specials Section */}
      <section id="seasonal" className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🌕 Seasonal Specials
            </h2>
            <p className="text-gray-600">
              Limited-time festival pastries crafted with tradition
            </p>
          </div>
          {seasonalPastries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {seasonalPastries.map(pastry => (
                <PastryProductCard 
                  key={pastry.id} 
                  pastry={pastry} 
                  onAddToCart={handleAddToCart}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No seasonal specials available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Why Choose Sweet Layers?
            </h2>
            <p className="text-gray-600">
              Traditional craftsmanship meets modern technology
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Our agentic engine provides personalized recommendations based on your preferences
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Master Craftsmen</h3>
              <p className="text-gray-600">
                Authentic recipes passed down through generations of master pastry chefs
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Ingredients</h3>
              <p className="text-gray-600">
                Only the finest quality ingredients sourced from trusted suppliers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl">🥮</div>
                <div>
                  <h3 className="text-xl font-bold">Sweet Layers</h3>
                  <p className="text-xs text-gray-400">Chinese Pastry Store</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Bringing authentic Chinese pastries to your doorstep with AI-powered convenience.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mooncakes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dim Sum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Baked Goods</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Regional</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📍 123 Pastry Street, Shanghai</li>
                <li>📞 +86 21 1234 5678</li>
                <li>✉️ hello@sweetlayers.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Sweet Layers. All rights reserved. Powered by Infinite Unix Routing & Agentic Engine.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Shopping Cart</h3>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b">
                      <div className="text-4xl">🥮</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name.english}</h4>
                        <p className="text-sm text-gray-500">{item.name.chinese}</p>
                        <p className="text-amber-600 font-bold">¥{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="text-2xl font-bold text-amber-600">¥{cartTotal.toFixed(2)}</span>
              </div>
              <button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cart.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
