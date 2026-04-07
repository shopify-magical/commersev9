# BizCommerz Agentic Engine - Technical Documentation

## 🔧 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   Worker    │  │  KV Store   │  │ Durable Objects │    │
│  │   (API)     │  │ (Orders/    │  │ (Engine State)  │    │
│  │             │  │  Quotes)    │  │                 │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   Frontend  │  │   Static    │  │   LINE LIFF     │    │
│  │   (HTML/JS) │  │   Assets    │  │   (Mobile)      │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                      External Services                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │ LINE Bot    │  │ PromptPay   │  │   Analytics     │    │
│  │ API         │  │   QR        │  │   (Google)      │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### Health Check
```
GET https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1712486400000,
  "version": "1.0.0",
  "service": "Agentic Engine (Cloudflare Workers)"
}
```

### Submit Order
```
POST https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/triggers/order
```

**Request:**
```json
{
  "customer": "สมชาย ใจดี",
  "phone": "0812345678",
  "email": "test@email.com",
  "items": ["เค้กช็อกโกแลต x 1"],
  "total": 450,
  "payment": "promptpay",
  "tenantId": "default"
}
```

### Generate PromptPay QR
```
POST https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/payment/promptpay
```

**Request:**
```json
{
  "amount": 450,
  "orderId": "order_123456",
  "customer": "สมชาย"
}
```

### LINE Notifications
```
POST https://api.line.me/v2/bot/message/push
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

---

## 🎯 Agentic Engine Components

### 1. Perception Module
- รับข้อมูลจากภายนอก (sensors)
- ตรวจจับเหตุการณ์สำคัญ
- สร้าง observations

### 2. Reasoning Engine
- วิเคราะห์สถานการณ์
- ตัดสินใจ (decision making)
- หาแนวทางที่ดีที่สุด

### 3. Action Executor
- ดำเนินการตาม decisions
- ส่ง notifications
- อัปเดตสถานะ

### 4. Knowledge Base
- จัดเก็บข้อมูล
- ค้นหา pattern
- สร้าง insights

### 5. Learning Module
- เรียนรู้จากประสบการณ์
- ปรับปรุง decision making
- อัปเดต model

---

## 🔐 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| ENGINE_NAME | BizCommerzAgenticEngine | Engine name |
| LOG_LEVEL | info | Log level (debug/info/warn/error) |
| ENABLE_LEARNING | true | Enable learning module |
| API_TOKEN | - | API authentication token |

### LINE Configuration

```javascript
// line-integration.js
{
  channelAccessToken: 'f2d21879e9a8f2fdad6625c726a2f5bd',
  channelSecret: '65f763d0af5e321d166cdeff84198182',
  liffId: '2008523083-1KKafaGY',
  channelId: '2008523083'
}
```

---

## 📁 File Structure

```
agentic-engine/
├── src/
│   ├── orchestrator/       # Main engine
│   │   └── index.ts        # AgenticEngine class
│   ├── core/               # Core modules
│   │   ├── event-bus.ts
│   │   ├── state-manager.ts
│   │   ├── logger.ts
│   │   └── error-handler.ts
│   ├── perception/         # Data collection
│   ├── reasoning/          # Decision making
│   ├── action/             # Action execution
│   ├── learning/           # ML/Learning
│   ├── types/              # TypeScript types
│   └── utils.ts            # Utilities
├── public/                 # Frontend
│   ├── index.html          # Landing page
│   ├── shop.html           # Product listing
│   ├── checkout.html       # Checkout
│   ├── line-liff.html      # LINE mini app
│   ├── cake-shop-owner.html # Dashboard
│   └── js/
│       ├── agentic-engine.js
│       ├── line-integration.js
│       └── member-system.js
├── worker.ts               # Cloudflare Worker entry
├── wrangler.toml           # Worker configuration
└── docs/                   # Documentation
```

---

## 🚀 Deployment

### Deploy to Cloudflare

```bash
# Install dependencies
npm install

# Deploy Worker + Pages
npm run deploy

# Or deploy Pages only
npx wrangler pages deploy public --project-name=bizcommerz-cake-shop
```

### Environment Setup

1. Create Cloudflare account
2. Create Workers project
3. Create Pages project
4. Set up LINE Channel (Messaging API)
5. Configure KV namespaces for persistence

---

## 🔒 Security

### CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Content Security Policy

```
default-src 'self'; 
script-src 'self' 'unsafe-inline' https://static.line-scdn.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
connect-src 'self' https://api.line.me;
```

---

## 📊 Monitoring

### View Logs

```bash
# Via Cloudflare Dashboard
# Workers > BizCommerz Agentic Engine > Logs
```

### Key Metrics

- Tasks Completed/Failed
- Success Rate
- Average Decision Time
- Knowledge Base Size

---

## 🔧 Troubleshooting

### Worker Not Starting
```bash
# Check logs
wrangler tail

# Verify configuration
npx wrangler deploy --dry-run
```

### LINE Webhook Failing
1. Verify channel secret
2. Check webhook URL in LINE Developers console
3. Enable "Allow endpoints" for webhook

### Pages Not Loading
1. Check _headers file
2. Verify asset paths
3. Check Cloudflare Pages build output

---

## 📝 Changelog

### v1.0.0 (April 2026)
- Initial release
- Agentic Engine core functionality
- LINE integration
- PromptPay QR generation
- Dashboard and analytics

---

*Documentation generated by BizCommerz Agentic Engine v1.0*