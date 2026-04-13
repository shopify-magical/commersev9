/**
 * Inventory Forecasting with Agentic AI
 * AI-powered inventory management and demand forecasting
 */

import React, { useState, useEffect } from 'react';
import { ChinesePastry, chinesePastries } from '../../src/data/chinese-pastries';
import { agenticClient } from '../../src/integration/pastry-store-agentic';

interface InventoryForecastingProps {
  onRestockRequest?: (productId: string, quantity: number) => void;
}

export default function InventoryForecasting({ onRestockRequest }: InventoryForecastingProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState('30days');
  const [forecasts, setForecasts] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const generateForecast = async () => {
    if (selectedProducts.length === 0) return;

    setLoading(true);
    try {
      const data = await agenticClient.getInventoryForecast(selectedProducts, timeframe);
      setForecasts(data);
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (currentStock: number, recommendedStock: number) => {
    const ratio = currentStock / recommendedStock;
    if (ratio < 0.3) return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
    if (ratio < 0.6) return { status: 'Low', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (ratio < 0.9) return { status: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Inventory Forecasting</h2>
          <p className="text-gray-600">AI-powered demand prediction and stock optimization</p>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Select Products to Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chinesePastries.slice(0, 12).map(pastry => (
            <label
              key={pastry.id}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                selectedProducts.includes(pastry.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedProducts.includes(pastry.id)}
                onChange={() => handleProductToggle(pastry.id)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm font-medium truncate">{pastry.name.english}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
          </select>
          <button
            onClick={generateForecast}
            disabled={selectedProducts.length === 0 || loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating Forecast...' : 'Generate AI Forecast'}
          </button>
        </div>
      </div>

      {/* Forecast Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-4 text-gray-600">AI analyzing demand patterns...</span>
        </div>
      ) : forecasts && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
              <div className="text-blue-100 text-sm mb-1">Model Version</div>
              <div className="text-2xl font-bold">{forecasts.model}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
              <div className="text-purple-100 text-sm mb-1">Products Analyzed</div>
              <div className="text-2xl font-bold">{forecasts.products.length}</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6">
              <div className="text-pink-100 text-sm mb-1">Forecast Period</div>
              <div className="text-2xl font-bold">{timeframe}</div>
            </div>
          </div>

          {/* Product Forecasts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Demand Forecasts</h3>
            <div className="space-y-4">
              {forecasts.products.map((item: any, index: number) => {
                const pastry = chinesePastries.find(p => p.id === item.productId);
                if (!pastry) return null;

                const stockStatus = getStockStatus(pastry.stock, item.forecast.recommendedStock);
                const confidencePercent = (item.forecast.confidence * 100).toFixed(0);

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{pastry.name.english}</h4>
                        <p className="text-sm text-gray-500">{pastry.name.chinese}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Current Stock</div>
                        <div className="font-bold text-gray-900">{pastry.stock}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Predicted Demand</div>
                        <div className="font-bold text-blue-600">{item.forecast.predictedDemand}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Recommended Stock</div>
                        <div className="font-bold text-purple-600">{item.forecast.recommendedStock}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">AI Confidence</div>
                        <div className="font-bold text-green-600">{confidencePercent}%</div>
                      </div>
                    </div>

                    {/* Seasonal Factor */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-600 mb-1">Seasonal Factor</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                          style={{ width: `${(item.forecast.seasonalFactor / 1.5) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.forecast.seasonalFactor > 1.2 ? 'High seasonal demand expected' : 'Normal demand expected'}
                      </div>
                    </div>

                    {/* Action Button */}
                    {stockStatus.status !== 'Good' && (
                      <button
                        onClick={() => onRestockRequest?.(pastry.id, item.forecast.recommendedStock - pastry.stock)}
                        className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Request Restock (+{item.forecast.recommendedStock - pastry.stock})
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              🧠 AI Inventory Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">Demand Patterns</div>
                <ul className="space-y-1 text-gray-600">
                  <li>• Peak demand expected for mooncakes in Q3</li>
                  <li>• Dim sum shows consistent weekly patterns</li>
                  <li>• Baked goods have higher weekend demand</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">Recommendations</div>
                <ul className="space-y-1 text-gray-600">
                  <li>• Increase mooncake stock by 40% before Mid-Autumn</li>
                  <li>• Maintain steady dim sum inventory</li>
                  <li>• Consider seasonal promotions for regional items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !forecasts && selectedProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600">Select products above to generate AI forecasts</p>
        </div>
      )}
    </div>
  );
}
