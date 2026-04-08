/**
 * Unified Gateway - Single Entry Point for All Services
 * Combines Agentic Engine, Bakery Frontend, Admin Dashboard, Payment, Line Integration
 * Architecture inspired by Thai Rubber ERP unified system
 */
import { AgenticEngine } from './engine.js';
import { Priority } from './types/index.js';
// Engine instance (per-isolate, not per-request)
let engine = null;
function getEngine(env) {
    if (!engine) {
        engine = new AgenticEngine({
            id: env.ENGINE_NAME || 'agentic-engine',
            name: env.ENGINE_NAME || 'Agentic Engine',
            tickIntervalMs: 1000,
            maxConcurrentTasks: 10,
            maxRetries: 3,
            learningRate: 0.1,
            explorationRate: 0.1,
            decayRate: 0.01,
            logLevel: env.LOG_LEVEL || 'info',
            enableLearning: env.ENABLE_LEARNING === 'true',
            enableSelfImprovement: true,
            failSafeThreshold: 5,
            knowledgeRetentionDays: 30,
        });
    }
    return engine;
}
// CORS headers
function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
    };
}
// JSON response helper
function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}
// Simple JWT-like token generation (for demo purposes)
function generateToken(userId, roles) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        userId,
        roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }));
    const signature = btoa(`${header}.${payload}.secret`);
    return `${header}.${payload}.${signature}`;
}
// Verify token (simplified)
function verifyToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp < Math.floor(Date.now() / 1000))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
// Unified Gateway Service Discovery - Combines best features from all platforms
function getServiceDiscovery() {
    return {
        service: 'Universal Agentic Gateway - Sweet Layers',
        version: '3.0.0',
        architecture: 'Hybrid (AI + OCR + Pay + Transform + Email + Chat + Line + Multi-tenant)',
        description: 'Complete unified platform combining Thai Rubber ERP, Allverse, and Sweet Layers capabilities',
        inspiration: ['Thai Rubber ERP (Agentic AI)', 'Allverse Platform (OCR/Transform/Email)', 'Sweet Layers (Payment/Line)'],
        endpoints: {
            // Core Gateway
            gateway: 'GET /',
            health: 'GET /health',
            stats: 'GET /stats',
            timestamp: 'GET /timestamp',
            realtime: 'GET /realtime',
            // AI & OCR (from Allverse)
            ai: {
                process: 'POST /ai/process',
                ocr: 'POST /ai/ocr',
                vision: 'POST /ai/vision',
            },
            // Transform & Email (from Allverse)
            transform: {
                convert: 'POST /transform/convert',
                format: 'POST /transform/format',
            },
            email: {
                send: 'POST /email/send',
                template: 'POST /email/template',
            },
            // Payment (Allverse + Sweet Layers)
            payment: {
                promptpay: 'POST /payment/promptpay',
                status: 'GET /payment/status',
                verify: 'POST /payment/verify',
                webhook: 'POST /payment/webhook',
            },
            // Chat (Thai Rubber + Sweet Layers)
            chat: {
                commands: 'GET /chat/commands',
                process: 'POST /chat/process',
                sessions: 'GET /chat/sessions',
            },
            // Business Agents (Thai Rubber + Sweet Layers)
            agents: {
                dashboard: 'POST /agent/dashboard',
                automation: 'POST /agent/automation',
                insights: 'POST /agent/insights',
                inventory: 'POST /agent/inventory',
                orders: 'POST /agent/orders',
                customers: 'POST /agent/customers',
                harvest: 'POST /agent/harvest',
                weather: 'POST /agent/weather',
            },
            // Line Integration (Sweet Layers exclusive)
            line: {
                liff: 'GET /line/liff',
                webhook: 'POST /line/webhook',
                token: 'POST /line/token',
                oauth: 'POST /line/oauth',
            },
            // Authentication
            auth: {
                login: 'POST /auth/login',
                verify: 'GET /auth/verify',
                token: 'GET /auth/token',
                refresh: 'POST /auth/refresh',
                register: 'POST /auth/register',
                logout: 'POST /auth/logout',
            },
            // Members System (Shopify-like)
            members: {
                profile: 'GET /members/profile',
                updateProfile: 'PUT /members/profile',
                orders: 'GET /members/orders',
                addresses: 'GET /members/addresses',
                addAddress: 'POST /members/addresses',
                wishlist: 'GET /members/wishlist',
                addToWishlist: 'POST /members/wishlist',
                removeFromWishlist: 'DELETE /members/wishlist/:id',
            },
            // Admin & Management
            admin: {
                dashboard: 'GET /admin/dashboard',
                shops: 'GET /admin/shops',
                reports: 'GET /admin/reports',
                settings: 'GET /admin/settings',
                users: 'GET /admin/users',
            },
            // Agentic Engine Core
            agentic: {
                validate: 'POST /api/agentic/validate',
                observation: 'POST /api/agentic/observation',
                goal: 'POST /api/agentic/goal',
                metrics: 'GET /api/agentic/metrics',
                websocket: 'WS /ws',
            },
            // Triggers & Events
            triggers: {
                quote: 'POST /triggers/quote',
                order: 'POST /triggers/order',
                event: 'POST /triggers/event',
            },
            // Data Export
            export: {
                quotes: 'GET /export/quotes',
                orders: 'GET /export/orders',
                reports: 'GET /export/reports',
            },
            // Onboarding
            onboard: {
                shop: 'POST /onboard/shop',
                tenant: 'POST /onboard/tenant',
            },
        },
        features: [
            '🤖 AI Processing (GPT/Claude integration)',
            '👁️ OCR Vision (Document scanning)',
            '💳 Payment Processing (PromptPay + Cards)',
            '🔄 Data Transformation (Format conversion)',
            'Email System (Templates + Sending)',
            '💬 Chat Interface (Commands + Sessions)',
            '🏪 Business Agents (Dashboard, Automation, Insights)',
            '📦 Inventory Management',
            'Order Processing',
            '👥 Customer Management',
            '🌾 Agriculture Support (Harvest, Weather)',
            '💬 Line OA Integration (LIFF + Webhook)',
            '🔐 Authentication (JWT + OAuth)',
            '👨‍💼 Admin Panel (Multi-tenant)',
            '📊 Real-time Analytics',
            '🔌 WebSocket Support',
            '🌐 Multi-tenant Architecture',
            '🚀 API-first Design',
            '🛡️ CORS Enabled',
            '📱 Mobile Responsive',
        ],
        platforms: {
            thaiRubberERP: 'Agentic AI + Chat + Unix Controllers',
            allverse: 'AI + OCR + Pay + Transform + Email',
            sweetLayers: 'Payment + Line + Business Agents',
        },
        authentication: 'Bearer token (use /auth/login to generate)',
        documentation: 'Universal gateway with unified routing for all services',
    };
}
// Main fetch handler
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '*';
        // Serve frontend with real components
        if (url.pathname === '/frontend/index.html') {
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agentic Engine Dashboard</title>
  <link rel="stylesheet" href="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/styles/main.css">
</head>
<body>
  <div class="dashboard">
    <header>
      <div class="header-content">
        <h1>Universal Agentic Gateway</h1>
        <p class="subtitle">Real-time Dashboard - Powered by Backend API</p>
      </div>
      <div id="health-monitor"></div>
    </header>
    
    <main>
      <div class="dashboard-grid">
        <section class="card ai-section">
          <h2>AI Processing</h2>
          <div id="ai-processor"></div>
        </section>
        
        <section class="card chat-section">
          <h2>Chat Interface</h2>
          <div id="chat-interface"></div>
        </section>
        
        <section class="card agents-section">
          <h2>Business Agents</h2>
          <div id="agent-panel"></div>
        </section>
        
        <section class="card realtime-section">
          <h2>Realtime Data</h2>
          <div id="realtime-data"></div>
        </section>
        
        <section class="card api-section">
          <h2>API Information</h2>
          <div id="api-info"></div>
        </section>
        
        <section class="card automation-section">
          <h2>Automation Flow</h2>
          <div id="automation-flow"></div>
        </section>
      </div>
    </main>
    
    <footer>
      <p>Powered by Cloudflare Workers</p>
    </footer>
  </div>
  
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/api/client.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/components/HealthMonitor.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/components/ChatInterface.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/components/AIProcessor.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/components/AgentPanel.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/components/RealtimeClock.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/components/AutomationFlow.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/frontend/dashboard.js"></script>
  <script src="https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/test-automation-flow.js"></script>
</body>
</html>`;
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            });
        }
        // Serve static files for components
        if (url.pathname.startsWith('/frontend/') || url.pathname.startsWith('/images/') || url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/')) {
            try {
                // Use the assets binding for Workers Sites
                const response = await env.ASSETS.fetch(request);
                if (response.ok) {
                    return response;
                }
                return new Response('File not found', { status: 404 });
            }
            catch (error) {
                console.error('Static file error:', error);
                return new Response('Error serving static file', { status: 500 });
            }
        }
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(origin),
            });
        }
        const method = request.method;
        // Unified Gateway - Service Discovery at root
        if (url.pathname === '/' && method === 'GET') {
            return jsonResponse(getServiceDiscovery(), 200, corsHeaders(origin));
        }
        // Check if it's an API route (unified gateway routes)
        const isApiRoute = url.pathname.startsWith('/api') ||
            url.pathname.startsWith('/health') ||
            url.pathname.startsWith('/workers') ||
            url.pathname.startsWith('/triggers') ||
            url.pathname.startsWith('/export') ||
            url.pathname.startsWith('/chat') ||
            url.pathname.startsWith('/agent') ||
            url.pathname.startsWith('/payment') ||
            url.pathname.startsWith('/auth') ||
            url.pathname.startsWith('/members') ||
            url.pathname.startsWith('/orders') ||
            url.pathname.startsWith('/stats') ||
            url.pathname.startsWith('/onboard') ||
            url.pathname.startsWith('/admin') ||
            url.pathname.startsWith('/line') ||
            url.pathname.startsWith('/ai') ||
            url.pathname.startsWith('/transform') ||
            url.pathname.startsWith('/email') ||
            url.pathname.startsWith('/timestamp') ||
            url.pathname.startsWith('/realtime') ||
            url.pathname === '/chat' ||
            url.pathname === '/chat/commands' ||
            url.pathname === '/chat/process' ||
            url.pathname.startsWith('/chat/sessions') ||
            url.pathname.startsWith('/ws');
        // For API routes, process through the unified gateway
        if (isApiRoute) {
            const eng = getEngine(env);
            const startTime = Date.now();
            // Unified Router
            try {
                // Health check - enhanced with unified gateway info
                if (url.pathname === '/health' && method === 'GET') {
                    return jsonResponse({
                        status: eng.isRunning() ? 'healthy' : 'stopped',
                        timestamp: Date.now(),
                        version: '3.0.0',
                        service: 'Universal Agentic Gateway',
                        architecture: 'Hybrid (AI + OCR + Pay + Transform + Email + Chat + Line + Multi-tenant)',
                        platforms: {
                            thaiRubberERP: 'integrated',
                            allverse: 'integrated',
                            sweetLayers: 'integrated',
                        },
                        agents: ['dashboard', 'automation', 'insights', 'inventory', 'orders', 'customers', 'harvest', 'weather'],
                        features: ['ai', 'ocr', 'pay', 'transform', 'email', 'chat', 'line', 'multi-tenant'],
                        uptime: Date.now() - startTime,
                    }, 200, corsHeaders(origin));
                }
                // Authentication endpoints
                if (url.pathname === '/auth/login' && method === 'POST') {
                    const body = await request.json();
                    const { email, password, recaptchaToken } = body;
                    // Verify reCAPTCHA token (if provided)
                    if (recaptchaToken) {
                        try {
                            const recaptchaVerify = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `secret=${encodeURIComponent('6Ld_7CgqAAAAAKqZ9Q8q7q7q7q7q7q7q7q7q7q7q')}&response=${encodeURIComponent(recaptchaToken)}`
                            });
                            const recaptchaResult = await recaptchaVerify.json();
                            if (!recaptchaResult.success || (recaptchaResult.score && recaptchaResult.score < 0.5)) {
                                return jsonResponse({ error: 'reCAPTCHA verification failed' }, 400, corsHeaders(origin));
                            }
                        }
                        catch (recaptchaError) {
                            console.error('reCAPTCHA verification error:', recaptchaError);
                            // Continue without reCAPTCHA for development
                        }
                    }
                    try {
                        // Query database for user
                        const result = await env.bizcommerz_db.prepare('SELECT id, name, email, roles FROM users WHERE email = ? AND password = ?').bind(email, password).first();
                        if (!result) {
                            return jsonResponse({ error: 'Invalid credentials' }, 401, corsHeaders(origin));
                        }
                        const user = {
                            id: result.id,
                            name: result.name,
                            email: result.email,
                            roles: JSON.parse(result.roles || '[]'),
                        };
                        const token = generateToken(user.id, user.roles);
                        return jsonResponse({
                            success: true,
                            token,
                            user,
                        }, 200, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Login error:', error);
                        return jsonResponse({ error: 'Login failed' }, 500, corsHeaders(origin));
                    }
                }
                if (url.pathname === '/auth/register' && method === 'POST') {
                    const body = await request.json();
                    const { name, email, password, recaptchaToken } = body;
                    // Verify reCAPTCHA token (if provided)
                    if (recaptchaToken) {
                        try {
                            const recaptchaVerify = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `secret=${encodeURIComponent('6Ld_7CgqAAAAAKqZ9Q8q7q7q7q7q7q7q7q7q7q')}&response=${encodeURIComponent(recaptchaToken)}`
                            });
                            const recaptchaResult = await recaptchaVerify.json();
                            if (!recaptchaResult.success || (recaptchaResult.score && recaptchaResult.score < 0.5)) {
                                return jsonResponse({ error: 'reCAPTCHA verification failed' }, 400, corsHeaders(origin));
                            }
                        }
                        catch (recaptchaError) {
                            console.error('reCAPTCHA verification error:', recaptchaError);
                            // Continue without reCAPTCHA for development
                        }
                    }
                    try {
                        // Check if user already exists
                        const existing = await env.bizcommerz_db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
                        if (existing) {
                            return jsonResponse({ error: 'Email already registered' }, 409, corsHeaders(origin));
                        }
                        // Create new user with 'user' role by default
                        const result = await env.bizcommerz_db.prepare('INSERT INTO users (name, email, password, roles, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id').bind(name, email, password, JSON.stringify(['user']), new Date().toISOString()).first();
                        const user = {
                            id: result?.id,
                            name,
                            email,
                            roles: ['user'],
                        };
                        const token = generateToken(user.id, user.roles);
                        return jsonResponse({
                            success: true,
                            token,
                            user,
                        }, 201, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Registration error:', error);
                        return jsonResponse({ error: 'Registration failed' }, 500, corsHeaders(origin));
                    }
                }
                // Guest checkout endpoint
                if (url.pathname === '/orders/guest' && method === 'POST') {
                    const body = await request.json();
                    const { customer, phone, email, address, items, total, payment } = body;
                    try {
                        // Create customer record if email provided
                        let customerId = null;
                        if (email) {
                            const existingCustomer = await env.bizcommerz_db.prepare('SELECT id FROM customers WHERE email = ?').bind(email).first();
                            if (existingCustomer) {
                                customerId = existingCustomer.id;
                            }
                            else {
                                const newCustomer = await env.bizcommerz_db.prepare('INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?) RETURNING id').bind(customer, email, phone, address).first();
                                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                    return jsonResponse({ error: 'No token provided' }, 401, corsHeaders(origin));
                                }
                                const token = authHeader.substring(7);
                                const payload = verifyToken(token);
                                if (!payload) {
                                    return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                                }
                                return jsonResponse({ valid: true, userId: payload.userId, roles: payload.roles }, 200, corsHeaders(origin));
                            }
                            // Members system endpoints
                            if (url.pathname === '/members/profile' && method === 'GET') {
                                const authHeader = request.headers.get('Authorization');
                                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders(origin));
                                }
                                const token = authHeader.substring(7);
                                const payload = verifyToken(token);
                                if (!payload) {
                                    return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                                }
                                try {
                                    const result = await env.bizcommerz_db.prepare('SELECT id, name, email, roles, phone, created_at FROM users WHERE id = ?').bind(payload.userId).first();
                                    return jsonResponse({ profile: result }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Profile fetch error:', error);
                                    return jsonResponse({ error: 'Failed to fetch profile' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/members/orders' && method === 'GET') {
                                const authHeader = request.headers.get('Authorization');
                                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders(origin));
                                }
                                const token = authHeader.substring(7);
                                const payload = verifyToken(token);
                                if (!payload) {
                                    return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                                }
                                try {
                                    const result = await env.bizcommerz_db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').bind(payload.userId).all();
                                    return jsonResponse({ orders: result.results || [] }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Orders fetch error:', error);
                                    return jsonResponse({ error: 'Failed to fetch orders' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/members/addresses' && method === 'GET') {
                                const authHeader = request.headers.get('Authorization');
                                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders(origin));
                                }
                                const token = authHeader.substring(7);
                                const payload = verifyToken(token);
                                if (!payload) {
                                    return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                                }
                                try {
                                    const result = await env.bizcommerz_db.prepare('SELECT * FROM addresses WHERE user_id = ?').bind(payload.userId).all();
                                    return jsonResponse({ addresses: result.results || [] }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Addresses fetch error:', error);
                                    return jsonResponse({ error: 'Failed to fetch addresses' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/members/addresses' && method === 'POST') {
                                const authHeader = request.headers.get('Authorization');
                                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders(origin));
                                }
                                const token = authHeader.substring(7);
                                const payload = verifyToken(token);
                                if (!payload) {
                                    return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                                }
                                const body = await request.json();
                                const { address_line1, address_line2, city, state, postal_code, country, is_default } = body;
                                try {
                                    const result = await env.bizcommerz_db.prepare('INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id').bind(payload.userId, address_line1, address_line2 || '', city, state, postal_code, country, is_default || 0, new Date().toISOString(), new Date().toISOString()).first();
                                    return jsonResponse({
                                        success: true,
                                        address_id: result?.id,
                                    }, 201, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Address creation error:', error);
                                    return jsonResponse({ error: 'Failed to create address' }, 500, corsHeaders(origin));
                                }
                            }
                            // AI & OCR endpoints (from Allverse)
                            if (url.pathname === '/ai/process' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`AI process: ${body.task || 'general'}`, Priority.HIGH);
                                return jsonResponse({
                                    ai: 'process',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'AI processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/ai/ocr' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`OCR vision: ${body.type || 'document'}`, Priority.HIGH);
                                return jsonResponse({
                                    ai: 'ocr',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'OCR processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            // Transform endpoints (from Allverse)
                            if (url.pathname === '/transform/convert' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Transform convert: ${body.format || 'json'}`, Priority.MEDIUM);
                                return jsonResponse({
                                    transform: 'convert',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Data transformation request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            // Agentic API endpoints
                            if (url.pathname === '/api/agentic/validate' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Validate: ${JSON.stringify(body)}`, Priority.MEDIUM);
                                return jsonResponse({
                                    agentic: 'validate',
                                    goalId: goal.id,
                                    status: 'validated',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/api/agentic/observation' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Observation: ${body.type || 'general'}`, Priority.LOW);
                                return jsonResponse({
                                    agentic: 'observation',
                                    goalId: goal.id,
                                    status: 'recorded',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/api/agentic/goal' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(body.description || 'New goal', Priority[body.priority] || Priority.MEDIUM);
                                return jsonResponse({
                                    agentic: 'goal',
                                    goalId: goal.id,
                                    status: 'submitted',
                                    goal: goal,
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/api/agentic/metrics' && method === 'GET') {
                                return jsonResponse({
                                    agentic: 'metrics',
                                    metrics: eng.getMetrics(),
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            // Business Agent endpoints
                            if (url.pathname === '/agent/dashboard' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Dashboard agent: ${body.action || 'analyze'}`, Priority.HIGH);
                                return jsonResponse({
                                    agent: 'dashboard',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Dashboard agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/automation' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Automation agent: ${body.action || 'execute'}`, Priority.HIGH);
                                return jsonResponse({
                                    agent: 'automation',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Automation agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/insights' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Insights agent: ${body.action || 'analyze'}`, Priority.MEDIUM);
                                return jsonResponse({
                                    agent: 'insights',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Insights agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/inventory' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Inventory agent: ${body.action || 'check'}`, Priority.MEDIUM);
                                return jsonResponse({
                                    agent: 'inventory',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Inventory agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/orders' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Orders agent: ${body.action || 'process'}`, Priority.HIGH);
                                return jsonResponse({
                                    agent: 'orders',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Orders agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/customers' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Customers agent: ${body.action || 'analyze'}`, Priority.MEDIUM);
                                return jsonResponse({
                                    agent: 'customers',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Customers agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/harvest' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Harvest agent: ${body.action || 'check'}`, Priority.MEDIUM);
                                return jsonResponse({
                                    agent: 'harvest',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Harvest agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/agent/weather' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Weather agent: ${body.action || 'check'}`, Priority.LOW);
                                return jsonResponse({
                                    agent: 'weather',
                                    goalId: goal.id,
                                    status: 'processing',
                                    message: 'Weather agent processing request',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/chat/commands' && method === 'GET') {
                                return jsonResponse({
                                    commands: [
                                        { id: 'search', description: 'Search products' },
                                        { id: 'ask', description: 'Ask about products' },
                                        { id: 'order', description: 'Place order' },
                                        { id: 'help', description: 'Get help' },
                                    ],
                                    gateway: 'unified',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/chat/process' && method === 'POST') {
                                const body = await request.json();
                                const goal = eng.submitGoal(`Chat process: ${body.message || 'general inquiry'}`, Priority.MEDIUM);
                                return jsonResponse({
                                    chat: 'process',
                                    goalId: goal.id,
                                    response: `Thank you for your message: "${body.message}". I'm processing your request through the unified gateway.`,
                                    message: body.message,
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname.startsWith('/chat/sessions') && method === 'GET') {
                                return jsonResponse({
                                    sessions: [],
                                    gateway: 'unified',
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            // Real-time timestamp endpoints
                            if (url.pathname === '/timestamp' && method === 'GET') {
                                const now = new Date();
                                return jsonResponse({
                                    timestamp: Date.now(),
                                    iso: now.toISOString(),
                                    unix: Math.floor(Date.now() / 1000),
                                    utc: now.toUTCString(),
                                    locale: now.toLocaleString(),
                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                    service: 'Universal Agentic Gateway',
                                }, 200, corsHeaders(origin));
                            }
                            if (url.pathname === '/realtime' && method === 'GET') {
                                const now = new Date();
                                return jsonResponse({
                                    realtime: true,
                                    timestamp: Date.now(),
                                    iso: now.toISOString(),
                                    unix: Math.floor(Date.now() / 1000),
                                    milliseconds: now.getMilliseconds(),
                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                    offset: now.getTimezoneOffset(),
                                    service: 'Universal Agentic Gateway',
                                    engine: {
                                        running: eng.isRunning(),
                                        tickCount: eng.getMetrics().tasksCompleted,
                                    },
                                }, 200, corsHeaders(origin));
                            }
                            // Workers list - unified gateway agents
                            if (url.pathname === '/workers' && method === 'GET') {
                                return jsonResponse({
                                    workers: [
                                        // Business Agents (Sweet Layers)
                                        { name: 'dashboard-agent', type: 'business', status: 'available', platform: 'sweet-layers' },
                                        { name: 'automation-agent', type: 'business', status: 'available', platform: 'sweet-layers' },
                                        { name: 'insights-agent', type: 'analytics', status: 'available', platform: 'sweet-layers' },
                                        { name: 'inventory-agent', type: 'business', status: 'available', platform: 'sweet-layers' },
                                        { name: 'orders-agent', type: 'business', status: 'available', platform: 'sweet-layers' },
                                        { name: 'customers-agent', type: 'business', status: 'available', platform: 'sweet-layers' },
                                        // Agriculture Agents (Thai Rubber ERP)
                                        { name: 'harvest-agent', type: 'agriculture', status: 'available', platform: 'thai-rubber-erp' },
                                        { name: 'weather-agent', type: 'agriculture', status: 'available', platform: 'thai-rubber-erp' },
                                        { name: 'supply-chain-agent', type: 'logistics', status: 'available', platform: 'thai-rubber-erp' },
                                        // AI/OCR Agents (Allverse)
                                        { name: 'ai-processor', type: 'ai', status: 'available', platform: 'allverse' },
                                        { name: 'ocr-vision', type: 'vision', status: 'available', platform: 'allverse' },
                                        { name: 'transform-engine', type: 'data', status: 'available', platform: 'allverse' },
                                        { name: 'email-sender', type: 'communication', status: 'available', platform: 'allverse' },
                                        // Infrastructure
                                        { name: 'cors-proxy', type: 'infrastructure', status: 'available', platform: 'shared' },
                                        { name: 'chat-processor', type: 'nlp', status: 'available', platform: 'shared' },
                                        { name: 'payment-processor', type: 'finance', status: 'available', platform: 'shared' },
                                        { name: 'line-integration', type: 'communication', status: 'available', platform: 'sweet-layers' },
                                    ],
                                    total: 16,
                                    available: 16,
                                    platforms: {
                                        'sweet-layers': 7,
                                        'thai-rubber-erp': 3,
                                        'allverse': 4,
                                        'shared': 2,
                                    },
                                    timestamp: Date.now(),
                                }, 200, corsHeaders(origin));
                            }
                            // D1 Database API endpoints
                            if (url.pathname === '/db/products' && method === 'GET') {
                                const category = url.searchParams.get('category');
                                try {
                                    const query = category
                                        ? 'SELECT * FROM products WHERE category = $1'
                                        : 'SELECT * FROM products';
                                    const params = category ? [category] : [];
                                    const result = await env.bizcommerz_db.prepare(query).bind(...params).all();
                                    return jsonResponse({ products: result.results || [], count: result.results?.length || 0 }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Database error:', error);
                                    return jsonResponse({ error: 'Database query failed' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/db/orders' && method === 'POST') {
                                try {
                                    const body = await request.json();
                                    const { customer_id, items, total } = body;
                                    const result = await env.bizcommerz_db.prepare('INSERT INTO orders (customer_id, total, status, payment_status) VALUES (?, ?, ?, ?) RETURNING id').bind(customer_id || null, total, 'pending', 'pending').first();
                                    return jsonResponse({ order_id: result?.id, status: 'pending' }, 201, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Database error:', error);
                                    return jsonResponse({ error: 'Database query failed' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/db/orders' && method === 'GET') {
                                try {
                                    const customer_id = url.searchParams.get('customer_id');
                                    const status = url.searchParams.get('status');
                                    let query = 'SELECT * FROM orders';
                                    const params = [];
                                    if (customer_id || status) {
                                        query += ' WHERE';
                                        const conditions = [];
                                        if (customer_id) {
                                            conditions.push(' customer_id = ?');
                                            params.push(customer_id);
                                        }
                                        if (status) {
                                            conditions.push(' status = ?');
                                            params.push(status);
                                        }
                                        query += conditions.join(' AND');
                                    }
                                    const result = await env.bizcommerz_db.prepare(query).bind(...params).all();
                                    return jsonResponse({ orders: result.results || [], count: result.results?.length || 0 }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Database error:', error);
                                    return jsonResponse({ error: 'Database query failed' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/db/categories' && method === 'GET') {
                                try {
                                    const result = await env.bizcommerz_db.prepare('SELECT * FROM categories ORDER BY display_order').all();
                                    return jsonResponse({ categories: result.results || [] }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Database error:', error);
                                    return jsonResponse({ error: 'Database query failed' }, 500, corsHeaders(origin));
                                }
                            }
                            if (url.pathname === '/db/inventory' && method === 'GET') {
                                try {
                                    const result = await env.bizcommerz_db.prepare('SELECT p.id, p.name, p.category, p.price, i.quantity FROM products p LEFT JOIN inventory i ON p.id = i.product_id').all();
                                    return jsonResponse({ inventory: result.results || [] }, 200, corsHeaders(origin));
                                }
                                catch (error) {
                                    console.error('Database error:', error);
                                    return jsonResponse({ error: 'Database query failed' }, 500, corsHeaders(origin));
                                }
                            }
                            // Root API endpoint
                            if (url.pathname === '/api' && method === 'GET') {
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
                            // Default API response
                            return jsonResponse({
                                error: 'API endpoint not found',
                                path: url.pathname,
                                method: method,
                            }, 404, corsHeaders(origin));
                        }
                    }
                    catch (error) {
                        console.error('API Error:', error);
                        return jsonResponse({
                            error: 'Internal server error',
                            message: error instanceof Error ? error.message : 'Unknown error',
                        }, 500, corsHeaders(origin));
                    }
                }
                // For non-API routes, let Workers Sites handle static files automatically
                return fetch(request);
            }
            finally { }
            ;
        }
    }
};
//# sourceMappingURL=worker-broken.js.map