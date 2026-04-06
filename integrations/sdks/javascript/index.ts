/**
 * Agentic Engine JavaScript SDK
 * Production-ready client for enterprise integrations
 */

export interface ClientConfig {
  baseUrl: string;
  apiKey: string;
  tenantId?: string;
  timeout?: number;
  retries?: number;
}

export interface GoalRequest {
  description: string;
  priority?: 0 | 1 | 2 | 3;
  constraints?: Record<string, unknown>;
}

export interface GoalResponse {
  goal: {
    id: string;
    description: string;
    priority: number;
    status: string;
  };
  tenantId?: string;
}

export interface MetricsResponse {
  metrics: {
    state: string;
    tasksCompleted: number;
    tasksFailed: number;
    avgDecisionTime: number;
    avgExecutionTime: number;
    knowledgeEntries: number;
    experienceCount: number;
    modelAccuracy: number;
    uptime: number;
    memoryUsage: number;
  };
  config: {
    name: string;
    tickIntervalMs: number;
  };
}

export interface UsageResponse {
  usage: Array<{
    tenantId: string;
    timestamp: number;
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
  }>;
  total: number;
}

export interface TenantInfo {
  tenant: {
    id: string;
    name: string;
    plan: 'starter' | 'professional' | 'enterprise';
    features: {
      learning: boolean;
      customActions: boolean;
      webhooks: boolean;
      analytics: boolean;
      whiteLabel: boolean;
    };
    limits: {
      requestsPerMinute: number;
      concurrentGoals: number;
      dailyGoals: number;
    };
    status: string;
  };
  usage: {
    requestsToday: number;
    rateLimit: number;
  };
}

export class AgenticEngineClient {
  private config: Required<ClientConfig>;
  private headers: Record<string, string>;

  constructor(config: ClientConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      apiKey: config.apiKey,
      tenantId: config.tenantId ?? 'default',
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 3,
    };

    this.headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          headers: { ...this.headers, ...options.headers },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(error.error ?? `HTTP ${response.status}`);
        }

        return await response.json() as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        if (attempt < this.config.retries && this.isRetryable(err)) {
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }
        
        throw lastError;
      }
    }

    throw lastError;
  }

  private isRetryable(err: unknown): boolean {
    if (err instanceof Error) {
      return err.name === 'AbortError' || err.message.includes('ECONNRESET');
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async submitGoal(request: GoalRequest): Promise<GoalResponse> {
    return this.request<GoalResponse>('/v1/goals', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getMetrics(): Promise<MetricsResponse> {
    return this.request<MetricsResponse>('/v1/metrics');
  }

  async getTenantInfo(): Promise<TenantInfo> {
    return this.request<TenantInfo>('/v1/tenants/me');
  }

  async getUsage(limit: number = 100): Promise<UsageResponse> {
    return this.request<UsageResponse>(`/v1/usage?limit=${limit}`);
  }

  async healthCheck(): Promise<{ status: string; uptime: number }> {
    return this.request<{ status: string; uptime: number }>('/health');
  }

  async registerAction(name: string, handler: (params: Record<string, unknown>) => Promise<unknown>): Promise<void> {
    console.warn('Custom actions require server-side registration');
  }
}

export function createClient(config: ClientConfig): AgenticEngineClient {
  return new AgenticEngineClient(config);
}

export const Priority = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

export default AgenticEngineClient;