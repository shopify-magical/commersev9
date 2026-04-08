/**
 * CockroachDB Proxy Worker
 * Provides HTTP API access to CockroachDB from other Cloudflare Workers
 */
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const method = request.method;
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        // Health check
        if (url.pathname === '/health' && method === 'GET') {
            return Response.json({
                status: 'healthy',
                database: 'cockroachdb',
                timestamp: Date.now()
            }, { headers: corsHeaders });
        }
        // Get products
        if (url.pathname === '/products' && method === 'GET') {
            const category = url.searchParams.get('category');
            try {
                const response = await fetch(env.DATABASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: category
                            ? 'SELECT * FROM products WHERE category_id = $1'
                            : 'SELECT * FROM products',
                        params: category ? [category] : []
                    })
                });
                const data = await response.json();
                return Response.json({
                    success: true,
                    products: data.results || [],
                    count: data.results?.length || 0
                }, { headers: corsHeaders });
            }
            catch (error) {
                return Response.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500, headers: corsHeaders });
            }
        }
        // Create order
        if (url.pathname === '/orders' && method === 'POST') {
            try {
                const body = await request.json();
                const { customer_id, items, total } = body;
                const response = await fetch(env.DATABASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: 'INSERT INTO orders (customer_id, total, status, payment_status) VALUES ($1, $2, $3, $4) RETURNING id',
                        params: [customer_id || null, total, 'pending', 'pending']
                    })
                });
                const data = await response.json();
                return Response.json({
                    success: true,
                    order_id: data.results?.[0]?.id,
                    status: 'pending'
                }, { status: 201, headers: corsHeaders });
            }
            catch (error) {
                return Response.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500, headers: corsHeaders });
            }
        }
        // Get orders
        if (url.pathname === '/orders' && method === 'GET') {
            try {
                const customer_id = url.searchParams.get('customer_id');
                const status = url.searchParams.get('status');
                let query = 'SELECT * FROM orders';
                const params = [];
                if (customer_id || status) {
                    query += ' WHERE';
                    const conditions = [];
                    if (customer_id) {
                        conditions.push(' customer_id = $' + (params.length + 1));
                        params.push(customer_id);
                    }
                    if (status) {
                        conditions.push(' status = $' + (params.length + 1));
                        params.push(status);
                    }
                    query += conditions.join(' AND');
                }
                const response = await fetch(env.DATABASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, params })
                });
                const data = await response.json();
                return Response.json({
                    success: true,
                    orders: data.results || [],
                    count: data.results?.length || 0
                }, { headers: corsHeaders });
            }
            catch (error) {
                return Response.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500, headers: corsHeaders });
            }
        }
        // Get categories
        if (url.pathname === '/categories' && method === 'GET') {
            try {
                const response = await fetch(env.DATABASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: 'SELECT * FROM categories ORDER BY display_order',
                        params: []
                    })
                });
                const data = await response.json();
                return Response.json({
                    success: true,
                    categories: data.results || []
                }, { headers: corsHeaders });
            }
            catch (error) {
                return Response.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500, headers: corsHeaders });
            }
        }
        // Get inventory
        if (url.pathname === '/inventory' && method === 'GET') {
            try {
                const response = await fetch(env.DATABASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: 'SELECT p.id, p.name, p.category_id, p.price, i.quantity FROM products p LEFT JOIN inventory i ON p.id = i.product_id',
                        params: []
                    })
                });
                const data = await response.json();
                return Response.json({
                    success: true,
                    inventory: data.results || []
                }, { headers: corsHeaders });
            }
            catch (error) {
                return Response.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500, headers: corsHeaders });
            }
        }
        // Default response
        return Response.json({
            service: 'CockroachDB Proxy Worker',
            version: '1.0.0',
            endpoints: ['/health', '/products', '/orders', '/categories', '/inventory']
        }, { headers: corsHeaders });
    }
};
//# sourceMappingURL=db-proxy-worker.js.map