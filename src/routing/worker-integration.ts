/**
 * Worker Integration for Infinite Unix Routing
 * 
 * Integrates the infinite Unix router with Cloudflare Workers
 */

import { router, UnixMiddleware, AgenticRouter } from './infinite-router.js';
import { registerUnixRoutes, getRouteDocumentation, getRouteTree } from './unix-routes.js';
import { AgenticEngine } from '../orchestrator/index.js';
import { AuthService } from '../auth/auth-service.js';

export interface Env {
  QUOTES_KV: KVNamespace;
  ORDERS_KV: KVNamespace;
  ENGINE_STATE: DurableObjectNamespace;
  USERS_KV: KVNamespace;
  TENANTS_KV: KVNamespace;
  SESSIONS_KV: KVNamespace;
  API_TOKEN?: string;
  ENGINE_NAME?: string;
  LOG_LEVEL?: string;
  ENABLE_LEARNING?: string;
}

// Engine singleton
let engine: AgenticEngine | null = null;
let agenticRouter: AgenticRouter | null = null;

/**
 * Initialize engine and router
 */
function initialize(env: Env): void {
  if (!engine) {
    engine = new AgenticEngine({
      name: env.ENGINE_NAME || 'UnixRoutingEngine',
      tickIntervalMs: 5000,
      logLevel: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      enableLearning: env.ENABLE_LEARNING !== 'false',
      enableSelfImprovement: true,
    });
    engine.start().catch(console.error);
  }

  if (!agenticRouter) {
    agenticRouter = new AgenticRouter();
    router.setAgenticEngine(agenticRouter);
  }

  // Register Unix routes
  registerUnixRoutes();
  
  // Register legacy routes for backward compatibility
  registerLegacyRoutes(env);
}

/**
 * Register legacy routes for backward compatibility
 */
function registerLegacyRoutes(env: Env): void {
  // Legacy health endpoint
  router.register({
    path: '/health',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        status: engine?.isRunning() ? 'healthy' : 'stopped',
        timestamp: Date.now(),
        version: '2.0.0',
        service: 'Infinite Unix Routing Gateway',
        routing: 'unix-hierarchical'
      });
    },
    meta: { category: 'bin', description: 'Legacy health check', version: '2.0.0' }
  });

  // Legacy agentic endpoints
  router.register({
    path: '/api/agentic/goal',
    method: 'POST',
    handler: async (req, ctx) => {
      if (!engine) {
        return Response.json({ error: 'Engine not initialized' }, { status: 500 });
      }
      const body = await req.json();
      const priorityMap: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityNum = priorityMap[String(body.priority).toLowerCase()] || 2;
      const goal = engine.submitGoal(body.description, priorityNum, { ...body.context, source: 'frontend' });
      return Response.json({
        goalId: goal.id,
        description: goal.description,
        priority: goal.priority,
        status: 'submitted',
        timestamp: Date.now()
      });
    },
    meta: { category: 'usr', description: 'Legacy goal submission', version: '2.0.0' }
  });

  router.register({
    path: '/api/agentic/metrics',
    method: 'GET',
    handler: async (req, ctx) => {
      if (!engine) {
        return Response.json({ error: 'Engine not initialized' }, { status: 500 });
      }
      const metrics = engine.getMetrics();
      const learning = engine.learning.getStats();
      return Response.json({
        engine: {
          running: engine.isRunning(),
          tickCount: metrics.state === 'PERCEIVING' ? Date.now() % 1000 : 0,
          uptime: metrics.uptime
        },
        performance: {
          tasksCompleted: metrics.tasksCompleted,
          tasksFailed: metrics.tasksFailed,
          avgDecisionTime: metrics.avgDecisionTime,
          knowledgeEntries: metrics.knowledgeEntries,
          experiences: metrics.experienceCount,
          modelAccuracy: metrics.modelAccuracy
        },
        learning: {
          successRate: learning.successRate,
          avgReward: learning.avgReward,
          total: learning.total
        },
        timestamp: Date.now()
      });
    },
    meta: { category: 'var', description: 'Legacy metrics endpoint', version: '2.0.0' }
  });

  // Legacy authentication
  router.register({
    path: '/auth/token',
    method: 'POST',
    handler: async (req, ctx) => {
      const authService = new AuthService(env);
      try {
        const body = await req.json();
        const result = await authService.authenticateWithToken(body.token);
        return Response.json(result, { status: result.success ? 200 : 401 });
      } catch (error) {
        return Response.json({
          success: false,
          message: 'Token authentication failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    },
    meta: { category: 'usr', description: 'Legacy token auth', version: '2.0.0' }
  });

  // Legacy triggers
  router.register({
    path: '/triggers/order',
    method: 'POST',
    handler: async (req, ctx) => {
      if (!engine) {
        return Response.json({ error: 'Engine not initialized' }, { status: 500 });
      }
      const body = await req.json();
      const orderId = `order_${Date.now()}`;
      const goal = engine.submitGoal(
        `Process order: ${body.customer} - ${(body.items as unknown[])?.length || 0} items`,
        0 as any, // Priority.CRITICAL
        { orderId, ...body, status: 'new' }
      );
      return Response.json({
        orderId,
        goalId: goal.id,
        status: 'processing',
        timestamp: Date.now()
      });
    },
    meta: { category: 'tmp', description: 'Legacy order trigger', version: '2.0.0' }
  });
}

/**
 * Main fetch handler with infinite Unix routing
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize on first request
    initialize(env);

    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Route discovery endpoint
    if (url.pathname === '/routes' && method === 'GET') {
      return Response.json({
        routing: 'infinite-unix',
        version: '2.0.0',
        documentation: getRouteDocumentation(),
        tree: getRouteTree(),
        totalRoutes: router.getRoutes().length,
        timestamp: Date.now()
      });
    }

    // Service discovery
    if (url.pathname === '/' && method === 'GET') {
      return Response.json({
        service: 'Infinite Unix Routing Agentic Gateway',
        version: '2.0.0',
        architecture: 'Unix-style hierarchical routing with agentic decision making',
        endpoints: {
          discovery: 'GET /routes',
          health: 'GET /health',
          unix: {
            bin: 'GET /bin/*',
            usr: 'GET /usr/bin/*',
            etc: 'GET /etc/*',
            var: 'GET /var/*',
            tmp: 'GET /tmp/*',
            opt: 'GET /opt/*',
            home: 'GET /home/:tenantId/*'
          },
          legacy: {
            agentic: 'POST /api/agentic/*',
            auth: 'POST /auth/*',
            triggers: 'POST /triggers/*'
          }
        },
        features: [
          'Unix-style hierarchical routing',
          'Dynamic route registration',
          'Agentic decision making',
          'Middleware pipeline',
          'Route composition',
          'Performance monitoring',
          'Legacy compatibility'
        ],
        timestamp: Date.now()
      });
    }

    // Apply global middleware
    router.use(UnixMiddleware.logger);
    router.use(UnixMiddleware.cors('*'));

    // Handle request through infinite router
    return router.handle(request, env, engine);
  }
};
