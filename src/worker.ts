/**
 * Cloudflare Workers entry point for Agentic Engine
 * Adapts the Node.js server for Edge runtime
 */

import { AgenticEngine } from './orchestrator/index.js';
import { Priority, type Goal } from './types/index.js';

// Engine instance (per-isolate, not per-request)
let engine: AgenticEngine | null = null;

export interface Env {
  QUOTES_KV: KVNamespace;
  ORDERS_KV: KVNamespace;
  ENGINE_STATE: DurableObjectNamespace;
  API_TOKEN?: string;
  ENGINE_NAME?: string;
  LOG_LEVEL?: string;
  ENABLE_LEARNING?: string;
}

// Initialize engine singleton
function getEngine(env: Env): AgenticEngine {
  if (!engine) {
    engine = new AgenticEngine({
      name: env.ENGINE_NAME || 'CloudflareEngine',
      tickIntervalMs: 5000,
      logLevel: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      enableLearning: env.ENABLE_LEARNING !== 'false',
      enableSelfImprovement: true,
    });
    engine.start().catch(console.error);
  }
  return engine;
}

// CORS headers
function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

// JSON response helper
function jsonResponse(data: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get('origin') || '*';

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Check route first before initializing engine
    const isApiRoute = url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/health') || 
      url.pathname.startsWith('/workers') ||
      url.pathname.startsWith('/triggers') ||
      url.pathname.startsWith('/export') ||
      url.pathname.startsWith('/chat') ||
      url.pathname.startsWith('/agent') ||
      url.pathname.startsWith('/payment') ||
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/stats') ||
      url.pathname.startsWith('/onboard') ||
      url.pathname.startsWith('/ws');

    // Root HTML page - redirect to shop
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response('Redirecting to static site...', { 
        status: 302,
        headers: { 'Location': '/shop.html' }
      });
    }

    // Try to fetch static file from Workers Sites
    // If not found, check if it's a valid HTML file and serve from public
    if (!isApiRoute) {
      try {
        const staticResponse = await fetch(request);
        if (staticResponse.status === 404) {
          // Try appending .html for paths without extension
          if (!url.pathname.endsWith('.html') && !url.pathname.includes('.')) {
            const htmlRequest = new Request(url.origin + url.pathname + '.html', {
              method: request.method,
              headers: request.headers,
              body: request.body
            });
            const htmlResponse = await fetch(htmlRequest);
            if (htmlResponse.ok) return htmlResponse;
          }
          // Return 404
          return new Response('Page not found', { 
            status: 404,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        return staticResponse;
      } catch (e) {
        return new Response('Error loading page', { status: 500 });
      }
    }

    // For API routes, ensure engine is initialized
    const eng = getEngine(env);
    const startTime = Date.now();

    // Router
    try {
      // Health check
      if (url.pathname === '/health' && method === 'GET') {
        return jsonResponse({
          status: eng.isRunning() ? 'healthy' : 'stopped',
          timestamp: Date.now(),
          version: '1.0.0',
          service: 'Agentic Engine (Cloudflare Workers)',
        }, 200, corsHeaders(origin));
      }

      // Root - service discovery
      if (url.pathname === '/' && method === 'GET') {
        return jsonResponse({
          service: 'Agentic Engine for BizCommerz',
          version: '1.0.0',
          platform: 'Cloudflare Workers',
          architecture: 'Edge Distributed',
          endpoints: {
            health: 'GET /health',
            workers: 'GET /workers',
            triggers: {
              quote: 'POST /triggers/quote',
              order: 'POST /triggers/order',
            },
            export: {
              quotes: 'GET /export/quotes?format=csv',
              orders: 'GET /export/orders?format=csv',
            },
            agent: {
              assign: 'POST /agent/assign',
            },
            agentic: {
              validate: 'POST /api/agentic/validate',
              observation: 'POST /api/agentic/observation',
              goal: 'POST /api/agentic/goal',
              metrics: 'GET /api/agentic/metrics',
              websocket: 'WS /ws',
            },
            chat: {
              commands: 'GET /chat/commands',
              process: 'POST /chat/process',
            },
            payment: {
              promptpay: 'POST /payment/promptpay',
              status: 'GET /payment/status?paymentId=',
              verifySlip: 'POST /payment/verify-slip',
            },
            stats: 'GET /stats',
          },
        }, 200, corsHeaders(origin));
      }

      // Workers list
      if (url.pathname === '/workers' && method === 'GET') {
        return jsonResponse({
          workers: [
            { name: 'cors-proxy', type: 'infrastructure', status: 'available' },
            { name: 'chat-processor', type: 'nlp', status: 'available' },
            { name: 'recommendation', type: 'ml', status: 'available' },
            { name: 'inventory', type: 'data', status: 'available' },
          ],
          total: 4,
          available: 4,
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Triggers - quote
      if (url.pathname === '/triggers/quote' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { customer, items, contact, notes, tenantId = 'default' } = body;
        
        const quoteId = `quote_${Date.now()}`;
        const goal = eng.submitGoal(
          `Quote request: ${customer} - ${(items as unknown[])?.length || 0} items`,
          Priority.HIGH,
          { quoteId, customer, items, contact, notes, tenantId, status: 'pending' }
        );

        // Store in KV for persistence
        await env.QUOTES_KV.put(quoteId, JSON.stringify({
          id: quoteId,
          goalId: goal.id,
          customer,
          items: JSON.stringify(items),
          contact,
          notes,
          tenantId,
          createdAt: new Date().toISOString(),
          status: 'pending',
        }));

        return jsonResponse({
          quoteId,
          goalId: goal.id,
          status: 'queued',
          message: 'Quote request received',
          timestamp: Date.now(),
        }, 201, corsHeaders(origin));
      }

      // Triggers - order
      if (url.pathname === '/triggers/order' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { customer, items, delivery, payment, tenantId = 'default' } = body;
        
        const orderId = `order_${Date.now()}`;
        
        let goalId: string | null = null;
        try {
          const goal = eng.submitGoal(
            `Process order: ${customer} - ${(items as unknown[])?.length || 0} items`,
            Priority.CRITICAL,
            { orderId, customer, items, delivery, payment, tenantId, status: 'new' }
          );
          goalId = goal.id;
        } catch (e) {
          console.log('Goal submission skipped:', (e as Error).message);
        }

        const orderData = {
          id: orderId,
          goalId,
          customer,
          items: items || [],
          delivery: delivery || null,
          payment,
          tenantId,
          createdAt: new Date().toISOString(),
          status: 'new',
        };

        if (env.ORDERS_KV) {
          try {
            await env.ORDERS_KV.put(orderId, JSON.stringify(orderData));
          } catch (kvErr) {
            console.log('KV storage error:', (kvErr as Error).message);
          }
        }

        return jsonResponse({
          orderId,
          goalId,
          status: 'processing',
          message: 'Order received and processing',
          timestamp: Date.now(),
        }, 201, corsHeaders(origin));
      }

      // Export quotes
      if (url.pathname === '/export/quotes' && method === 'GET') {
        const format = url.searchParams.get('format') || 'json';
        const tenantId = url.searchParams.get('tenantId');
        
        const quotes: unknown[] = [];
        const keys = await env.QUOTES_KV.list({ prefix: 'quote_' });
        
        for (const key of keys.keys) {
          const data = await env.QUOTES_KV.get(key.name);
          if (data) {
            const parsed = JSON.parse(data);
            if (!tenantId || parsed.tenantId === tenantId) {
              quotes.push(parsed);
            }
          }
        }

        if (format === 'csv') {
          const headers = 'quoteId,customer,items,contact,notes,status,createdAt\n';
          const rows = (quotes as Array<Record<string, string>>).map(q =>
            `${q.id},"${q.customer}","${q.items}","${q.contact}","${q.notes}",${q.status},${q.createdAt}`
          ).join('\n');
          
          return new Response(headers + rows, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="quotes.csv"',
              ...corsHeaders(origin),
            },
          });
        }

        return jsonResponse({ quotes, count: quotes.length }, 200, corsHeaders(origin));
      }

      // Export orders
      if (url.pathname === '/export/orders' && method === 'GET') {
        const format = url.searchParams.get('format') || 'json';
        const tenantId = url.searchParams.get('tenantId');
        
        const orders: unknown[] = [];
        const keys = await env.ORDERS_KV.list({ prefix: 'order_' });
        
        for (const key of keys.keys) {
          const data = await env.ORDERS_KV.get(key.name);
          if (data) {
            const parsed = JSON.parse(data);
            if (!tenantId || parsed.tenantId === tenantId) {
              orders.push(parsed);
            }
          }
        }

        if (format === 'csv') {
          const headers = 'orderId,customer,items,delivery,payment,status,createdAt\n';
          const rows = (orders as Array<Record<string, string>>).map(o =>
            `${o.id},"${o.customer}","${o.items}","${o.delivery}",${o.payment},${o.status},${o.createdAt}`
          ).join('\n');
          
          return new Response(headers + rows, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="orders.csv"',
              ...corsHeaders(origin),
            },
          });
        }

        return jsonResponse({ orders, count: orders.length }, 200, corsHeaders(origin));
      }

      // Chat commands
      if (url.pathname === '/chat/commands' && method === 'GET') {
        return jsonResponse({
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
        }, 200, corsHeaders(origin));
      }

      // Chat process
      if (url.pathname === '/chat/process' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { message, sessionId, tenantId } = body;

        if (!message) {
          return jsonResponse({ error: 'Message is required' }, 400, corsHeaders(origin));
        }

        // Parse command
        const commandMatch = (message as string).match(/^\/(\w+)(?:\s+(.+))?$/);
        let response;

        if (commandMatch) {
          const [, cmd, args] = commandMatch;
          switch (cmd) {
            case 'recommend':
              response = { type: 'recommendations', data: getRecommendations(args) };
              break;
            case 'order':
              const goal = eng.submitGoal(`Process order: ${args}`, Priority.HIGH);
              response = { type: 'order', goalId: goal.id, message: `Order goal created: ${args}` };
              break;
            case 'inventory':
              response = { type: 'inventory', category: args, stock: getInventory(args) };
              break;
            default:
              response = { type: 'unknown', message: `Unknown command: ${cmd}. Type /help for available commands.` };
          }
        } else {
          const goal = eng.submitGoal(`Chat: ${message}`, Priority.MEDIUM);
          response = { type: 'goal', goalId: goal.id, message: `Goal submitted: ${message}` };
        }

        return jsonResponse({
          response,
          sessionId: sessionId || `session_${Date.now()}`,
          timestamp: Date.now(),
          processedAt: new Date().toISOString(),
        }, 200, corsHeaders(origin));
      }

      // Agent assign
      if (url.pathname === '/agent/assign' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { goal, workers = [], context } = body;

        if (!goal) {
          return jsonResponse({ error: 'Goal is required' }, 400, corsHeaders(origin));
        }

        const jobId = `job_${Date.now()}`;
        const workerList = (workers as string[]).length > 0 ? workers as string[] : ['default'];
        
        const assignments = workerList.map((worker, idx) => ({
          taskId: `${jobId}_${idx}`,
          worker,
          task: `Process: ${goal}`,
          status: 'assigned',
        }));

        const orchestrationGoal = eng.submitGoal(
          `Orchestrate: ${goal}`,
          Priority.HIGH,
          { jobId, assignments, context, strategy: 'manager-worker' }
        );

        return jsonResponse({
          jobId,
          goalId: orchestrationGoal.id,
          assignments,
          strategy: 'manager-worker',
          message: `Agent orchestrator assigned ${assignments.length} worker(s)`,
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Stats
      if (url.pathname === '/stats' && method === 'GET') {
        const metrics = eng.getMetrics();
        const learning = eng.learning.getStats();
        
        return jsonResponse({
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
          },
          system: {
            uptime: Date.now() - startTime,
            isRunning: eng.isRunning(),
          },
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Payment - PromptPay QR generation
      if (url.pathname === '/payment/promptpay' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { amount, orderId, customer } = body;

        if (!amount || typeof amount !== 'number') {
          return jsonResponse({ error: 'Amount is required' }, 400, corsHeaders(origin));
        }

        // Generate PromptPay QR payload (Thailand QR payment standard)
        // Format: A00000067701011101130066840871065
        // A000000677 = PromptPay application ID
        // 010111 = Phone number type
        // 01130066 = Length + country code (66 for Thailand)
        // 840871065 = Phone number 0840871065 without leading 0
        const promptPayId = '0840871065';
        const qrPayload = generatePromptPayQR(amount, promptPayId, orderId as string);

        // Create payment record
        const paymentId = `pay_${Date.now()}`;
        
        return jsonResponse({
          paymentId,
          orderId: orderId || `order_${Date.now()}`,
          amount,
          currency: 'THB',
          method: 'promptpay',
          qrPayload,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`,
          merchant: {
            name: 'Sweet Layers Cake Shop',
            phone: promptPayId,
          },
          status: 'pending',
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Onboard new shop
      if (url.pathname === '/onboard' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { storeName, domain, owner, phone, promptPayId, lineToken, lineUserId, package: pkg, tenantId } = body;

        if (!storeName || !domain) {
          return jsonResponse({ error: 'Store name and domain are required' }, 400, corsHeaders(origin));
        }

        // Create tenant configuration
        const tenantConfig = {
          tenantId: tenantId || `shop_${Date.now()}`,
          storeName,
          domain,
          owner: owner || '',
          phone: phone || '',
          promptPayId: promptPayId || '0840871065',
          lineToken: lineToken || '',
          lineUserId: lineUserId || '',
          package: pkg || 'starter',
          createdAt: new Date().toISOString(),
          status: 'active'
        };

        // Store tenant config (in production, save to KV or database)
        // await env.TENANTS_KV.put(tenantConfig.tenantId, JSON.stringify(tenantConfig));

        // Create initial order for the tenant
        const goal = eng.submitGoal(
          `Onboard new shop: ${storeName}`,
          Priority.HIGH,
          { tenantConfig, type: 'onboarding' }
        );

        return jsonResponse({
          success: true,
          tenantId: tenantConfig.tenantId,
          goalId: goal.id,
          message: 'Shop onboarded successfully',
          urls: {
            shop: `https://${domain}.pages.dev`,
            dashboard: `https://${domain}.pages.dev/dashboard.html`
          },
          config: tenantConfig,
          timestamp: Date.now()
        }, 201, corsHeaders(origin));
      }

      // Payment status check
      if (url.pathname === '/payment/status' && method === 'GET') {
        const paymentId = url.searchParams.get('paymentId');
        
        return jsonResponse({
          paymentId: paymentId || 'unknown',
          status: 'pending', // Would check actual payment provider in production
          message: 'Please scan QR code with your banking app',
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Slip verification with OCR
      if (url.pathname === '/payment/verify-slip' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { imageBase64, paymentId, expectedAmount } = body;

        if (!imageBase64) {
          return jsonResponse({ error: 'Slip image is required' }, 400, corsHeaders(origin));
        }

        try {
          // Call OCR vision worker to detect slip
          const ocrResponse = await fetch('https://ocr-vision-worker.aekbuffalo.workers.dev/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: imageBase64,
              type: 'payment-slip',
              extract: ['amount', 'date', 'time', 'sender', 'receiver', 'ref']
            })
          });

          const ocrResult = await ocrResponse.json() as { amount?: string };

          // Validate slip details
          const detectedAmount = parseFloat(ocrResult?.amount || '0');
          const isValid = detectedAmount === expectedAmount;

          // Update order status if valid
          if (isValid && paymentId) {
            // In production, update order status in database
          }

          return jsonResponse({
            paymentId: paymentId || 'unknown',
            verified: isValid,
            detectedAmount,
            expectedAmount,
            details: ocrResult,
            status: isValid ? 'confirmed' : 'mismatch',
            timestamp: Date.now(),
            message: isValid ? 'Payment verified' : 'Amount mismatch - please check'
          }, 200, corsHeaders(origin));

        } catch (err) {
          return jsonResponse({
            error: 'OCR verification failed',
            message: err instanceof Error ? err.message : 'Unknown error',
            verified: false
          }, 500, corsHeaders(origin));
        }
      }

      // Authentication - Login
      if (url.pathname === '/auth/login' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { email, password, rememberMe } = body;

        if (!email || !password) {
          return jsonResponse({ 
            success: false, 
            message: 'Email and password are required' 
          }, 400, corsHeaders(origin));
        }

        // Mock authentication (replace with real auth in production)
        // Check against mock users or verify with database
        const mockUsers = [
          { email: 'admin@sweetlayers.com', password: 'admin123', name: 'Admin', tenantId: 'default', role: 'admin' },
          { email: 'demo@sweetlayers.com', password: 'demo123', name: 'Demo Shop', tenantId: 'shop_demo', role: 'shop' },
        ];

        // Normalize email/phone
        const normalizedEmail = String(email).toLowerCase().trim();
        const user = mockUsers.find(u => 
          u.email === normalizedEmail || 
          u.email.replace(/@.+$/, '') === normalizedEmail
        );

        if (!user || user.password !== password) {
          return jsonResponse({ 
            success: false, 
            message: 'Invalid email or password' 
          }, 401, corsHeaders(origin));
        }

        // Generate simple token (use JWT in production)
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return jsonResponse({
          success: true,
          token,
          user: {
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            role: user.role,
          },
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Authentication - Verify Token
      if (url.pathname === '/auth/verify' && method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ 
            success: false, 
            message: 'No token provided' 
          }, 401, corsHeaders(origin));
        }

        const token = authHeader.substring(7);
        
        // Verify token (mock validation)
        if (!token.startsWith('token_')) {
          return jsonResponse({ 
            success: false, 
            message: 'Invalid token' 
          }, 401, corsHeaders(origin));
        }

        return jsonResponse({
          success: true,
          valid: true,
          user: {
            email: 'admin@sweetlayers.com',
            name: 'Admin',
            tenantId: 'default',
            role: 'admin',
          },
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // ========== AGENTIC DASHBOARD API ENDPOINTS ==========
      
      // Decision validation from frontend agent
      if (url.pathname === '/api/agentic/validate' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { decision, context } = body;

        // Agentic engine validates the decision
        const confidence = (decision as Record<string, number>)?.confidence || 0.5;
        const decisionType = (decision as Record<string, string>)?.type || 'unknown';

        // Submit validation as a goal to the engine
        const validationGoal = eng.submitGoal(
          `Validate frontend decision: ${decisionType}`,
          Priority.MEDIUM,
          { decision, context, validationType: 'frontend' }
        );

        return jsonResponse({
          approved: confidence > 0.5,
          goalId: validationGoal.id,
          confidence,
          reasoning: confidence > 0.7 ? 'High confidence decision approved' : 'Low confidence, requires review',
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Receive observations from frontend agent
      if (url.pathname === '/api/agentic/observation' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { type, data, timestamp, sessionId, userId } = body;

        // Store observation in knowledge base
        eng.knowledge.set('observation', `${sessionId || 'anon'}_${Date.now()}`, {
          type,
          data,
          timestamp,
          sessionId,
          userId,
          receivedAt: Date.now()
        });

        // Create a goal if important observation
        if (type === 'navigation' && (data as Record<string, string>)?.to?.includes('checkout')) {
          eng.submitGoal(
            'User approaching checkout - optimize conversion',
            Priority.HIGH,
            { observation: body, action: 'optimize_checkout' }
          );
        }

        return jsonResponse({
          received: true,
          observationId: `obs_${Date.now()}`,
          processed: true,
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // Receive goals from frontend agent
      if (url.pathname === '/api/agentic/goal' && method === 'POST') {
        const body = await request.json() as Record<string, unknown>;
        const { description, priority = 'medium', context } = body;

        // Map string priority to enum
        const priorityMap: Record<string, number> = {
          critical: 0, high: 1, medium: 2, low: 3
        };
        const priorityNum = priorityMap[String(priority).toLowerCase()] || 2;

        // Submit goal to agentic engine
        const goal = eng.submitGoal(
          description as string,
          priorityNum as Priority,
          { ...context as Record<string, unknown>, source: 'frontend' }
        );

        return jsonResponse({
          goalId: goal.id,
          description: goal.description,
          priority: goal.priority,
          status: 'submitted',
          timestamp: Date.now(),
          message: 'Goal submitted to agentic engine',
        }, 201, corsHeaders(origin));
      }

      // Get agent metrics for dashboard
      if (url.pathname === '/api/agentic/metrics' && method === 'GET') {
        const metrics = eng.getMetrics();
        const learning = eng.learning.getStats();

        return jsonResponse({
          engine: {
            running: eng.isRunning(),
            tickCount: metrics.state === 'PERCEIVING' ? Date.now() % 1000 : 0,
            uptime: metrics.uptime,
          },
          performance: {
            tasksCompleted: metrics.tasksCompleted,
            tasksFailed: metrics.tasksFailed,
            avgDecisionTime: metrics.avgDecisionTime,
            knowledgeEntries: metrics.knowledgeEntries,
            experiences: metrics.experienceCount,
            modelAccuracy: metrics.modelAccuracy,
          },
          learning: {
            successRate: learning.successRate,
            avgReward: learning.avgReward,
            total: learning.total,
          },
          timestamp: Date.now(),
        }, 200, corsHeaders(origin));
      }

      // WebSocket upgrade for real-time sync
      if (url.pathname === '/ws' && method === 'GET') {
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader !== 'websocket') {
          return jsonResponse({ error: 'Expected WebSocket upgrade' }, 400, corsHeaders(origin));
        }

        // Create WebSocket pair
        const [client, server] = Object.values(new WebSocketPair());

        // Accept the WebSocket
        (server as WebSocket).accept();

        // Handle messages from frontend
        (server as WebSocket).addEventListener('message', (event) => {
          try {
            const msg = JSON.parse(event.data as string);
            
            // Handle different message types
            switch(msg.type) {
              case 'user:connect':
                (server as WebSocket).send(JSON.stringify({
                  type: 'connected',
                  message: 'Connected to agentic engine',
                  timestamp: Date.now(),
                }));
                break;

              case 'goal:request':
                // Create a goal from frontend request
                const goal = eng.submitGoal(
                  msg.data.description,
                  Priority.MEDIUM,
                  msg.data.context
                );
                (server as WebSocket).send(JSON.stringify({
                  type: 'goal:assigned',
                  goalId: goal.id,
                  timestamp: Date.now(),
                }));
                break;

              case 'ping':
                (server as WebSocket).send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;
            }
          } catch (err) {
            console.error('WebSocket message error:', err);
          }
        });

        // Push insights periodically
        const insightInterval = setInterval(() => {
          if ((server as WebSocket).readyState === 1) { // WebSocket.OPEN
            (server as WebSocket).send(JSON.stringify({
              type: 'insight:push',
              insight: {
                message: `Engine active - ${eng.getMetrics().tasksCompleted} tasks completed`,
                confidence: 0.9,
              },
              timestamp: Date.now(),
            }));
          } else {
            clearInterval(insightInterval);
          }
        }, 10000); // Every 10 seconds

        // Handle close
        (server as WebSocket).addEventListener('close', () => {
          clearInterval(insightInterval);
          console.log('WebSocket closed');
        });

        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      }

      // ========== END AGENTIC DASHBOARD API ==========

      // 404 for unhandled API routes
      console.log('API route not handled:', url.pathname);
      return new Response(JSON.stringify({ error: 'Not found', path: url.pathname }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });

    } catch (err) {
      return jsonResponse({
        error: 'Internal server error',
        message: err instanceof Error ? err.message : 'Unknown error',
      }, 500, corsHeaders(origin));
    }
  },
};

// Helper functions
function getRecommendations(category?: string, limit = 5): unknown[] {
  const products = [
    { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', price: 450 },
    { id: 2, name: 'Thai Tea Cake', category: 'cakes', price: 380 },
    { id: 3, name: 'Pandan Custard', category: 'pastries', price: 120 },
    { id: 4, name: 'Black Sesame Roll', category: 'pastries', price: 95 },
    { id: 5, name: 'Salted Egg Pastry', category: 'pastries', price: 150 },
  ];
  
  if (category) {
    return products.filter(p => 
      p.category === category || p.name.toLowerCase().includes(category.toLowerCase())
    ).slice(0, limit);
  }
  return products.slice(0, limit);
}

function getInventory(category?: string): unknown[] {
  const inventory = [
    { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', stock: 50, available: 45 },
    { id: 2, name: 'Thai Tea Cake', category: 'cakes', stock: 30, available: 28 },
    { id: 3, name: 'Pandan Custard', category: 'pastries', stock: 100, available: 90 },
  ];
  
  if (category) {
    return inventory.filter(i => i.category === category);
  }
  return inventory;
}

// Generate PromptPay QR payload (Thailand QR payment standard)
function generatePromptPayQR(amount: number, phone: string, ref?: string): string {
  // Remove leading 0 from phone and add country code
  const phoneWithCountry = '66' + phone.replace(/^0/, '');
  
  // Build TLV (Tag-Length-Value) structure
  function tlv(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return tag + length + value;
  }
  
  // PromptPay Application ID
  const appId = tlv('00', 'A000000677010111');
  
  // Phone number
  const phoneData = tlv('01', phoneWithCountry);
  
  // Country code
  const country = tlv('58', 'TH');
  
  // Currency (764 = THB)
  const currency = tlv('53', '764');
  
  // Amount (with 2 decimal places)
  const amountStr = amount.toFixed(2);
  const amountTlv = tlv('54', amountStr);
  
  // Reference (optional)
  let refData = '';
  if (ref) {
    refData = tlv('62', tlv('05', ref));
  }
  
  // Combine payload
  const payload = appId + phoneData + country + currency + amountTlv + refData + '6304';
  
  // Calculate CRC16 checksum
  const crc = calculateCRC16(payload.slice(0, -4));
  
  return payload + crc;
}

// CRC16 calculation for PromptPay
function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Durable Object for engine state (optional, for scaling)
export class EngineState {
  constructor(private state: DurableObjectState, private env: Env) {}
  
  async fetch(request: Request): Promise<Response> {
    return new Response('Engine State DO', { status: 200 });
  }
}
