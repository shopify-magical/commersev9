/**
 * Pastry Store Agentic Engine Integration
 * Connects the pastry store frontend with the agentic engine via Unix routing
 */

const BASE_URL = 'https://bizcommerz-agentic-engine.sv9.workers.dev';

export interface AgenticRecommendationRequest {
  preferences: {
    sweetness?: number;
    spiceLevel?: number;
    region?: string;
    category?: string;
    budget?: number;
  };
  context?: {
    customerId?: string;
    season?: string;
    occasion?: string;
  };
}

export interface AgenticRecommendationResponse {
  recommendations: Array<{
    productId: string;
    score: number;
    reasoning: string;
  }>;
  metadata: {
    confidence: number;
    modelVersion: string;
    processingTime: number;
  };
}

export interface AgenticOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customer: {
    id?: string;
    preferences?: Record<string, any>;
  };
  optimization: {
    enableDelivery: boolean;
    suggestAddons: boolean;
    maximizeValue: boolean;
  };
}

export interface AgenticOrderResponse {
  orderId: string;
  goalId: string;
  status: string;
  optimizations: {
    suggestedAddons?: string[];
    deliveryEstimate?: string;
    totalSavings?: number;
  };
  timestamp: number;
}

export interface AgenticInsightRequest {
  customerId: string;
  timeframe: string;
}

export interface AgenticInsightResponse {
  preferences: {
    flavorProfiles: string[];
    priceRange: string;
    purchaseFrequency: string;
  };
  predictions: {
    nextPurchasePrediction: string;
    churnRisk: string;
    lifetimeValue: number;
  };
  recommendations: string[];
  agenticAnalysis: {
    loyaltyScore: number;
    engagementScore: number;
    satisfactionScore: number;
  };
}

export class PastryStoreAgenticClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get AI-powered product recommendations
   */
  async getRecommendations(request: AgenticRecommendationRequest): Promise<AgenticRecommendationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/usr/bin/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Recommendation request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      // Fallback to local recommendations
      return this.getFallbackRecommendations(request);
    }
  }

  /**
   * Submit order with agentic optimization
   */
  async submitOrder(request: AgenticOrderRequest): Promise<AgenticOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tmp/orders/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Order submission failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to submit order:', error);
      // Fallback to basic order processing
      return this.getFallbackOrderResponse(request);
    }
  }

  /**
   * Get customer insights from agentic engine
   */
  async getCustomerInsights(customerId: string, timeframe: string = '30days'): Promise<AgenticInsightResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/home/${customerId}/insights?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Insights request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get customer insights:', error);
      // Fallback to basic insights
      return this.getFallbackInsights(customerId);
    }
  }

  /**
   * Get inventory forecast from agentic engine
   */
  async getInventoryForecast(products: string[], timeframe: string = '30days'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/var/inventory/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products, timeframe }),
      });

      if (!response.ok) {
        throw new Error(`Inventory forecast failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get inventory forecast:', error);
      return null;
    }
  }

  /**
   * Submit goal to agentic engine
   */
  async submitGoal(description: string, priority: number = 2, context?: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agentic/goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          priority,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Goal submission failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to submit goal:', error);
      return null;
    }
  }

  /**
   * Get agentic engine metrics
   */
  async getMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agentic/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Metrics request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return null;
    }
  }

  /**
   * Check system health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/bin/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Fallback recommendations when API is unavailable
   */
  private getFallbackRecommendations(request: AgenticRecommendationRequest): AgenticRecommendationResponse {
    // Return mock recommendations based on preferences
    return {
      recommendations: [
        {
          productId: 'mooncake-lotus-seed',
          score: 0.85,
          reasoning: 'Based on your sweetness preference and traditional taste'
        },
        {
          productId: 'baked-egg-tart',
          score: 0.78,
          reasoning: 'Popular choice matching your budget'
        }
      ],
      metadata: {
        confidence: 0.75,
        modelVersion: 'fallback-1.0',
        processingTime: 0
      }
    };
  }

  /**
   * Fallback order response when API is unavailable
   */
  private getFallbackOrderResponse(request: AgenticOrderRequest): AgenticOrderResponse {
    return {
      orderId: `order_${Date.now()}`,
      goalId: `goal_${Date.now()}`,
      status: 'processing',
      optimizations: {
        suggestedAddons: request.optimization.suggestAddons ? ['tea-pu-erh'] : undefined,
        deliveryEstimate: request.optimization.enableDelivery ? '2-3 days' : undefined,
      },
      timestamp: Date.now()
    };
  }

  /**
   * Fallback insights when API is unavailable
   */
  private getFallbackInsights(customerId: string): AgenticInsightResponse {
    return {
      preferences: {
        flavorProfiles: ['sweet', 'traditional'],
        priceRange: 'mid-premium',
        purchaseFrequency: 'weekly'
      },
      predictions: {
        nextPurchasePrediction: '3 days',
        churnRisk: 'low',
        lifetimeValue: 2500
      },
      recommendations: ['Try our seasonal mooncakes', 'Explore regional specialties'],
      agenticAnalysis: {
        loyaltyScore: 0.75,
        engagementScore: 0.68,
        satisfactionScore: 0.82
      }
    };
  }
}

// Export singleton instance
export const agenticClient = new PastryStoreAgenticClient();
