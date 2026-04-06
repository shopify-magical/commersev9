/**
 * Enterprise API Gateway
 * Provides authentication, rate limiting, multi-tenancy, and request routing
 */

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { AgenticEngine } from '../src/orchestrator/index.js';
import { Priority, type Goal } from '../src/types/index.js';

export interface Tenant {
  id: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise';
  apiKey: string;
  limits: {
    requestsPerMinute: number;
    concurrentGoals: number;
    dailyGoals: number;
    storage: number;
  };
  features: {
    learning: boolean;
    customActions: boolean;
    webhooks: boolean;
    analytics: boolean;
    whiteLabel: boolean;
  };
  whiteLabel?: {
    brandName: string;
    logoUrl: string;
    primaryColor: string;
  };
  createdAt: number;
  status: 'active' | 'suspended' | 'trial';
}

export interface UsageRecord {
  tenantId: string;
  timestamp: number;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  goalsProcessed: number;
  tokensUsed?: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class EnterpriseGateway {
  private engine: AgenticEngine;
  private tenants: Map<string, Tenant> = new Map();
  private apiKeyToTenant: Map<string, string> = new Map();
  private usage: Map<string, UsageRecord[]> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private server: ReturnType<typeof createServer>;
  private startTime: number;

  constructor(engine: AgenticEngine) {
    this.engine = engine;
    this.startTime = Date.now();
    this.server = createServer(this.handleRequest.bind(this));
    
    this.initializeDefaultTenants();
    this.setupEventHandlers();
  }

  private initializeDefaultTenants(): void {
    const defaultTenant: Tenant = {
      id: 'default',
      name: 'Default Tenant',
      plan: 'starter',
      apiKey: 'dev_key_' + Math.random().toString(36).substr(2, 16),
      limits: {
        requestsPerMinute: 60,
        concurrentGoals: 5,
        dailyGoals: 1000,
        storage: 100 * 1024 * 1024,
      },
      features: {
        learning: true,
        customActions: true,
        webhooks: false,
        analytics: true,
        whiteLabel: false,
      },
      createdAt: Date.now(),
      status: 'active',
    };

    const enterpriseTenant: Tenant = {
      id: 'enterprise-demo',
      name: 'Enterprise Demo',
      plan: 'enterprise',
      apiKey: 'ent_key_' + Math.random().toString(36).substr(2, 16),
      limits: {
        requestsPerMinute: 1000,
        concurrentGoals: 50,
        dailyGoals: 100000,
        storage: 10 * 1024 * 1024 * 1024,
      },
      features: {
        learning: true,
        customActions: true,
        webhooks: true,
        analytics: true,
        whiteLabel: true,
      },
      whiteLabel: {
        brandName: 'Custom Brand',
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#2A6B52',
      },
      createdAt: Date.now(),
      status: 'active',
    };

    this.tenants.set(defaultTenant.id, defaultTenant);
    this.tenants.set(enterpriseTenant.id, enterpriseTenant);
    this.apiKeyToTenant.set(defaultTenant.apiKey, defaultTenant.id);
    this.apiKeyToTenant.set(enterpriseTenant.apiKey, enterpriseTenant.id);
  }

  private setupEventHandlers(): void {
    this.engine.events.on('goal:completed', (data: unknown) => {
      const goal = data as Goal;
      console.log(`[Gateway] Goal completed for tenant: ${goal.id}`);
    });
  }

  private getTenant(apiKey: string): Tenant | null {
    const tenantId = this.apiKeyToTenant.get(apiKey);
    return tenantId ? this.tenants.get(tenantId) ?? null : null;
  }

  private checkRateLimit(tenantId: string): boolean {
    const key = `ratelimit:${tenantId}`;
    const now = Date.now();
    const limit = this.tenants.get(tenantId)?.limits.requestsPerMinute ?? 60;
    
    let entry = this.rateLimits.get(key);
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + 60000 };
      this.rateLimits.set(key, entry);
    }

    entry.count++;
    return entry.count <= limit;
  }

  private recordUsage(tenantId: string, record: UsageRecord): void {
    const key = `usage:${tenantId}`;
    const records = this.usage.get(key) ?? [];
    records.push(record);
    
    if (records.length > 10000) {
      records.shift();
    }
    this.usage.set(key, records);
  }

  private authenticate(req: IncomingMessage): { tenant: Tenant | null; error: string | null } {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    let key = '';
    if (authHeader?.startsWith('Bearer ')) {
      key = authHeader.substring(7);
    } else if (apiKey) {
      key = apiKey;
    }

    if (!key) {
      return { tenant: null, error: 'Missing API key' };
    }

    const tenant = this.getTenant(key);
    if (!tenant) {
      return { tenant: null, error: 'Invalid API key' };
    }

    if (tenant.status === 'suspended') {
      return { tenant: null, error: 'Tenant suspended' };
    }

    if (!this.checkRateLimit(tenant.id)) {
      return { tenant: null, error: 'Rate limit exceeded' };
    }

    return { tenant, error: null };
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const startTime = Date.now();
    const method = req.method ?? 'GET';
    const url = req.url ?? '/';

    res.setHeader('X-Powered-By', 'AgenticEngine-Enterprise/1.0');
    res.setHeader('Content-Type', 'application/json');

    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      res.writeHead(204);
      res.end();
      return;
    }

    if (url === '/health' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'healthy', uptime: Date.now() - this.startTime }));
      return;
    }

    const { tenant, error } = this.authenticate(req);
    
    if (error) {
      res.writeHead(401);
      res.end(JSON.stringify({ error }));
      return;
    }

    const tenantId = tenant!.id;
    const isWhiteLabel = tenant!.features.whiteLabel && tenant!.whiteLabel;

    if (isWhiteLabel) {
      res.setHeader('X-Tenant-Name', tenant!.whiteLabel!.brandName);
    }

    this.recordUsage(tenantId, {
      tenantId,
      timestamp: Date.now(),
      endpoint: url,
      method,
      responseTime: 0,
      statusCode: 200,
      goalsProcessed: 0,
    });

    if (url === '/v1/goals' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { description, priority, constraints } = JSON.parse(body);
          
          if (!description) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Description required' }));
            return;
          }

          const goalsLimit = tenant!.limits.dailyGoals;
          const currentUsage = this.usage.get(`usage:${tenantId}`)?.length ?? 0;
          
          if (currentUsage >= goalsLimit) {
            res.writeHead(429);
            res.end(JSON.stringify({ error: 'Daily goal limit exceeded' }));
            return;
          }

          const goal = this.engine.submitGoal(description, priority ?? Priority.MEDIUM, constraints ?? {});
          
          res.writeHead(201);
          res.end(JSON.stringify({
            goal: {
              id: goal.id,
              description: goal.description,
              priority: goal.priority,
              status: 'pending',
            },
            tenantId,
            whiteLabel: isWhiteLabel ? tenant!.whiteLabel : undefined,
          }));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/v1/metrics' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      res.writeHead(200);
      res.end(JSON.stringify({
        metrics,
        tenant: {
          id: tenantId,
          plan: tenant!.plan,
          features: tenant!.features,
        },
      }));
      return;
    }

    if (url === '/v1/tenants/me' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        tenant: {
          id: tenantId,
          name: tenant!.name,
          plan: tenant!.plan,
          features: tenant!.features,
          limits: tenant!.limits,
          status: tenant!.status,
          whiteLabel: tenant!.whiteLabel,
        },
        usage: {
          requestsToday: this.usage.get(`usage:${tenantId}`)?.length ?? 0,
          rateLimit: tenant!.limits.requestsPerMinute,
        },
      }));
      return;
    }

    if (url === '/v1/usage' && method === 'GET') {
      const usage = this.usage.get(`usage:${tenantId}`) ?? [];
      res.writeHead(200);
      res.end(JSON.stringify({
        usage: usage.slice(-100),
        total: usage.length,
      }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  start(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        console.log(`[Gateway] Enterprise API Gateway running on port ${port}`);
        console.log(`[Gateway] Default tenant API key: ${this.tenants.get('default')?.apiKey}`);
        resolve();
      });
    });
  }

  registerTenant(tenant: Tenant): void {
    this.tenants.set(tenant.id, tenant);
    this.apiKeyToTenant.set(tenant.apiKey, tenant.id);
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  updateTenantLimits(tenantId: string, limits: Partial<Tenant['limits']>): void {
    const tenant = this.tenants.get(tenantId);
    if (tenant) {
      tenant.limits = { ...tenant.limits, ...limits };
    }
  }

  suspendTenant(tenantId: string): void {
    const tenant = this.tenants.get(tenantId);
    if (tenant) {
      tenant.status = 'suspended';
    }
  }

  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  getUsageStats(tenantId: string): { total: number; byEndpoint: Map<string, number> } {
    const usage = this.usage.get(`usage:${tenantId}`) ?? [];
    const byEndpoint = new Map<string, number>();
    
    for (const record of usage) {
      const count = byEndpoint.get(record.endpoint) ?? 0;
      byEndpoint.set(record.endpoint, count + 1);
    }

    return { total: usage.length, byEndpoint };
  }
}

export default EnterpriseGateway;