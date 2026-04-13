/**
 * Customer Dashboard with AI Insights
 * Personalized dashboard showing customer analytics and agentic recommendations
 */

import React, { useState, useEffect } from 'react';
import { agenticClient } from '../../src/integration/pastry-store-agentic';

interface CustomerDashboardProps {
  customerId: string;
}

export default function CustomerDashboard({ customerId }: CustomerDashboardProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30days');

  useEffect(() => {
    loadInsights();
  }, [customerId, timeframe]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await agenticClient.getCustomerInsights(customerId, timeframe);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load customer insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Dashboard</h2>
          <p className="text-gray-600">AI-powered insights and personalized recommendations</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {/* Agentic Analysis Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Loyalty Score</span>
            <span className="text-3xl">🎯</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {(insights.agenticAnalysis.loyaltyScore * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-purple-100">
            {insights.agenticAnalysis.loyaltyScore > 0.8 ? 'Excellent' : 'Good'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-pink-100">Engagement Score</span>
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {(insights.agenticAnalysis.engagementScore * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-pink-100">
            {insights.agenticAnalysis.engagementScore > 0.7 ? 'Active' : 'Moderate'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Satisfaction Score</span>
            <span className="text-3xl">😊</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {(insights.agenticAnalysis.satisfactionScore * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-orange-100">
            {insights.agenticAnalysis.satisfactionScore > 0.85 ? 'Very Satisfied' : 'Satisfied'}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          🎨 Your Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Flavor Profiles</div>
            <div className="flex flex-wrap gap-2">
              {insights.preferences.flavorProfiles.map((profile: string, index: number) => (
                <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {profile}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Price Range</div>
            <div className="bg-gray-100 px-3 py-2 rounded-lg font-medium text-gray-900">
              {insights.preferences.priceRange}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Purchase Frequency</div>
            <div className="bg-gray-100 px-3 py-2 rounded-lg font-medium text-gray-900">
              {insights.preferences.purchaseFrequency}
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          🔮 AI Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Next Purchase</div>
            <div className="text-xl font-bold text-blue-700">
              {insights.predictions.nextPurchasePrediction}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Churn Risk</div>
            <div className={`text-xl font-bold ${insights.predictions.churnRisk === 'low' ? 'text-green-700' : 'text-orange-700'}`}>
              {insights.predictions.churnRisk}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Lifetime Value</div>
            <div className="text-xl font-bold text-purple-700">
              ¥{insights.predictions.lifetimeValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          🤖 AI Recommendations
        </h3>
        <div className="space-y-3">
          {insights.recommendations.map((recommendation: string, index: number) => (
            <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4">
              <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          📈 Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Purchased Mooncake Lotus Seed', time: '2 hours ago', type: 'purchase' },
            { action: 'Viewed Egg Tart recommendations', time: '5 hours ago', type: 'browse' },
            { action: 'Added Char Siu Bao to wishlist', time: '1 day ago', type: 'wishlist' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'purchase' ? 'bg-green-500' :
                  activity.type === 'browse' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`} />
                <span className="text-gray-700">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
