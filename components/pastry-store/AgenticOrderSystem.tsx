/**
 * Agentic Order System
 * Smart ordering system with AI-powered recommendations and optimizations
 */

import React, { useState, useEffect } from 'react';
import { ChinesePastry } from '../../src/data/chinese-pastries';
import { agenticClient, AgenticOrderRequest } from '../../src/integration/pastry-store-agentic';

interface CartItem {
  pastry: ChinesePastry;
  quantity: number;
}

interface AgenticOrderSystemProps {
  items: CartItem[];
  onOrderComplete?: (orderId: string) => void;
  customerId?: string;
}

export default function AgenticOrderSystem({ 
  items, 
  onOrderComplete,
  customerId 
}: AgenticOrderSystemProps) {
  const [optimization, setOptimization] = useState({
    enableDelivery: true,
    suggestAddons: true,
    maximizeValue: true
  });
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const cartTotal = items.reduce((sum, item) => sum + (item.pastry.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (items.length > 0) {
      optimizeOrder();
    }
  }, [items, optimization]);

  const optimizeOrder = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      const request: AgenticOrderRequest = {
        items: items.map(item => ({
          productId: item.pastry.id,
          quantity: item.quantity
        })),
        customer: {
          id: customerId,
          preferences: {}
        },
        optimization
      };

      const result = await agenticClient.submitOrder(request);
      setOptimizationResult(result);
    } catch (error) {
      console.error('Order optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      if (optimizationResult) {
        // In production, this would complete the order
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (onOrderComplete) {
          onOrderComplete(optimizationResult.orderId);
        }
      }
    } catch (error) {
      console.error('Order placement failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🛒 Smart Order System
        </h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-amber-600">¥{cartTotal.toFixed(2)}</div>
          <div className="text-sm text-gray-500">{itemCount} items</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🥮</div>
                <div>
                  <div className="font-medium">{item.pastry.name.english}</div>
                  <div className="text-sm text-gray-500">{item.pastry.name.chinese}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">¥{(item.pastry.price * item.quantity).toFixed(2)}</div>
                <div className="text-sm text-gray-500">x{item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agentic Optimization Controls */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          🤖 AI Optimization Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Enable Delivery Optimization</div>
              <div className="text-sm text-gray-600">Optimize delivery route and timing</div>
            </div>
            <input
              type="checkbox"
              checked={optimization.enableDelivery}
              onChange={(e) => setOptimization(prev => ({ ...prev, enableDelivery: e.target.checked }))}
              className="w-5 h-5 text-purple-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-pink-50 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Suggest Add-ons</div>
              <div className="text-sm text-gray-600">AI-recommended complementary items</div>
            </div>
            <input
              type="checkbox"
              checked={optimization.suggestAddons}
              onChange={(e) => setOptimization(prev => ({ ...prev, suggestAddons: e.target.checked }))}
              className="w-5 h-5 text-pink-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Maximize Value</div>
              <div className="text-sm text-gray-600">Apply best available discounts and bundles</div>
            </div>
            <input
              type="checkbox"
              checked={optimization.maximizeValue}
              onChange={(e) => setOptimization(prev => ({ ...prev, maximizeValue: e.target.checked }))}
              className="w-5 h-5 text-orange-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Agentic Optimization Results */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">AI optimizing your order...</span>
        </div>
      ) : optimizationResult && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            🧠 AI Optimization Results
          </h3>
          
          {/* Suggested Add-ons */}
          {optimizationResult.optimizations.suggestedAddons && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Suggested Add-ons:</div>
              <div className="flex flex-wrap gap-2">
                {optimizationResult.optimizations.suggestedAddons.map((addon: string, index: number) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-purple-700 border border-purple-200">
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Estimate */}
          {optimizationResult.optimizations.deliveryEstimate && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Delivery Estimate:</div>
              <div className="bg-white px-3 py-2 rounded-lg text-sm font-medium text-green-700">
                🚚 {optimizationResult.optimizations.deliveryEstimate}
              </div>
            </div>
          )}

          {/* Total Savings */}
          {optimizationResult.optimizations.totalSavings && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Total Savings:</div>
              <div className="bg-white px-3 py-2 rounded-lg text-sm font-bold text-green-600">
                💰 ¥{optimizationResult.optimizations.totalSavings.toFixed(2)}
              </div>
            </div>
          )}

          {/* Goal ID */}
          <div className="mt-3 text-xs text-gray-500">
            Processing Goal ID: {optimizationResult.goalId}
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="border-t pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>¥{cartTotal.toFixed(2)}</span>
          </div>
          {optimizationResult?.optimizations.totalSavings && (
            <div className="flex justify-between text-green-600">
              <span>AI Savings</span>
              <span>-¥{optimizationResult.optimizations.totalSavings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>{optimization.enableDelivery ? '¥15.00' : 'Free Pickup'}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>
              ¥{(
                cartTotal + 
                (optimization.enableDelivery ? 15 : 0) - 
                (optimizationResult?.optimizations.totalSavings || 0)
              ).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={processing || items.length === 0}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing with AI...
            </span>
          ) : (
            'Place Order with AI Optimization'
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">
          Powered by Infinite Unix Routing & Agentic Engine
        </p>
      </div>
    </div>
  );
}
