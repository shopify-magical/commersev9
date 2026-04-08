# CockroachDB Proxy Service Deployment

## Overview
This proxy service provides HTTP API access to CockroachDB for Cloudflare Workers.

## Deployment Options

### Option 1: Render (Recommended - Free Tier)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Render:**
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select "CockroachDB Proxy" service
   - Set Build Command: `npm install`
   - Set Start Command: `node db-proxy.js`
   - Add Environment Variable: `DATABASE_URL` = your CockroachDB connection string

3. **Get the URL:**
   - Render will provide a URL like: `https://cockroachdb-proxy.onrender.com`

### Option 2: Railway (Free Tier)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy:**
   ```bash
   railway login
   railway init
   railway up
   railway domain
   ```

3. **Add Environment Variable:**
   ```bash
   railway variables set DATABASE_URL="postgresql://..."
   ```

### Option 3: Fly.io (Free Tier)

1. **Install Fly.io CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy:**
   ```bash
   fly launch
   fly secrets set DATABASE_URL="postgresql://..."
   fly deploy
   ```

## After Deployment

### Update Cloudflare Worker

1. **Set DB_PROXY_URL secret:**
   ```bash
   wrangler secret put DB_PROXY_URL
   # Enter your deployed proxy URL: https://your-proxy-url.onrender.com
   ```

2. **Deploy Worker:**
   ```bash
   wrangler deploy
   ```

### Test Production Integration

```bash
# Test the deployed proxy
curl https://your-proxy-url.onrender.com/health
curl https://your-proxy-url.onrender.com/products

# Test the worker
curl https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/db/products
```

## Environment Variables

- `DATABASE_URL`: CockroachDB connection string
- `PORT`: Server port (default: 3001)

## Local Development

```bash
# Install dependencies
npm install

# Start proxy service
DATABASE_URL="postgresql://root@localhost:26257/orbiotal?sslmode=disable" node db-proxy.js

# Test
curl http://localhost:3001/health
curl http://localhost:3001/products
```
