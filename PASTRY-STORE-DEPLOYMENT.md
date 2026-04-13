# Chinese Pastry Store Deployment Guide
## Agentic Engine-Powered E-Commerce Platform

**Project**: Sweet Layers Chinese Pastry Store  
**Main Goal**: Agentic Engine Integration  
**Architecture**: Infinite Unix Routing Gateway  
**Deployment Target**: Cloudflare Workers + Pages

---

## Prerequisites

### Required Tools
- Node.js 18+ 
- npm or yarn
- Wrangler CLI (Cloudflare Workers)
- Git

### Required Accounts
- Cloudflare account with Workers and Pages enabled
- GitHub account (for CI/CD)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Frontend    │  │  Static      │  │  Assets      │      │
│  │  (Next.js)   │  │  Files       │  │  (Images)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Agentic     │  │  Unix        │  │  Pastry      │      │
│  │  Engine      │  │  Routing     │  │  Store API   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  KV Storage  │  │  Durable     │  │  R2 Storage  │      │
│  │  (Cache)     │  │  Objects     │  │  (Images)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Environment Setup

### 1.1 Install Dependencies
```bash
# Install project dependencies
npm install

# Install Wrangler CLI globally
npm install -g wrangler
```

### 1.2 Configure Cloudflare Workers
```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 1.3 Create KV Namespaces
```bash
# Create KV namespaces for pastry store
wrangler kv:namespace create "PASTRY_KV"
wrangler kv:namespace create "CUSTOMER_KV"
wrangler kv:namespace create "ORDERS_KV"
wrangler kv:namespace create "INVENTORY_KV"
wrangler kv:namespace create "CACHE_KV"
```

### 1.4 Create Durable Objects
```bash
# Create Durable Object for agentic engine state
wrangler d1 create PASTRY_DB
```

---

## Step 2: Configuration

### 2.1 Update wrangler.toml
```toml
#:schema node_modules/wrangler/config-schema.json
name = "sweet-layers-pastry-store"
main = "src/worker.ts"
compatibility_date = "2026-04-12"
compatibility_flags = ["nodejs_compat"]

[observability]
enabled = true

[vars]
STORE_NAME = "Sweet Layers"
ENGINE_NAME = "PastryStoreEngine"
LOG_LEVEL = "info"
ENABLE_LEARNING = "true"
API_BASE_URL = "https://bizcommerz-agentic-engine.sv9.workers.dev"

[[durable_objects.bindings]]
name = "ENGINE_STATE"
class_name = "EngineState"

[[kv_namespaces]]
binding = "PASTRY_KV"
id = "YOUR_PASTRY_KV_ID"

[[kv_namespaces]]
binding = "CUSTOMER_KV"
id = "YOUR_CUSTOMER_KV_ID"

[[kv_namespaces]]
binding = "ORDERS_KV"
id = "YOUR_ORDERS_KV_ID"

[[kv_namespaces]]
binding = "INVENTORY_KV"
id = "YOUR_INVENTORY_KV_ID"

[[kv_namespaces]]
binding = "CACHE_KV"
id = "YOUR_CACHE_KV_ID"

[[migrations]]
tag = "v2"
new_sqlite_classes = ["EngineState"]
```

### 2.2 Environment Variables
Create `.dev.vars` for local development:
```env
# Agentic Engine Configuration
ENGINE_NAME=PastryStoreEngine
LOG_LEVEL=debug
ENABLE_LEARNING=true

# Store Configuration
STORE_NAME=Sweet Layers
CURRENCY=CNY
DEFAULT_LANGUAGE=zh-CN

# API Configuration
API_BASE_URL=https://bizcommerz-agentic-engine.sv9.workers.dev
API_TIMEOUT=30000

# Third-party Services
STRIPE_SECRET_KEY=your_stripe_key
ALIPAY_APP_ID=your_alipay_id
WECHAT_PAY_MCH_ID=your_wechat_id
```

---

## Step 3: Build and Deploy

### 3.1 Build TypeScript
```bash
# Compile TypeScript
npm run build

# Verify build output
ls -la dist/
```

### 3.2 Deploy to Cloudflare Workers
```bash
# Deploy worker
npm run deploy

# Verify deployment
curl https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/health
```

### 3.3 Test Unix Routing Endpoints
```bash
# Test health check
curl https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/bin/health

# Test route discovery
curl https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/routes

# Test recommendations
curl -X POST https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/usr/bin/recommendations \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"sweetness":2,"budget":100}}'
```

---

## Step 4: Frontend Deployment

### 4.1 Build Frontend (if using Next.js)
```bash
# Install frontend dependencies
cd frontend
npm install

# Build for production
npm run build

# Export static files
npm run export
```

### 4.2 Deploy to Cloudflare Pages
```bash
# Create Pages project
npx wrangler pages project create sweet-layers

# Deploy static files
npx wrangler pages deploy ./out --project-name=sweet-layers
```

### 4.3 Configure Custom Domain
```bash
# Add custom domain in Cloudflare Dashboard
# Settings > Custom Domains > Add Domain
# Example: pastry.sweetlayers.com
```

---

## Step 5: Data Seeding

### 5.1 Seed Product Catalog
```bash
# Seed Chinese pastry products
curl -X POST https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/usr/bin/products \
  -H "Content-Type: application/json" \
  -d @src/data/chinese-pastries.json
```

### 5.2 Initialize Inventory
```bash
# Set initial inventory levels
curl -X POST https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/var/inventory/initialize \
  -H "Content-Type: application/json" \
  -d '{"products":[{"id":"mooncake-lotus-seed","stock":150}]}'
```

---

## Step 6: Monitoring and Analytics

### 6.1 Enable Cloudflare Analytics
```bash
# Analytics automatically enabled
# View in Cloudflare Dashboard > Analytics & Logs
```

### 6.2 Configure Error Tracking
```typescript
// Add to worker.ts
addEventListener('error', (event) => {
  console.error('Worker error:', event.error);
  // Send to error tracking service
});
```

### 6.3 Set Up Uptime Monitoring
```bash
# Use external monitoring service
# Monitor: https://sweet-layers-pastry-store.YOUR_SUBDOMAIN.workers.dev/bin/health
```

---

## Step 7: CI/CD Pipeline

### 7.1 GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Pastry Store

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build TypeScript
        run: npm run build
        
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

### 7.2 Set GitHub Secrets
```bash
# Add secrets in GitHub repository settings
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

---

## Verification Checklist

### Pre-Deployment
- [ ] All TypeScript files compile without errors
- [ ] KV namespaces created and configured
- [ ] Durable Objects configured
- [ ] Environment variables set
- [ ] wrangler.toml updated with correct IDs

### Post-Deployment
- [ ] Health check endpoint returns 200
- [ ] Route discovery returns valid JSON
- [ ] Unix routing endpoints accessible
- [ ] Agentic engine integration working
- [ ] Product catalog accessible
- [ ] Recommendations API functional

### Integration Testing
- [ ] Test product recommendations
- [ ] Test order optimization
- [ ] Test customer insights
- [ ] Test inventory forecasting
- [ ] Test admin panel endpoints

---

## Performance Optimization

### Edge Caching
```javascript
// Add cache headers to responses
response.headers.set('Cache-Control', 'public, max-age=3600');
```

### Image Optimization
```bash
# Use Cloudflare Image Resizing
# Configure in wrangler.toml
[build]
command = "npm run build"
```

### Database Optimization
```typescript
// Use KV for frequently accessed data
// Use Durable Objects for stateful operations
```

---

## Security Configuration

### CORS Configuration
```typescript
// Restrict CORS to specific origins
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sweetlayers.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
```

### Rate Limiting
```typescript
// Implement rate limiting in middleware
const rateLimiter = new Map<string, number[]>();
```

### Authentication
```typescript
// Implement JWT token verification
// Use Cloudflare Workers Secrets for sensitive data
```

---

## Troubleshooting

### Common Issues

**Issue**: KV namespace not found
```
Solution: Run wrangler kv:namespace list to verify IDs
```

**Issue**: Agentic engine not starting
```
Solution: Check ENGINE_NAME and LOG_LEVEL environment variables
```

**Issue**: Routes returning 404
```
Solution: Verify Unix routing paths match worker.ts implementation
```

**Issue**: Build errors
```
Solution: Clear node_modules and reinstall: rm -rf node_modules && npm install
```

---

## Scaling Considerations

### Horizontal Scaling
- Cloudflare Workers automatically scales
- No manual scaling required
- Edge deployment reduces latency

### Vertical Scaling
- Increase memory limits in wrangler.toml
- Use Durable Objects for stateful operations
- Optimize KV access patterns

### Cost Optimization
- Monitor KV usage
- Cache frequently accessed data
- Use R2 for large file storage

---

## Maintenance

### Regular Tasks
- Weekly: Review error logs and performance metrics
- Monthly: Update dependencies and security patches
- Quarterly: Review and optimize routing configuration
- Annually: Architecture review and optimization

### Backup Strategy
- KV data: Use Cloudflare's automatic backups
- Durable Objects: Implement regular state export
- Configuration: Version control all configuration files

---

## Support and Documentation

### Documentation Links
- [Infinite Unix Routing Documentation](./docs/CHINESE-PASTRY-STORE-DESIGN.md)
- [Agentic Engine Documentation](./docs/AGENTIC-ENGINE.md)
- [Unix Routing API Reference](./docs/UNIX-ROUTING-API.md)

### Support Channels
- GitHub Issues: Report bugs and feature requests
- Cloudflare Community: Get help with Workers deployment
- Internal Documentation: Refer to project docs

---

## Next Steps

1. **Deploy to Production**: Follow the steps above to deploy
2. **Monitor Performance**: Set up analytics and monitoring
3. **Gather Feedback**: Collect user feedback on agentic features
4. **Iterate**: Continuously improve based on data and feedback
5. **Scale**: Expand to multiple regions and languages

---

**Deployment Status**: Ready for Production  
**Last Updated**: April 12, 2026  
**Version**: 1.0.0
