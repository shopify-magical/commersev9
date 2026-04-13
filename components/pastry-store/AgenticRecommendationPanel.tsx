/**
 * Agentic Recommendation Panel
 * AI-powered product recommendations for the Chinese pastry store
 */

import React, { useState, useEffect } from 'react';
import { ChinesePastry, getAgenticRecommendations } from '../../src/data/chinese-pastries';
import PastryProductCard from './PastryProductCard';

interface AgenticRecommendationPanelProps {
  onAddToCart?: (pastry: ChinesePastry) => void;
  customerId?: string;
}

export default function AgenticRecommendationPanel({ 
  onAddToCart, 
  customerId 
}: AgenticRecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<ChinesePastry[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    sweetness: 2,
    spiceLevel: 0,
    region: undefined as string | undefined,
    category: undefined as string | undefined,
    budget: 100
  });

  useEffect(() => {
    loadRecommendations();
  }, [preferences, customerId]);

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      // In production, this would call the agentic engine API
      // For now, we'll use the local recommendation function
      const recs = getAgenticRecommendations(preferences, 6);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤖 AI Recommendations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalized suggestions powered by our agentic engine
          </p>
        </div>
        <button 
          onClick={loadRecommendations}
          disabled={loading}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Preference Controls */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-3">Customize Your Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sweetness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sweetness Level
            </label>
            <select 
              value={preferences.sweetness}
              onChange={(e) => handlePreferenceChange('sweetness', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={0}>Not Sweet</option>
              <option value={1}>Lightly Sweet</option>
              <option value={2}>Moderately Sweet</option>
              <option value={3}>Very Sweet</option>
            </select>
          </div>

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spice Level
            </label>
            <select 
              value={preferences.spiceLevel}
              onChange={(e) => handlePreferenceChange('spiceLevel', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={0}>No Spice</option>
              <option value={1}>Mild</option>
              <option value={2}>Medium</option>
              <option value={3}>Spicy</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select 
              value={preferences.region || ''}
              onChange={(e) => handlePreferenceChange('region', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Regions</option>
              <option value="cantonese">Cantonese (粤式)</option>
              <option value="shanghai">Shanghai (沪式)</option>
              <option value="beijing">Beijing (京式)</option>
              <option value="sichuan">Sichuan (川式)</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (¥)
            </label>
            <input 
              type="number"
              value={preferences.budget}
              onChange={(e) => handlePreferenceChange('budget', parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Recommendations Grid */}
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((pastry, index) => (
                <div key={pastry.id} className="relative">
                  {/* Ranking Badge */}
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10">
                    {index + 1}
                  </div>
                  <PastryProductCard 
                    pastry={pastry} 
                    onAddToCart={onAddToCart}
                    showAgenticScore={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-gray-600">No recommendations match your preferences</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Agentic Insights */}
          {recommendations.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                🧠 AI Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-gray-600 mb-1">Recommendation Confidence</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {(recommendations[0].agenticMetadata.recommendationScore * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-pink-50 rounded-lg p-3">
                  <div className="text-gray-600 mb-1">Customer Satisfaction</div>
                  <div className="text-2xl font-bold text-pink-700">
                    {(recommendations[0].agenticMetadata.customerSatisfaction * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-gray-600 mb-1">Purchase Frequency</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {(recommendations[0].agenticMetadata.purchaseFrequency * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
