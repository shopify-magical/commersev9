import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { AgenticEngine } from './orchestrator/index.js';
import { Priority, type Goal } from './types/index.js';

export interface ServerConfig {
  port: number;
  host: string;
  cors?: {
    enabled: boolean;
    origin: string | string[];
    credentials: boolean;
  };
  engineConfig: {
    name: string;
    tickIntervalMs: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableLearning: boolean;
    enableSelfImprovement: boolean;
  };
}

export class AgenticServer {
  private server: ReturnType<typeof createServer>;
  private engine: AgenticEngine;
  private config: ServerConfig;
  private startTime: number;
  private publicDir: string;
  private orders: Array<{ id: string; goalId: string; customer: string; items: string; delivery: string; payment: unknown; tenantId: string; createdAt: string; status: string }> = [];
  private quotes: Array<{ id: string; goalId: string; customer: string; items: string; contact: string; notes: string; tenantId: string; createdAt: string; status: string }> = [];

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = {
      port: parseInt(process.env.PORT ?? '3000', 10),
      host: process.env.HOST ?? '0.0.0.0',
      cors: {
        enabled: process.env.CORS_ENABLED !== 'false',
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
        credentials: process.env.CORS_CREDENTIALS !== 'false',
      },
      engineConfig: {
        name: process.env.ENGINE_NAME ?? 'ProductionEngine',
        tickIntervalMs: parseInt(process.env.TICK_INTERVAL_MS ?? '1000', 10),
        logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
        enableLearning: process.env.ENABLE_LEARNING !== 'false',
        enableSelfImprovement: process.env.ENABLE_SELF_IMPROVEMENT !== 'false',
      },
      ...config,
    };

    this.startTime = Date.now();
    this.publicDir = join(import.meta.dirname ?? __dirname, '..', 'public');
    this.engine = new AgenticEngine(this.config.engineConfig);
    this.server = createServer(this.handleRequest.bind(this));

    this.setupGracefulShutdown();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.engine.events.on('goal:completed', (data: unknown) => {
      const goal = data as Goal;
      console.log(`[Server] Goal completed: ${goal.description}`);
    });

    this.engine.events.on('model:trained', (data: unknown) => {
      const model = data as { version: number; accuracy: number };
      console.log(`[Server] Model trained: v${model.version}, accuracy: ${(model.accuracy * 100).toFixed(1)}%`);
    });

    this.engine.events.on('error', (data: unknown) => {
      const { module, error } = data as { module: string; error: Error };
      console.error(`[Server] Error in ${module}: ${error.message}`);
    });
  }

  private setCORSHeaders(res: ServerResponse, origin?: string): void {
    if (!this.config.cors?.enabled) return;

    const allowedOrigins = this.config.cors.origin;
    const requestOrigin = origin || '*';

    if (allowedOrigins === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
    }

    if (this.config.cors.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}, shutting down...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }

  // Helper methods for agent endpoints
  private getRecommendations(category?: string, limit = 5): unknown[] {
    const stats = this.engine.learning.getStats();
    const products = [
      { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', score: stats.successRate, price: 450 },
      { id: 2, name: 'Thai Tea Cake', category: 'cakes', score: stats.avgReward, price: 380 },
      { id: 3, name: 'Pandan Custard', category: 'pastries', score: 0.85, price: 120 },
      { id: 4, name: 'Black Sesame Roll', category: 'pastries', score: 0.78, price: 95 },
      { id: 5, name: 'Salted Egg Pastry', category: 'pastries', score: 0.92, price: 150 },
    ];
    
    let filtered = products;
    if (category) {
      filtered = products.filter(p => p.category === category || p.name.toLowerCase().includes(category.toLowerCase()));
    }
    
    return filtered.slice(0, limit);
  }

  private searchProducts(query?: string, filters?: Record<string, unknown>): unknown[] {
    const allProducts = [
      { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', tags: ['traditional', 'premium'], stock: 50 },
      { id: 2, name: 'Thai Tea Cake', category: 'cakes', tags: ['tea', 'soft'], stock: 30 },
      { id: 3, name: 'Pandan Custard', category: 'pastries', tags: ['custard', 'sweet'], stock: 100 },
      { id: 4, name: 'Black Sesame Roll', category: 'pastries', tags: ['sesame', 'healthy'], stock: 45 },
      { id: 5, name: 'Salted Egg Pastry', category: 'pastries', tags: ['savory', 'popular'], stock: 80 },
      { id: 6, name: 'Coconut Tart', category: 'tarts', tags: ['coconut', 'sweet'], stock: 25 },
      { id: 7, name: 'Taro Bun', category: 'buns', tags: ['taro', 'soft'], stock: 60 },
      { id: 8, name: 'Egg Tart', category: 'tarts', tags: ['egg', 'classic'], stock: 40 },
    ];
    
    if (!query) return allProducts;
    
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.tags.some((t: string) => t.toLowerCase().includes(lowerQuery))
    );
  }

  private getInventory(category?: string): unknown[] {
    const inventory = [
      { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', stock: 50, reserved: 5, available: 45 },
      { id: 2, name: 'Thai Tea Cake', category: 'cakes', stock: 30, reserved: 2, available: 28 },
      { id: 3, name: 'Pandan Custard', category: 'pastries', stock: 100, reserved: 10, available: 90 },
      { id: 4, name: 'Black Sesame Roll', category: 'pastries', stock: 45, reserved: 8, available: 37 },
      { id: 5, name: 'Salted Egg Pastry', category: 'pastries', stock: 80, reserved: 15, available: 65 },
    ];
    
    if (category) {
      return inventory.filter(i => i.category === category || i.name.toLowerCase().includes(category.toLowerCase()));
    }
    
    return inventory;
  }

  private getChatCommands(): unknown[] {
    return [
      { command: '/recommend', description: 'Get product recommendations', example: '/recommend mooncakes' },
      { command: '/search', description: 'Search products', example: '/search heritage tea' },
      { command: '/order', description: 'Place an order', example: '/order mooncake box' },
      { command: '/status', description: 'Check order status', example: '/status #12345' },
      { command: '/inventory', description: 'Check inventory', example: '/inventory pastries' },
      { command: '/help', description: 'Show help', example: '/help' },
    ];
  }

  // Manager Agent: Decompose goal into worker-specific tasks
  private decomposeGoal(goal: string, worker: string): string {
    const decompositions: Record<string, (g: string) => string> = {
      'cors-proxy': (g) => `Handle CORS for: ${g}`,
      'chat-processor': (g) => `Parse intent and generate response for: ${g}`,
      'recommendation': (g) => `Generate product recommendations for: ${g}`,
      'inventory': (g) => `Check stock availability for: ${g}`,
      'default': (g) => `Process task: ${g}`,
    };
    
    const decompose = decompositions[worker] || decompositions['default'];
    return decompose(goal);
  }

  // Worker execution - stateless task processing
  private async executeWorkerTask(worker: string, task: string, input?: Record<string, unknown>): Promise<unknown> {
    // Simulate worker execution based on type
    const workers: Record<string, () => unknown> = {
      'cors-proxy': () => ({ proxied: true, headers: { 'access-control-allow-origin': '*' } }),
      'chat-processor': () => ({ 
        intent: 'general', 
        entities: [],
        response: `Processed: ${task}`,
      }),
      'recommendation': () => ({
        recommendations: this.getRecommendations(input?.category as string, input?.limit as number || 3),
      }),
      'inventory': () => ({
        stock: this.getInventory(input?.category as string),
      }),
      'default': () => ({ processed: true, task, timestamp: Date.now() }),
    };

    const executor = workers[worker] || workers['default'];
    
    // Add small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return executor();
  }

  // Similarity calculation for products
  private calculateSimilarity(query: string, product: Record<string, unknown>): number {
    const queryLower = query.toLowerCase();
    const name = (product.name as string || '').toLowerCase();
    const category = (product.category as string || '').toLowerCase();
    const tags = (product.tags as string[] || []).map(t => t.toLowerCase());
    
    let score = 0;
    
    // Exact name match
    if (name.includes(queryLower)) score += 0.5;
    // Category match
    if (category.includes(queryLower)) score += 0.3;
    // Tag match
    const tagMatches = tags.filter(t => t.includes(queryLower)).length;
    score += (tagMatches / Math.max(tags.length, 1)) * 0.2;
    
    return Math.min(score, 1);
  }

  // Extract customers from orders/quotes
  private extractCustomers(): Array<Record<string, unknown>> {
    const customers = new Map();
    
    // Extract from orders
    (this.orders || []).forEach(o => {
      if (!customers.has(o.customer)) {
        customers.set(o.customer, {
          name: o.customer,
          orders: [],
          quotes: [],
          totalSpent: 0,
        });
      }
      const c = customers.get(o.customer);
      c.orders.push(o.id);
      // Simulate spend calculation
      c.totalSpent += (JSON.parse(o.items || '[]').length * 100);
    });
    
    // Extract from quotes
    (this.quotes || []).forEach(q => {
      if (!customers.has(q.customer)) {
        customers.set(q.customer, {
          name: q.customer,
          orders: [],
          quotes: [],
          totalSpent: 0,
        });
      }
      customers.get(q.customer).quotes.push(q.id);
    });
    
    return Array.from(customers.values());
  }

  // Find similar customers based on purchase patterns
  private findSimilarCustomers(customerId: string, customers: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    const target = customers.find(c => c.name === customerId);
    if (!target) return [];
    
    return customers
      .filter(c => c.name !== customerId)
      .map(c => {
        // Calculate similarity based on order overlap
        const targetOrders = new Set(target.orders as string[]);
        const cOrders = new Set(c.orders as string[]);
        const overlap = Array.from(targetOrders).filter(o => cOrders.has(o)).length;
        const similarity = overlap / Math.max(targetOrders.size, cOrders.size, 1);
        
        return { ...c, similarity };
      })
      .sort((a, b) => (b.similarity as number) - (a.similarity as number))
      .slice(0, 5);
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url ?? '/';
    const method = req.method ?? 'GET';
    const origin = req.headers.origin;

    // Set CORS headers for all requests
    this.setCORSHeaders(res, origin);

    // Handle OPTIONS preflight request
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    res.setHeader('X-Powered-By', 'AgenticEngine/1.0');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // CSP - using report-only for now to avoid blocking issues
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com; frame-src https://www.youtube.com https://player.vimeo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");

    // Serve homepage at root - index.html (cake shop)
    if (url === '/' && method === 'GET') {
      try {
        const html = await readFile(join(this.publicDir, 'index.html'), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Sweet Layers Bakery</h1><p>Welcome! Run build to see products.</p>');
      }
      return;
    }

    // Serve dashboard at /dashboard
    if (url === '/dashboard' && method === 'GET') {
      try {
        const html = await readFile(join(this.publicDir, 'dashboard.html'), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Dashboard not found</h1><p>Run build first.</p>');
      }
      return;
    }

    // Serve static files from public/
    if (url.startsWith('/images/') || url.startsWith('/js/') || url.endsWith('.svg') || url.endsWith('.html')) {
      try {
        const filePath = join(this.publicDir, url);
        const content = await readFile(filePath);
        const ext = extname(filePath);
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.webp': 'image/webp',
          '.json': 'application/json',
        };
        
        // Add cache headers based on file type
        const isImage = url.startsWith('/images/');
        const isJS = url.endsWith('.js');
        const isCSS = url.endsWith('.css');
        const cacheControl = isImage ? 'public, max-age=31536000, immutable' 
          : isJS || isCSS ? 'public, max-age=31536000' 
          : 'no-cache';
        
        res.writeHead(200, { 
          'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
          'Cache-Control': cacheControl
        });
        res.end(content);
      } catch {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      }
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    // Health check
    if (url === '/health' && method === 'GET') {
      const health = {
        status: this.engine.isRunning() ? 'healthy' : 'stopped',
        uptime: Date.now() - this.startTime,
        timestamp: Date.now(),
        version: '1.0.0',
      };
      res.writeHead(200);
      res.end(JSON.stringify(health, null, 2));
      return;
    }

    // Metrics
    if (url === '/metrics' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      const config = this.engine.getConfig();
      res.writeHead(200);
      res.end(JSON.stringify({ metrics, config }, null, 2));
      return;
    }

    // Engine state
    if (url === '/state' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      res.writeHead(200);
      res.end(JSON.stringify({ state: metrics.state }, null, 2));
      return;
    }

    // Submit goal
    if (url === '/goals' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { description, priority } = JSON.parse(body) as { description: string; priority?: number };
          if (!description) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Description is required' }));
            return;
          }
          const goal = this.engine.submitGoal(description, priority as Priority ?? Priority.MEDIUM);
          res.writeHead(201);
          res.end(JSON.stringify({ goal }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // Start engine
    if (url === '/start' && method === 'POST') {
      this.engine.start().then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Engine started' }));
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    // Stop engine
    if (url === '/stop' && method === 'POST') {
      this.engine.stop().then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Engine stopped' }));
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    // Learning stats
    if (url === '/learning' && method === 'GET') {
      const stats = this.engine.learning.getStats();
      const explorationRate = this.engine.learning.getExplorationRate();
      const model = this.engine.learning.getModel();
      res.writeHead(200);
      res.end(JSON.stringify({ stats, explorationRate, model }, null, 2));
      return;
    }

    // Chat API for cross-service communication
    if (url === '/api/chat' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { message, context } = JSON.parse(body) as { message: string; context?: Record<string, unknown> };
          if (!message) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Message is required' }));
            return;
          }
          // Submit as a goal for the engine to process
          const goal = this.engine.submitGoal(`Chat response: ${message}`, Priority.HIGH);
          res.writeHead(200);
          res.end(JSON.stringify({ 
            response: `Goal submitted: ${goal.description}`,
            goalId: goal.id,
            context 
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // Recommendations API for e-commerce
    if (url === '/api/recommendations' && method === 'GET') {
      const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
      const category = urlParams.get('category') || undefined;
      const limit = parseInt(urlParams.get('limit') || '5', 10);
      
      // Use engine's learning to provide recommendations
      const stats = this.engine.learning.getStats();
      const recommendations = {
        items: [
          { id: 1, name: 'Heritage Mooncake', score: stats.successRate, category: 'mooncakes' },
          { id: 2, name: 'Thai Tea Cake', score: stats.avgReward, category: 'cakes' },
          { id: 3, name: 'Pandan Custard', score: 0.85, category: 'pastries' },
        ].slice(0, limit).filter(item => !category || item.category === category),
        metadata: {
          total: stats.total,
          algorithm: 'agentic-learning',
          timestamp: Date.now(),
        }
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(recommendations, null, 2));
      return;
    }

    // Service discovery endpoint
    if (url === '/api/services' && method === 'GET') {
      const services = {
        name: 'Agentic Engine',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          metrics: '/metrics',
          goals: '/goals',
          chat: '/api/chat',
          recommendations: '/api/recommendations',
          learning: '/learning',
        },
        capabilities: {
          goalProcessing: true,
          learning: true,
          chat: true,
          recommendations: true,
        }
      };
      res.writeHead(200);
      res.end(JSON.stringify(services, null, 2));
      return;
    }

    // Service discovery endpoint (root)
    if (url === '/' && method === 'GET') {
      const rootResponse = {
        service: 'Agentic Engine for BizCommerz',
        version: '1.0.0',
        architecture: 'Autonomous Agentic Engine with Learning',
        description: 'Complete AI agent system with dashboard, chat interface, and autonomous goal processing',
        endpoints: {
          health: 'GET /health',
          auth: 'GET /auth/token?tenantId=',
          chat: {
            commands: 'GET /chat/commands',
            process: 'POST /chat/process',
            sessions: 'GET /chat/sessions/:tenantId',
          },
          agents: {
            health: 'POST /agents/health',
            recommend: 'POST /agents/recommend',
            search: 'POST /agents/search',
            order: 'POST /agents/order',
            inventory: 'POST /agents/inventory',
            analytics: 'POST /agents/analytics',
            status: 'GET /agents/status',
          },
          engine: {
            goals: 'POST /engine/goals',
            metrics: 'GET /engine/metrics',
            learning: 'GET /engine/learning',
            state: 'GET /engine/state',
            start: 'POST /engine/start',
            stop: 'POST /engine/stop',
            restart: 'POST /engine/restart',
          },
          orchestrate: 'POST /orchestrate',
          stats: 'GET /stats',
          dashboard: 'GET /dashboard',
        },
        authentication: 'Bearer token (use /auth/token to generate)',
        features: [
          'Chat-based command interface',
          'Autonomous goal processing',
          'Real-time learning and adaptation',
          'Multi-tenant support',
          'Product recommendations',
          'Inventory management',
          'Order processing',
          'Analytics and insights',
        ],
      };
      res.writeHead(200);
      res.end(JSON.stringify(rootResponse, null, 2));
      return;
    }

    // Auth token generation
    if (url.startsWith('/auth/token') && method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const tenantId = urlParams.get('tenantId') || 'default';
      
      // Simple token generation (in production, use proper JWT)
      const token = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64');
      
      res.writeHead(200);
      res.end(JSON.stringify({
        token,
        tenantId,
        expiresIn: '24h',
        type: 'Bearer',
      }, null, 2));
      return;
    }

    // Chat commands endpoint
    if (url === '/chat/commands' && method === 'GET') {
      const commands = {
        available: [
          { command: '/recommend', description: 'Get product recommendations', example: '/recommend mooncakes' },
          { command: '/search', description: 'Search products', example: '/search heritage tea' },
          { command: '/order', description: 'Place an order', example: '/order mooncake box' },
          { command: '/status', description: 'Check order status', example: '/status #12345' },
          { command: '/inventory', description: 'Check inventory', example: '/inventory pastries' },
          { command: '/help', description: 'Show help', example: '/help' },
        ],
        prefix: '/',
        version: '1.0.0',
      };
      res.writeHead(200);
      res.end(JSON.stringify(commands, null, 2));
      return;
    }

    // Chat process endpoint
    if (url === '/chat/process' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { message, sessionId, tenantId, context } = JSON.parse(body);
          if (!message) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Message is required' }));
            return;
          }

          // Parse command from message
          const commandMatch = message.match(/^\/(\w+)(?:\s+(.+))?$/);
          let response;
          
          if (commandMatch) {
            const [, cmd, args] = commandMatch;
            switch (cmd) {
              case 'recommend':
                response = { type: 'recommendations', data: this.getRecommendations(args) };
                break;
              case 'search':
                response = { type: 'search', query: args, results: this.searchProducts(args) };
                break;
              case 'order':
                const order = this.engine.submitGoal(`Process order: ${args}`, Priority.HIGH);
                response = { type: 'order', goalId: order.id, message: `Order goal created: ${args}` };
                break;
              case 'status':
                response = { type: 'status', metrics: this.engine.getMetrics() };
                break;
              case 'inventory':
                response = { type: 'inventory', category: args, stock: this.getInventory(args) };
                break;
              case 'help':
                response = { type: 'help', commands: this.getChatCommands() };
                break;
              default:
                response = { type: 'unknown', message: `Unknown command: ${cmd}. Type /help for available commands.` };
            }
          } else {
            // Natural language processing - submit as goal
            const goal = this.engine.submitGoal(`Chat: ${message}`, Priority.MEDIUM);
            response = {
              type: 'goal',
              goalId: goal.id,
              message: `Goal submitted: ${message}`,
              context: { sessionId, tenantId },
            };
          }

          res.writeHead(200);
          res.end(JSON.stringify({
            response,
            sessionId: sessionId || `session_${Date.now()}`,
            timestamp: Date.now(),
            processedAt: new Date().toISOString(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // Chat sessions
    if (url.startsWith('/chat/sessions/') && method === 'GET') {
      const tenantId = url.split('/')[3];
      res.writeHead(200);
      res.end(JSON.stringify({
        tenantId,
        sessions: [],
        active: 0,
        totalMessages: 0,
      }, null, 2));
      return;
    }

    // Agent endpoints - unified agent interface
    if (url === '/agents/health' && method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        agent: 'health-monitor',
        timestamp: Date.now(),
        checks: {
          engine: this.engine.isRunning(),
          learning: this.engine.getConfig().enableLearning,
          memory: process.memoryUsage(),
        },
      }, null, 2));
      return;
    }

    if (url === '/agents/recommend' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { category, userId, limit = 5, context } = JSON.parse(body);
          const recommendations = this.getRecommendations(category, limit);
          res.writeHead(200);
          res.end(JSON.stringify({
            agent: 'recommendation',
            recommendations,
            context: { userId, category },
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/agents/search' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { query, filters } = JSON.parse(body);
          const results = this.searchProducts(query, filters);
          res.writeHead(200);
          res.end(JSON.stringify({
            agent: 'search',
            query,
            results,
            total: results.length,
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/agents/order' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { items, customer, priority = 2 } = JSON.parse(body);
          const goal = this.engine.submitGoal(`Process order for ${customer}: ${items.length} items`, priority as Priority);
          res.writeHead(200);
          res.end(JSON.stringify({
            agent: 'order-processing',
            orderId: goal.id,
            status: 'processing',
            items,
            estimatedTime: '2-3 minutes',
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/agents/inventory' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { category, checkStock } = JSON.parse(body);
          const inventory = this.getInventory(category);
          res.writeHead(200);
          res.end(JSON.stringify({
            agent: 'inventory',
            category,
            inventory,
            lowStock: checkStock ? (inventory as Array<{ stock: number }>).filter((i) => i.stock < 10) : [],
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/agents/analytics' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { metric, timeframe } = JSON.parse(body);
          const metrics = this.engine.getMetrics();
          const learning = this.engine.learning.getStats();
          res.writeHead(200);
          res.end(JSON.stringify({
            agent: 'analytics',
            metric,
            timeframe,
            data: {
              tasksCompleted: metrics.tasksCompleted,
              tasksFailed: metrics.tasksFailed,
              modelAccuracy: metrics.modelAccuracy,
              experienceCount: metrics.experienceCount,
            },
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/agents/status' && method === 'GET') {
      const status = {
        agents: ['health', 'recommend', 'search', 'order', 'inventory', 'analytics'],
        active: this.engine.isRunning(),
        uptime: Date.now() - this.startTime,
        version: '1.0.0',
        engine: {
          running: this.engine.isRunning(),
          state: this.engine.getMetrics().state,
          goalsPending: this.engine.getMetrics().tasksCompleted,
        },
      };
      res.writeHead(200);
      res.end(JSON.stringify(status, null, 2));
      return;
    }

    // Engine control endpoints
    if (url === '/engine/goals' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { description, priority = 2, metadata } = JSON.parse(body);
          if (!description) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Description is required' }));
            return;
          }
          const goal = this.engine.submitGoal(description, priority as Priority, metadata);
          res.writeHead(201);
          res.end(JSON.stringify({
            goal: {
              id: goal.id,
              description: goal.description,
              priority: goal.priority,
              status: goal.status,
              createdAt: goal.createdAt,
            },
            message: 'Goal submitted successfully',
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/engine/metrics' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      const config = this.engine.getConfig();
      res.writeHead(200);
      res.end(JSON.stringify({
        metrics: {
          ...metrics,
          uptime: Date.now() - this.startTime,
        },
        config,
        timestamp: Date.now(),
      }, null, 2));
      return;
    }

    if (url === '/engine/learning' && method === 'GET') {
      const stats = this.engine.learning.getStats();
      const explorationRate = this.engine.learning.getExplorationRate();
      const model = this.engine.learning.getModel();
      res.writeHead(200);
      res.end(JSON.stringify({
        stats,
        explorationRate,
        model,
        performance: {
          trend: stats.successRate > 0.7 ? 'improving' : 'stable',
          lastUpdated: Date.now(),
        },
      }, null, 2));
      return;
    }

    if (url === '/engine/state' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      res.writeHead(200);
      res.end(JSON.stringify({
        state: metrics.state,
        isRunning: this.engine.isRunning(),
        lastTick: metrics.lastTick,
        timestamp: Date.now(),
      }, null, 2));
      return;
    }

    if (url === '/engine/start' && method === 'POST') {
      this.engine.start().then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Engine started',
          startedAt: Date.now(),
          state: 'running',
        }));
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (url === '/engine/stop' && method === 'POST') {
      this.engine.stop().then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Engine stopped',
          stoppedAt: Date.now(),
          state: 'stopped',
        }));
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (url === '/engine/restart' && method === 'POST') {
      this.engine.stop().then(() => {
        setTimeout(() => {
          this.engine.start().then(() => {
            res.writeHead(200);
            res.end(JSON.stringify({
              message: 'Engine restarted',
              restartedAt: Date.now(),
              state: 'running',
            }));
          });
        }, 1000);
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    // Agent-Worker orchestration - Manager assigns tasks to workers
    if (url === '/agent/assign' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const { goal, workers = [], context } = JSON.parse(body);
          if (!goal) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Goal is required' }));
            return;
          }

          // Manager Agent decomposes goal and assigns to workers
          const jobId = `job_${Date.now()}`;
          const assignments = workers.length > 0 
            ? workers.map((worker: string, idx: number) => ({
                taskId: `${jobId}_${idx}`,
                worker,
                task: this.decomposeGoal(goal, worker),
                status: 'assigned',
              }))
            : [{ taskId: `${jobId}_0`, worker: 'default', task: goal, status: 'assigned' }];

          // Submit orchestration as goal - agent manages worker coordination
          const orchestrationGoal = this.engine.submitGoal(
            `Orchestrate: ${goal}`,
            Priority.HIGH,
            { jobId, assignments, context, strategy: 'manager-worker' }
          );
          
          res.writeHead(200);
          res.end(JSON.stringify({
            jobId,
            goalId: orchestrationGoal.id,
            assignments,
            strategy: 'manager-worker',
            message: `Agent orchestrator assigned ${assignments.length} worker(s)`,
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // Worker executes task (called by orchestrator)
    if (url === '/worker/execute' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const { taskId, worker, task, input } = JSON.parse(body);
          
          // Worker executes and returns result
          const result = await this.executeWorkerTask(worker, task, input);
          
          res.writeHead(200);
          res.end(JSON.stringify({
            taskId,
            worker,
            status: 'completed',
            result,
            completedAt: Date.now(),
          }, null, 2));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ 
            error: 'Worker execution failed', 
            details: err instanceof Error ? err.message : 'Unknown error'
          }));
        }
      });
      return;
    }

    // Get available workers
    if (url === '/workers' && method === 'GET') {
      const workers = [
        { 
          name: 'cors-proxy', 
          type: 'infrastructure',
          capabilities: ['proxy', 'cors-handling'],
          endpoint: '/workers/cors-proxy',
          status: 'available',
        },
        { 
          name: 'chat-processor', 
          type: 'nlp',
          capabilities: ['intent-parsing', 'response-generation'],
          endpoint: '/workers/chat',
          status: 'available',
        },
        { 
          name: 'recommendation', 
          type: 'ml',
          capabilities: ['product-matching', 'scoring'],
          endpoint: '/workers/recommend',
          status: 'available',
        },
        { 
          name: 'inventory', 
          type: 'data',
          capabilities: ['stock-check', 'availability'],
          endpoint: '/workers/inventory',
          status: 'available',
        },
      ];
      
      res.writeHead(200);
      res.end(JSON.stringify({
        workers,
        total: workers.length,
        available: workers.filter(w => w.status === 'available').length,
        timestamp: Date.now(),
      }, null, 2));
      return;
    }

    // Trigger system - landing page events → dashboard
    if (url === '/triggers/quote' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { customer, items, contact, notes, tenantId = 'default' } = JSON.parse(body);
          
          // Create quote as goal for tracking
          const quoteId = `quote_${Date.now()}`;
          const goal = this.engine.submitGoal(
            `Quote request: ${customer} - ${items?.length || 0} items`,
            Priority.HIGH,
            { quoteId, customer, items, contact, notes, tenantId, status: 'pending' }
          );
          
          // Store in memory for CSV export
          if (!this.quotes) this.quotes = [];
          this.quotes.push({
            id: quoteId,
            goalId: goal.id,
            customer,
            items: JSON.stringify(items),
            contact,
            notes,
            tenantId,
            createdAt: new Date().toISOString(),
            status: 'pending'
          });
          
          res.writeHead(201);
          res.end(JSON.stringify({
            quoteId,
            goalId: goal.id,
            status: 'queued',
            message: 'Quote request received',
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/triggers/order' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { customer, items, delivery, payment, tenantId = 'default' } = JSON.parse(body);
          
          const orderId = `order_${Date.now()}`;
          const goal = this.engine.submitGoal(
            `Process order: ${customer} - ${items?.length || 0} items`,
            Priority.CRITICAL,
            { orderId, customer, items, delivery, payment, tenantId, status: 'new' }
          );
          
          if (!this.orders) this.orders = [];
          this.orders.push({
            id: orderId,
            goalId: goal.id,
            customer,
            items: JSON.stringify(items),
            delivery: JSON.stringify(delivery),
            payment,
            tenantId,
            createdAt: new Date().toISOString(),
            status: 'new'
          });
          
          res.writeHead(201);
          res.end(JSON.stringify({
            orderId,
            goalId: goal.id,
            status: 'processing',
            message: 'Order received and processing',
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // CSV Export for business data
    if (url === '/export/quotes' && method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const tenantId = urlParams.get('tenantId');
      const format = urlParams.get('format') || 'json';
      
      const quotes = (this.quotes || []).filter(q => !tenantId || q.tenantId === tenantId);
      
      if (format === 'csv') {
        const headers = 'quoteId,customer,items,contact,notes,status,createdAt\n';
        const rows = quotes.map(q => 
          `${q.id},"${q.customer}","${q.items}","${q.contact}","${q.notes}",${q.status},${q.createdAt}`
        ).join('\n');
        
        res.writeHead(200, { 
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="quotes.csv"'
        });
        res.end(headers + rows);
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ quotes, count: quotes.length }, null, 2));
      }
      return;
    }

    if (url === '/export/orders' && method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const tenantId = urlParams.get('tenantId');
      const format = urlParams.get('format') || 'json';
      
      const orders = (this.orders || []).filter(o => !tenantId || o.tenantId === tenantId);
      
      if (format === 'csv') {
        const headers = 'orderId,customer,items,delivery,payment,status,createdAt\n';
        const rows = orders.map(o => 
          `${o.id},"${o.customer}","${o.items}","${o.delivery}",${o.payment},${o.status},${o.createdAt}`
        ).join('\n');
        
        res.writeHead(200, { 
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="orders.csv"'
        });
        res.end(headers + rows);
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ orders, count: orders.length }, null, 2));
      }
      return;
    }

    // Similarity search - multi-model matching
    if (url === '/similarity/products' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { query, filters = {}, limit = 5 } = JSON.parse(body);
          
          // Simple similarity based on tags/categories
          const products = this.searchProducts(query);
          const scored = products.map(p => {
            const similarity = this.calculateSimilarity(query, p as Record<string, unknown>);
            return { ...p as object, similarity };
          }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
          
          res.writeHead(200);
          res.end(JSON.stringify({
            query,
            results: scored.slice(0, limit),
            total: products.length,
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/similarity/customers' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { customerId, tenantId } = JSON.parse(body);
          
          // Find similar customers based on order patterns
          const customers = this.extractCustomers();
          const similar = this.findSimilarCustomers(customerId, customers);
          
          res.writeHead(200);
          res.end(JSON.stringify({
            customerId,
            similar,
            timestamp: Date.now(),
          }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // Stats endpoint
    if (url === '/stats' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      const learning = this.engine.learning.getStats();
      res.writeHead(200);
      res.end(JSON.stringify({
        overview: {
          totalGoals: metrics.tasksCompleted + metrics.tasksFailed,
          successRate: learning.successRate,
          avgDecisionTime: metrics.avgDecisionTime,
          knowledgeBaseSize: metrics.knowledgeEntries,
        },
        performance: {
          tasksCompleted: metrics.tasksCompleted,
          tasksFailed: metrics.tasksFailed,
          modelAccuracy: metrics.modelAccuracy,
          experienceCount: metrics.experienceCount,
        },
        system: {
          uptime: Date.now() - this.startTime,
          memoryUsage: metrics.memoryUsage,
          isRunning: this.engine.isRunning(),
        },
        timestamp: Date.now(),
      }, null, 2));
      return;
    }

    // Dashboard endpoint (serve the HTML)
    if (url === '/dashboard' && method === 'GET') {
      try {
        const html = await readFile(join(this.publicDir, 'dashboard.html'), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Dashboard not found' }));
      }
      return;
    }

    // Legacy endpoints (backward compatibility)
    if (url === '/health' && method === 'GET') {
      const health = {
        status: this.engine.isRunning() ? 'healthy' : 'stopped',
        uptime: Date.now() - this.startTime,
        timestamp: Date.now(),
        version: '1.0.0',
        service: 'Agentic Engine',
      };
      res.writeHead(200);
      res.end(JSON.stringify(health, null, 2));
      return;
    }

    if (url === '/metrics' && method === 'GET') {
      const metrics = this.engine.getMetrics();
      const config = this.engine.getConfig();
      res.writeHead(200);
      res.end(JSON.stringify({ metrics, config }, null, 2));
      return;
    }

    if (url === '/goals' && method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { description, priority } = JSON.parse(body) as { description: string; priority?: number };
          if (!description) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Description is required' }));
            return;
          }
          const goal = this.engine.submitGoal(description, priority as Priority ?? Priority.MEDIUM);
          res.writeHead(201);
          res.end(JSON.stringify({ goal }, null, 2));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/start' && method === 'POST') {
      this.engine.start().then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Engine started' }));
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (url === '/stop' && method === 'POST') {
      this.engine.stop().then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Engine stopped' }));
      }).catch((err: Error) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (url === '/learning' && method === 'GET') {
      const stats = this.engine.learning.getStats();
      const explorationRate = this.engine.learning.getExplorationRate();
      const model = this.engine.learning.getModel();
      res.writeHead(200);
      res.end(JSON.stringify({ stats, explorationRate, model }, null, 2));
      return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found', path: url, method }));
  }

  async start(): Promise<void> {
    await this.engine.start();

    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`[Server] Listening on ${this.config.host}:${this.config.port}`);
        console.log(`[Server] Homepage: http://localhost:${this.config.port}/`);
    console.log(`[Server] Dashboard: http://localhost:${this.config.port}/dashboard`);
        console.log(`[Server] Health: http://localhost:${this.config.port}/health`);
        console.log(`[Server] Metrics: http://localhost:${this.config.port}/metrics`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    await this.engine.stop();

    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Run if executed directly
const isMainModule = process.argv[1]?.includes('server');
if (isMainModule) {
  const server = new AgenticServer();
  server.start().catch(console.error);
}
