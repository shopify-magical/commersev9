/**
 * Cloudflare Workers entry point for Agentic Engine
 * Adapts the Node.js server for Edge runtime
 */
import { AgenticEngine } from './orchestrator/index.js';
import { Priority } from './types/index.js';
// Engine instance (per-isolate, not per-request)
let engine = null;
// Initialize engine singleton
function getEngine(env) {
    if (!engine) {
        engine = new AgenticEngine({
            name: env.ENGINE_NAME || 'CloudflareEngine',
            tickIntervalMs: 5000,
            logLevel: env.LOG_LEVEL || 'info',
            enableLearning: env.ENABLE_LEARNING !== 'false',
            enableSelfImprovement: true,
        });
        engine.start().catch(console.error);
    }
    return engine;
}
// CORS headers
function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
    };
}
// JSON response helper
function jsonResponse(data, status = 200, headers) {
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
    async fetch(request, env, ctx) {
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
        const eng = getEngine(env);
        const startTime = Date.now();
        // Router
        try {
            // Health check
            if (url.pathname === '/health' && method === 'GET') {
                return jsonResponse({
                    status: eng.isRunning() ? 'healthy' : 'stopped',
                    uptime: Date.now() - startTime,
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
                const body = await request.json();
                const { customer, items, contact, notes, tenantId = 'default' } = body;
                const quoteId = `quote_${Date.now()}`;
                const goal = eng.submitGoal(`Quote request: ${customer} - ${items?.length || 0} items`, Priority.HIGH, { quoteId, customer, items, contact, notes, tenantId, status: 'pending' });
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
                const body = await request.json();
                const { customer, items, delivery, payment, tenantId = 'default' } = body;
                const orderId = `order_${Date.now()}`;
                
                // Submit goal if engine available
                let goalId = null;
                try {
                    if (eng && eng.submitGoal) {
                        const goal = eng.submitGoal(`Process order: ${customer} - ${items?.length || 0} items`, Priority.CRITICAL, { orderId, customer, items, delivery, payment, tenantId, status: 'new' });
                        goalId = goal.id;
                    }
                } catch (e) {
                    console.log('Goal submission skipped:', e.message);
                }
                
                // Store order if KV available, otherwise just return success
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
                        console.log('KV storage error:', kvErr.message);
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
                const quotes = [];
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
                    const rows = quotes.map(q => `${q.id},"${q.customer}","${q.items}","${q.contact}","${q.notes}",${q.status},${q.createdAt}`).join('\n');
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
                const orders = [];
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
                    const rows = orders.map(o => `${o.id},"${o.customer}","${o.items}","${o.delivery}",${o.payment},${o.status},${o.createdAt}`).join('\n');
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
                const body = await request.json();
                const { message, sessionId, tenantId } = body;
                if (!message) {
                    return jsonResponse({ error: 'Message is required' }, 400, corsHeaders(origin));
                }
                // Parse command
                const commandMatch = message.match(/^\/(\w+)(?:\s+(.+))?$/);
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
                }
                else {
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
                const body = await request.json();
                const { goal, workers = [], context } = body;
                if (!goal) {
                    return jsonResponse({ error: 'Goal is required' }, 400, corsHeaders(origin));
                }
                const jobId = `job_${Date.now()}`;
                const workerList = workers.length > 0 ? workers : ['default'];
                const assignments = workerList.map((worker, idx) => ({
                    taskId: `${jobId}_${idx}`,
                    worker,
                    task: `Process: ${goal}`,
                    status: 'assigned',
                }));
                const orchestrationGoal = eng.submitGoal(`Orchestrate: ${goal}`, Priority.HIGH, { jobId, assignments, context, strategy: 'manager-worker' });
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
                const body = await request.json();
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
                const qrPayload = generatePromptPayQR(amount, promptPayId, orderId);
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
                const body = await request.json();
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
                const goal = eng.submitGoal(`Onboard new shop: ${storeName}`, Priority.HIGH, { tenantConfig, type: 'onboarding' });
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
                const body = await request.json();
                const { imageBase64, paymentId, expectedAmount } = body;
                if (!imageBase64) {
                    return jsonResponse({ error: 'Slip image is required' }, 400, corsHeaders(origin));
                }
                // Skip OCR in demo mode - just verify slip was uploaded
                const isValid = true;
                let ocrResult = { amount: expectedAmount, status: 'verified' };
                
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
                    ocrResult = await ocrResponse.json();
                    const detectedAmount = parseFloat(ocrResult.amount || '0');
                    // Allow within 5 THB variance
                    const isValid = Math.abs(detectedAmount - expectedAmount) <= 5;
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
                }
                catch (err) {
                    return jsonResponse({
                        error: 'OCR verification failed',
                        message: err instanceof Error ? err.message : 'Unknown error',
                        verified: false
                    }, 500, corsHeaders(origin));
                }
            }
            // Authentication - Login
            if (url.pathname === '/auth/login' && method === 'POST') {
                const body = await request.json();
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
                const user = mockUsers.find(u => u.email === normalizedEmail ||
                    u.email.replace(/@.+$/, '') === normalizedEmail);
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
            // 404
            return jsonResponse({ error: 'Not found', path: url.pathname }, 404, corsHeaders(origin));
        }
        catch (err) {
            return jsonResponse({
                error: 'Internal server error',
                message: err instanceof Error ? err.message : 'Unknown error',
            }, 500, corsHeaders(origin));
        }
    },
};
// Helper functions
function getRecommendations(category, limit = 5) {
    const products = [
        { id: 1, name: 'Heritage Mooncake', category: 'mooncakes', price: 450 },
        { id: 2, name: 'Thai Tea Cake', category: 'cakes', price: 380 },
        { id: 3, name: 'Pandan Custard', category: 'pastries', price: 120 },
        { id: 4, name: 'Black Sesame Roll', category: 'pastries', price: 95 },
        { id: 5, name: 'Salted Egg Pastry', category: 'pastries', price: 150 },
    ];
    if (category) {
        return products.filter(p => p.category === category || p.name.toLowerCase().includes(category.toLowerCase())).slice(0, limit);
    }
    return products.slice(0, limit);
}
function getInventory(category) {
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
function generatePromptPayQR(amount, phone, ref) {
    // Remove leading 0 from phone and add country code
    const phoneWithCountry = '66' + phone.replace(/^0/, '');
    // Build TLV (Tag-Length-Value) structure
    function tlv(tag, value) {
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
function calculateCRC16(data) {
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
    state;
    env;
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }
    async fetch(request) {
        return new Response('Engine State DO', { status: 200 });
    }
}
//# sourceMappingURL=worker.js.map