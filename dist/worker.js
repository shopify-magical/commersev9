/**
 * Sweet Layers Agentic Engine - Cloudflare Worker
 * Unified API Gateway for all services
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { routeAgentRequest, Agent, callable } from 'agents';
// CORS headers helper
function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };
}
// JSON response helper
function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}
// Proper JWT with HMAC-SHA256 signing using Web Crypto API
const JWT_SECRET = 'sweet-layers-secret-key-2024-change-in-production';
async function generateToken(userId, roles) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    const payload = {
        userId,
        roles,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        iat: Math.floor(Date.now() / 1000)
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = await hmacSha256(data, JWT_SECRET);
    return `${data}.${signature}`;
}
function base64UrlEncode(str) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4)
        str += '=';
    return atob(str);
}
async function hmacSha256(message, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    return signatureBase64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
async function verifyToken(token) {
    try {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        if (!encodedHeader || !encodedPayload || !signature) {
            return null;
        }
        const data = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = await hmacSha256(data, JWT_SECRET);
        if (signature !== expectedSignature) {
            return null;
        }
        const decodedPayload = base64UrlDecode(encodedPayload);
        const dataJson = JSON.parse(decodedPayload);
        // Check expiration
        if (dataJson.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return dataJson;
    }
    catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}
// UUID generator for owner UIDs
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// Product catalog for chat recommendations
const productCatalog = [
    { id: 'mooncake-traditional', name: 'Traditional Mooncakes', desc: 'Lotus paste, red bean, mung bean with salted egg yolk', price: 'From $8', tags: ['mooncake', 'classic', 'lotus', 'red bean', 'mung bean', 'traditional', 'gift'], img: 'images/mooncake-traditional.webp', category: 'Classic' },
    { id: 'pastry-arrangement', name: 'Pastry Arrangement Box', desc: 'Curated gift boxes with assorted pastries', price: 'From $45', tags: ['gift', 'box', 'arrangement', 'assorted', 'curated', 'present'], img: 'images/pastry-arrangement.webp', category: 'Signature' },
    { id: 'pandan-custard', name: 'Pandan Custard Cake', desc: 'Fragrant pandan sponge layered with silky coconut custard cream', price: 'From $32', tags: ['pandan', 'custard', 'cake', 'coconut', 'layer', 'popular'], img: 'images/pandan-custard.webp', category: 'Popular' },
    { id: 'black-sesame', name: 'Black Sesame Layer Cake', desc: 'Rich roasted sesame cream between delicate sponge layers', price: 'From $35', tags: ['sesame', 'black', 'cake', 'layer', 'roasted', 'specialty'], img: 'images/black-sesame.webp', category: 'Specialty' },
    { id: 'salted-egg', name: 'Salted Egg Lava Pastry', desc: 'Flaky crust with molten salted egg custard center', price: 'From $6', tags: ['salted', 'egg', 'lava', 'pastry', 'flaky', 'custard', 'new'], img: 'images/salted-egg.webp', category: 'New' },
    { id: 'taro-coconut', name: 'Taro Coconut Cake', desc: 'Creamy taro mousse with coconut shreds on a buttery biscuit base', price: 'From $28', tags: ['taro', 'coconut', 'cake', 'mousse', 'seasonal'], img: 'images/taro-coconut.webp', category: 'Seasonal' },
    { id: 'mung-bean', name: 'Mung Bean Pastry', desc: 'Smooth mung bean paste in a golden, flaky traditional pastry shell', price: 'From $5', tags: ['mung', 'bean', 'pastry', 'flaky', 'traditional', 'heritage'], img: 'images/mung-bean.webp', category: 'Heritage' },
    { id: 'red-bean', name: 'Red Bean Delight', desc: 'Sweet red bean paste wrapped in a soft, pillowy mochi-style shell', price: 'From $5', tags: ['red', 'bean', 'mochi', 'sweet', 'classic'], img: 'images/red-bean.webp', category: 'Classic' },
];
function getRelevantProducts(query) {
    if (!query || query.trim().length === 0)
        return [];
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    return productCatalog
        .map(product => {
        let score = 0;
        const nameLower = product.name.toLowerCase();
        const descLower = product.desc.toLowerCase();
        const tagsStr = product.tags.join(' ').toLowerCase();
        const catLower = product.category.toLowerCase();
        for (const word of words) {
            if (nameLower.includes(word))
                score += 10;
            if (catLower.includes(word))
                score += 5;
            if (tagsStr.includes(word))
                score += 3;
            if (descLower.includes(word))
                score += 1;
        }
        // Exact name match bonus
        if (nameLower === q)
            score += 20;
        // Starts with bonus
        if (nameLower.startsWith(q))
            score += 8;
        return { ...product, score };
    })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
}
// Main fetch handler
export default {
    async fetch(request, env, ctx) {
        console.log('[Worker] Dashboard route fix deployed - serving local-dashboard.html');
        // Route agent requests first
        const agentResponse = await routeAgentRequest(request, env);
        if (agentResponse) {
            return agentResponse;
        }
        const url = new URL(request.url);
        const origin = request.headers.get('origin') || '*';
        const method = request.method;
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
        // Serve dashboard.html for /dashboard route
        if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
            const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sweet Layers Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FDF9F5; padding: 20px; }
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .header { background: #2A6B52; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .stat { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat h3 { color: #3D2E22; margin-bottom: 8px; font-size: 0.9rem; }
    .stat .value { font-size: 2rem; font-weight: bold; color: #2A6B52; }
    .stat .change { font-size: 0.8rem; color: #16a34a; }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>Sweet Layers Dashboard</h1>
      <p>Welcome back! Here's your business overview.</p>
    </div>
    <div class="stats">
      <div class="stat">
        <h3>Total Revenue</h3>
        <div class="value">฿45,230</div>
        <div class="change">+12.5% from last month</div>
      </div>
      <div class="stat">
        <h3>Total Orders</h3>
        <div class="value">328</div>
        <div class="change">+8.2% from last month</div>
      </div>
      <div class="stat">
        <h3>Active Customers</h3>
        <div class="value">1,247</div>
        <div class="change">+15.3% from last month</div>
      </div>
      <div class="stat">
        <h3>Conversion Rate</h3>
        <div class="value">3.2%</div>
        <div class="change" style="color: #ef4444;">-0.8% from last month</div>
      </div>
    </div>
  </div>
</body>
</html>`;
            return new Response(dashboardHtml, {
                headers: {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: corsHeaders(origin),
            });
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
            url.pathname === '/init-db' ||
            url.pathname === '/chat' ||
            url.pathname === '/chat/commands' ||
            url.pathname === '/chat/process' ||
            url.pathname.startsWith('/chat/sessions') ||
            url.pathname.startsWith('/ws');
        // For API routes, process through unified gateway
        if (isApiRoute) {
            const startTime = Date.now();
            // Unified Router
            try {
                // Health check - enhanced with unified gateway info
                if (url.pathname === '/health' && method === 'GET') {
                    return jsonResponse({
                        status: 'healthy',
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
                                body: `secret=${encodeURIComponent('6Ld_7CgqAAAAAKqZ9Q8q7q7q7q7q7q7q7q7q7q')}&response=${encodeURIComponent(recaptchaToken)}`
                            });
                            const recaptchaResult = await recaptchaVerify.json();
                            if (!recaptchaResult.success) {
                                return jsonResponse({ error: 'reCAPTCHA verification failed' }, 400, corsHeaders(origin));
                            }
                        }
                        catch (error) {
                            console.error('reCAPTCHA verification error:', error);
                            return jsonResponse({ error: 'reCAPTCHA verification error' }, 500, corsHeaders(origin));
                        }
                    }
                    try {
                        const result = await env.bizcommerz_db.prepare('SELECT id, name, email, phone, roles, password FROM users WHERE email = ?').bind(email).first();
                        if (!result) {
                            return jsonResponse({ error: 'User not found' }, 404, corsHeaders(origin));
                        }
                        // Simple password check (in production, use bcrypt)
                        if (result.password !== password) {
                            return jsonResponse({ error: 'Invalid password' }, 401, corsHeaders(origin));
                        }
                        const roles = result.roles ? JSON.parse(result.roles) : [];
                        const token = await generateToken(result.id.toString(), roles);
                        return jsonResponse({
                            success: true,
                            token,
                            user: {
                                id: result.id,
                                name: result.name,
                                email: result.email,
                                phone: result.phone,
                                roles
                            }
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
                            if (!recaptchaResult.success) {
                                return jsonResponse({ error: 'reCAPTCHA verification failed' }, 400, corsHeaders(origin));
                            }
                        }
                        catch (error) {
                            console.error('reCAPTCHA verification error:', error);
                            return jsonResponse({ error: 'reCAPTCHA verification error' }, 500, corsHeaders(origin));
                        }
                    }
                    try {
                        // Check if user already exists
                        const existingUser = await env.bizcommerz_db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
                        if (existingUser) {
                            return jsonResponse({ error: 'User already exists' }, 409, corsHeaders(origin));
                        }
                        // Generate UUID for owner_uid
                        const ownerUid = generateUUID();
                        // Create new user
                        const result = await env.bizcommerz_db.prepare('INSERT INTO users (name, email, password, roles, owner_uid, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id').bind(name, email, password, JSON.stringify(['customer']), ownerUid, new Date().toISOString()).first();
                        const roles = ['customer'];
                        const token = await generateToken(result?.id?.toString() || '', roles);
                        return jsonResponse({
                            success: true,
                            token,
                            user: {
                                id: result?.id,
                                name,
                                email,
                                roles,
                                owner_uid: ownerUid
                            }
                        }, 201, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Registration error:', error);
                        return jsonResponse({ error: 'Registration failed' }, 500, corsHeaders(origin));
                    }
                }
                if (url.pathname === '/auth/verify' && method === 'GET') {
                    const authHeader = request.headers.get('Authorization');
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return jsonResponse({ error: 'No token provided' }, 401, corsHeaders(origin));
                    }
                    const token = authHeader.substring(7);
                    const payload = await verifyToken(token);
                    if (!payload) {
                        return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                    }
                    try {
                        const result = await env.bizcommerz_db.prepare('SELECT id, name, email, phone, roles, owner_uid FROM users WHERE id = ?').bind(payload.userId).first();
                        if (!result) {
                            return jsonResponse({ error: 'User not found' }, 404, corsHeaders(origin));
                        }
                        return jsonResponse({
                            valid: true,
                            user: {
                                id: result.id,
                                name: result.name,
                                email: result.email,
                                phone: result.phone,
                                roles: result.roles ? JSON.parse(result.roles) : [],
                                owner_uid: result.owner_uid
                            }
                        }, 200, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Verify error:', error);
                        return jsonResponse({ error: 'Verification failed' }, 500, corsHeaders(origin));
                    }
                }
                if (url.pathname === '/members/addresses' && method === 'GET') {
                    const authHeader = request.headers.get('Authorization');
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders(origin));
                    }
                    const token = authHeader.substring(7);
                    const payload = await verifyToken(token);
                    if (!payload) {
                        return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                    }
                    try {
                        const result = await env.bizcommerz_db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC').bind(payload.userId).all();
                        return jsonResponse({
                            addresses: result || []
                        }, 200, corsHeaders(origin));
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
                    const payload = await verifyToken(token);
                    if (!payload) {
                        return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders(origin));
                    }
                    const body = await request.json();
                    const { address_line1, address_line2, city, state, postal_code, country, is_default } = body;
                    const userId = payload.userId;
                    try {
                        const result = await env.bizcommerz_db.prepare('INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id').bind(userId, address_line1, address_line2 || '', city, state, postal_code, country, is_default || 0, new Date().toISOString(), new Date().toISOString()).first();
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
                // Database initialization endpoint (for development)
                if (url.pathname === '/init-db' && method === 'POST') {
                    try {
                        // Try to add owner_uid column if it doesn't exist
                        try {
                            await env.bizcommerz_db.prepare('SELECT owner_uid FROM users LIMIT 1').first();
                        }
                        catch (error) {
                            // Column doesn't exist, add it
                            await env.bizcommerz_db.exec('ALTER TABLE users ADD COLUMN owner_uid TEXT');
                        }
                        // Create test owner account with owner_uid
                        const ownerUid = generateUUID();
                        try {
                            await env.bizcommerz_db.prepare(`
                INSERT INTO users (name, email, password, phone, roles, owner_uid, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
              `).bind('Sweet Layers Owner', 'silvercloud@o2odesign.com', 'owner123', '+66812345678', '["owner"]', ownerUid).run();
                        }
                        catch (error) {
                            // Owner might already exist, update owner_uid if missing
                            try {
                                await env.bizcommerz_db.prepare(`
                  UPDATE users SET owner_uid = ? WHERE email = ? AND owner_uid IS NULL
                `).bind(ownerUid, 'silvercloud@o2odesign.com').run();
                            }
                            catch (updateError) {
                                console.error('Error updating owner_uid:', updateError);
                            }
                        }
                        // Create test admin account
                        const adminUid = generateUUID();
                        try {
                            await env.bizcommerz_db.prepare(`
                INSERT INTO users (name, email, password, phone, roles, owner_uid, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
              `).bind('Admin User', 'admin@sweetlayers.com', 'admin123', '+66812345679', '["admin"]', adminUid).run();
                        }
                        catch (error) {
                            // Admin might already exist, ignore error
                        }
                        // Create test customer account
                        const customerUid = generateUUID();
                        try {
                            await env.bizcommerz_db.prepare(`
                INSERT INTO users (name, email, password, phone, roles, owner_uid, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
              `).bind('Customer User', 'customer@sweetlayers.com', 'customer123', '+66812345680', '["customer"]', customerUid).run();
                        }
                        catch (error) {
                            // Customer might already exist, ignore error
                        }
                        return jsonResponse({
                            success: true,
                            message: 'Database initialized successfully'
                        }, 200, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Database initialization error:', error);
                        return jsonResponse({ error: 'Database initialization failed', details: String(error) }, 500, corsHeaders(origin));
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
                                customerId = newCustomer?.id;
                            }
                        }
                        else if (phone) {
                            // Use phone as identifier if no email
                            const existingCustomer = await env.bizcommerz_db.prepare('SELECT id FROM customers WHERE phone = ?').bind(phone).first();
                            if (existingCustomer) {
                                customerId = existingCustomer.id;
                            }
                            else {
                                const newCustomer = await env.bizcommerz_db.prepare('INSERT INTO customers (name, phone, address) VALUES (?, ?, ?) RETURNING id').bind(customer, phone, address).first();
                                customerId = newCustomer?.id;
                            }
                        }
                        // Create order
                        const result = await env.bizcommerz_db.prepare('INSERT INTO orders (customer_id, total, status, payment_status) VALUES (?, ?, ?, ?) RETURNING id').bind(customerId, total, 'pending', 'pending').first();
                        return jsonResponse({
                            success: true,
                            order_id: result?.id,
                            customer_id: customerId,
                            status: 'pending',
                        }, 201, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Guest checkout error:', error);
                        return jsonResponse({ error: 'Guest checkout failed' }, 500, corsHeaders(origin));
                    }
                }
                // Chat processing endpoint
                if (url.pathname === '/chat/process' && method === 'POST') {
                    const body = await request.json();
                    const { messages, sessionId } = body;
                    try {
                        // Use simple keyword-based responses for now
                        // Agent integration requires special Durable Object configuration
                        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
                        let response = '';
                        if (lastMessage.includes('mooncake') || lastMessage.includes('moon')) {
                            response = "Our Traditional Mooncakes are hand-pressed with lotus paste and salted egg yolk — a timeless delicacy perfect for gifting. We also have seasonal varieties available. Would you like to see our mooncake collection?";
                        }
                        else if (lastMessage.includes('pandan')) {
                            response = "Our Pandan Custard Cake features fragrant pandan sponge layered with silky coconut custard cream. It's one of our most popular items! The combination of aromatic pandan and rich coconut is absolutely divine.";
                        }
                        else if (lastMessage.includes('gift') || lastMessage.includes('box')) {
                            response = "Our Pastry Arrangement Boxes are perfect for gifting! We offer curated gift boxes with assorted pastries starting from $45. They make excellent presents for holidays, celebrations, or corporate events.";
                        }
                        else if (lastMessage.includes('sesame')) {
                            response = "Our Black Sesame Layer Cake features rich roasted sesame cream between delicate sponge layers. It's a specialty item that's become quite popular for its unique nutty flavor profile.";
                        }
                        else if (lastMessage.includes('salted egg') || lastMessage.includes('lava')) {
                            response = "Our Salted Egg Lava Pastry has a flaky crust with molten salted egg custard center — absolutely irresistible! It's one of our newer items that customers are loving.";
                        }
                        else if (lastMessage.includes('order') || lastMessage.includes('buy')) {
                            response = "I'd be happy to help you place an order! You can add items directly from our recommendations, or browse our full menu. Would you like me to suggest some items based on your preferences?";
                        }
                        else if (lastMessage.includes('recommend') || lastMessage.includes('suggest')) {
                            response = "Based on our popular items, I'd recommend our Pandan Custard Cake for a classic choice, or our Pastry Arrangement Box if you're looking for something special. What occasion are you shopping for?";
                        }
                        else if (lastMessage.includes('price') || lastMessage.includes('cost')) {
                            response = "Our prices range from $5 for individual pastries up to $45 for large gift boxes. Traditional Mooncakes start at $8 each, and our layer cakes range from $28-$35. All prices are very competitive for the quality!";
                        }
                        else if (lastMessage.includes('delivery') || lastMessage.includes('shipping')) {
                            response = "We offer same-day delivery for orders placed before 12pm, and next-day standard delivery. All our pastries are baked fresh and carefully packaged to ensure they arrive in perfect condition!";
                        }
                        else {
                            response = "I'd be happy to help you find the perfect pastries! We have traditional mooncakes, layer cakes, gift boxes, and specialty items. What type of pastry are you interested in, or would you like me to recommend something based on an occasion?";
                        }
                        return jsonResponse({
                            response: response,
                            products: getRelevantProducts(lastMessage)
                        }, 200, corsHeaders(origin));
                    }
                    catch (error) {
                        console.error('Chat processing error:', error);
                        return jsonResponse({ error: 'Chat processing failed' }, 500, corsHeaders(origin));
                    }
                }
                // Default API response
                return jsonResponse({
                    error: 'API endpoint not found',
                    path: url.pathname,
                    method: method,
                }, 404, corsHeaders(origin));
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
};
// Durable Object for engine state (required for deployment)
export class EngineState {
    state;
    env;
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }
    async fetch(request) {
        return new Response('Engine State Durable Object');
    }
}
let BakeryAssistantAgent = (() => {
    let _classSuper = Agent;
    let _instanceExtraInitializers = [];
    let _initializeSession_decorators;
    let _sendMessage_decorators;
    let _searchProducts_decorators;
    let _getChatHistory_decorators;
    let _getCustomerPreferences_decorators;
    let _clearSession_decorators;
    return class BakeryAssistantAgent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _initializeSession_decorators = [callable()];
            _sendMessage_decorators = [callable()];
            _searchProducts_decorators = [callable()];
            _getChatHistory_decorators = [callable()];
            _getCustomerPreferences_decorators = [callable()];
            _clearSession_decorators = [callable()];
            __esDecorate(this, null, _initializeSession_decorators, { kind: "method", name: "initializeSession", static: false, private: false, access: { has: obj => "initializeSession" in obj, get: obj => obj.initializeSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: obj => "sendMessage" in obj, get: obj => obj.sendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _searchProducts_decorators, { kind: "method", name: "searchProducts", static: false, private: false, access: { has: obj => "searchProducts" in obj, get: obj => obj.searchProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getChatHistory_decorators, { kind: "method", name: "getChatHistory", static: false, private: false, access: { has: obj => "getChatHistory" in obj, get: obj => obj.getChatHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCustomerPreferences_decorators, { kind: "method", name: "getCustomerPreferences", static: false, private: false, access: { has: obj => "getCustomerPreferences" in obj, get: obj => obj.getCustomerPreferences }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearSession_decorators, { kind: "method", name: "clearSession", static: false, private: false, access: { has: obj => "clearSession" in obj, get: obj => obj.clearSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        initialState = (__runInitializers(this, _instanceExtraInitializers), {
            chatHistory: [],
            customerPreferences: {
                favoriteCategories: [],
                lastViewedProducts: [],
                orderCount: 0,
            },
            currentSession: {
                sessionId: '',
                startedAt: Date.now(),
                lastActivity: Date.now(),
            },
        });
        productCatalog = [
            { id: 'mooncake-traditional', name: 'Traditional Mooncakes', desc: 'Lotus paste, red bean, mung bean with salted egg yolk', price: 'From $8', tags: ['mooncake', 'classic', 'lotus', 'red bean', 'mung bean', 'traditional', 'gift'], img: 'images/mooncake-traditional.webp', category: 'Classic' },
            { id: 'pastry-arrangement', name: 'Pastry Arrangement Box', desc: 'Curated gift boxes with assorted pastries', price: 'From $45', tags: ['gift', 'box', 'arrangement', 'assorted', 'curated', 'present'], img: 'images/pastry-arrangement.webp', category: 'Signature' },
            { id: 'pandan-custard', name: 'Pandan Custard Cake', desc: 'Fragrant pandan sponge layered with silky coconut custard cream', price: 'From $32', tags: ['pandan', 'custard', 'cake', 'coconut', 'layer', 'popular'], img: 'images/pandan-custard.webp', category: 'Popular' },
            { id: 'black-sesame', name: 'Black Sesame Layer Cake', desc: 'Rich roasted sesame cream between delicate sponge layers', price: 'From $35', tags: ['sesame', 'black', 'cake', 'layer', 'roasted', 'specialty'], img: 'images/black-sesame.webp', category: 'Specialty' },
            { id: 'salted-egg', name: 'Salted Egg Lava Pastry', desc: 'Flaky crust with molten salted egg custard center', price: 'From $6', tags: ['salted', 'egg', 'lava', 'pastry', 'flaky', 'custard', 'new'], img: 'images/salted-egg.webp', category: 'New' },
            { id: 'taro-coconut', name: 'Taro Coconut Cake', desc: 'Creamy taro mousse with coconut shreds on a buttery biscuit base', price: 'From $28', tags: ['taro', 'coconut', 'cake', 'mousse', 'seasonal'], img: 'images/taro-coconut.webp', category: 'Seasonal' },
            { id: 'mung-bean', name: 'Mung Bean Pastry', desc: 'Smooth mung bean paste in a golden, flaky traditional pastry shell', price: 'From $5', tags: ['mung', 'bean', 'pastry', 'flaky', 'traditional', 'heritage'], img: 'images/mung-bean.webp', category: 'Heritage' },
            { id: 'red-bean', name: 'Red Bean Delight', desc: 'Sweet red bean paste wrapped in a soft, pillowy mochi-style shell', price: 'From $5', tags: ['red', 'bean', 'mochi', 'sweet', 'classic'], img: 'images/red-bean.webp', category: 'Classic' },
        ];
        async initializeSession(sessionId) {
            this.setState({
                ...this.state,
                currentSession: {
                    sessionId,
                    startedAt: Date.now(),
                    lastActivity: Date.now(),
                },
            });
            return { success: true, sessionId };
        }
        async sendMessage(message) {
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: Date.now(),
            };
            this.setState({
                ...this.state,
                chatHistory: [...this.state.chatHistory, userMessage],
                currentSession: {
                    ...this.state.currentSession,
                    lastActivity: Date.now(),
                },
            });
            const response = this.generateResponse(message.toLowerCase());
            const assistantMessage = {
                role: 'assistant',
                content: response.text,
                timestamp: Date.now(),
            };
            this.setState({
                ...this.state,
                chatHistory: [...this.state.chatHistory, userMessage, assistantMessage],
            });
            this.updatePreferences(message);
            return {
                response: response.text,
                products: response.products,
                timestamp: Date.now(),
            };
        }
        async searchProducts(query) {
            const products = this.getRelevantProducts(query);
            return { products };
        }
        async getChatHistory() {
            return this.state.chatHistory;
        }
        async getCustomerPreferences() {
            return this.state.customerPreferences;
        }
        async clearSession() {
            this.setState({
                ...this.state,
                chatHistory: [],
                currentSession: {
                    sessionId: '',
                    startedAt: Date.now(),
                    lastActivity: Date.now(),
                },
            });
            return { success: true };
        }
        generateResponse(message) {
            let response = '';
            let products = [];
            if (message.includes('mooncake') || message.includes('moon')) {
                response = "Our Traditional Mooncakes are hand-pressed with lotus paste and salted egg yolk — a timeless delicacy perfect for gifting. We also have seasonal varieties available. Would you like to see our mooncake collection?";
                products = this.productCatalog.filter(p => p.tags.includes('mooncake'));
            }
            else if (message.includes('pandan')) {
                response = "Our Pandan Custard Cake features fragrant pandan sponge layered with silky coconut custard cream. It's one of our most popular items! The combination of aromatic pandan and rich coconut is absolutely divine.";
                products = this.productCatalog.filter(p => p.tags.includes('pandan'));
            }
            else if (message.includes('gift') || message.includes('box')) {
                response = "Our Pastry Arrangement Boxes are perfect for gifting! We offer curated gift boxes with assorted pastries starting from $45. They make excellent presents for holidays, celebrations, or corporate events.";
                products = this.productCatalog.filter(p => p.tags.includes('gift') || p.tags.includes('box'));
            }
            else if (message.includes('sesame')) {
                response = "Our Black Sesame Layer Cake features rich roasted sesame cream between delicate sponge layers. It's a specialty item that's become quite popular for its unique nutty flavor profile.";
                products = this.productCatalog.filter(p => p.tags.includes('sesame'));
            }
            else if (message.includes('salted egg') || message.includes('lava')) {
                response = "Our Salted Egg Lava Pastry has a flaky crust with molten salted egg custard center — absolutely irresistible! It's one of our newer items that customers are loving.";
                products = this.productCatalog.filter(p => p.tags.includes('salted') || p.tags.includes('lava'));
            }
            else if (message.includes('order') || message.includes('buy')) {
                response = "I'd be happy to help you place an order! You can add items directly from our recommendations, or browse our full menu. Would you like me to suggest some items based on your preferences?";
                products = this.productCatalog.slice(0, 4);
            }
            else if (message.includes('recommend') || message.includes('suggest')) {
                response = "Based on our popular items, I'd recommend our Pandan Custard Cake for a classic choice, or our Pastry Arrangement Box if you're looking for something special. What occasion are you shopping for?";
                products = this.productCatalog.filter(p => p.category === 'Popular' || p.category === 'Signature');
            }
            else if (message.includes('price') || message.includes('cost')) {
                response = "Our prices range from $5 for individual pastries up to $45 for large gift boxes. Traditional Mooncakes start at $8 each, and our layer cakes range from $28-$35. All prices are very competitive for the quality!";
                products = [];
            }
            else if (message.includes('delivery') || message.includes('shipping')) {
                response = "We offer same-day delivery for orders placed before 12pm, and next-day standard delivery. All our pastries are baked fresh and carefully packaged to ensure they arrive in perfect condition!";
                products = [];
            }
            else {
                response = "I'd be happy to help you find the perfect pastries! We have traditional mooncakes, layer cakes, gift boxes, and specialty items. What type of pastry are you interested in, or would you like me to recommend something based on an occasion?";
                products = this.productCatalog.slice(0, 4);
            }
            return { text: response, products };
        }
        getRelevantProducts(query) {
            if (!query || query.trim().length === 0)
                return [];
            const q = query.toLowerCase().trim();
            const words = q.split(/\s+/);
            return this.productCatalog
                .map(product => {
                let score = 0;
                const nameLower = product.name.toLowerCase();
                const descLower = product.desc.toLowerCase();
                const tagsStr = product.tags.join(' ').toLowerCase();
                const catLower = product.category.toLowerCase();
                for (const word of words) {
                    if (nameLower.includes(word))
                        score += 10;
                    if (catLower.includes(word))
                        score += 5;
                    if (tagsStr.includes(word))
                        score += 3;
                    if (descLower.includes(word))
                        score += 1;
                }
                if (nameLower === q)
                    score += 20;
                if (nameLower.startsWith(q))
                    score += 8;
                return { ...product, score };
            })
                .filter(p => p.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 4);
        }
        updatePreferences(message) {
            const categories = this.state.customerPreferences.favoriteCategories;
            const newCategories = [...categories];
            if (message.includes('mooncake') && !newCategories.includes('Classic')) {
                newCategories.push('Classic');
            }
            if (message.includes('gift') && !newCategories.includes('Signature')) {
                newCategories.push('Signature');
            }
            if (message.includes('pandan') && !newCategories.includes('Popular')) {
                newCategories.push('Popular');
            }
            this.setState({
                ...this.state,
                customerPreferences: {
                    ...this.state.customerPreferences,
                    favoriteCategories: newCategories,
                },
            });
        }
    };
})();
export { BakeryAssistantAgent };
//# sourceMappingURL=worker.js.map