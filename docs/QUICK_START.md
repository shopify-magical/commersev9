# 📖 BizCommerz Agentic Engine - Quick Setup Guide

## 🎯 5-Minute Setup

### Step 1: Access the System

| Platform | URL |
|----------|-----|
| **Website** | https://bizcommerz-cake-shop.pages.dev |
| **LINE LIFF** | https://bizcommerz-cake-shop.pages.dev/line-liff.html |
| **Dashboard** | https://bizcommerz-cake-shop.pages.dev/cake-shop-owner.html |

---

### Step 2: Set Up LINE Notifications (Optional)

**Required for order notifications:**

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create Messaging API Channel
3. Get these credentials:
   - Channel ID
   - Channel Secret
   - Access Token
4. Update in `public/js/line-integration.js`

**Set Webhook URL:**
```
https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/webhook
```

---

### Step 3: Configure PromptPay (Optional)

1. Get your PromptPay QR code
2. Update phone number in `checkout.html`:
```javascript
const promptPayId = '0840871065'; // Your phone number
```

---

### Step 4: Test the System

| Test | How |
|------|-----|
| Place order | Go to shop, add item to cart, checkout |
| LINE notification | Place order and check LINE |
| Dashboard | Visit cake-shop-owner.html |
| Analytics | Check customer-insights.html |

---

## 🔧 Configuration Files

### Main Configuration (`wrangler.toml`)
```toml
name = "bizcommerz-agentic-engine"
main = "src/worker.ts"
compatibility_date = "2025-03-20"

[site]
bucket = "./public"

[vars]
ENGINE_NAME = "BizCommerzAgenticEngine"
LOG_LEVEL = "info"
ENABLE_LEARNING = "true"
```

### LINE Settings (`public/js/line-integration.js`)
```javascript
this.channelAccessToken = 'YOUR_ACCESS_TOKEN';
this.channelSecret = 'YOUR_CHANNEL_SECRET';
this.liffId = 'YOUR_LIFF_ID';
```

---

## 📱 Available Pages

| Page | Purpose |
|------|---------|
| `/` | Main landing page |
| `/shop.html` | Product catalog |
| `/cart.html` | Shopping cart |
| `/checkout.html` | Payment & checkout |
| `/line-liff.html` | LINE mini app |
| `/cake-shop-owner.html` | Business dashboard |
| `/order-management.html` | Order management |
| `/kitchen-operations.html` | Kitchen/inventory |
| `/customer-insights.html` | Analytics |
| `/marketing-center.html` | Marketing tools |

---

## 🚀 Deploy Updates

```bash
# Deploy everything
npm run deploy

# Deploy Pages only
npx wrangler pages deploy public --project-name=bizcommerz-cake-shop
```

---

## ❓ Need Help?

- **Documentation:** See `/docs/` folder
- **Support:** contact@sweetlayers.com
- **LINE:** @sweetlayers

---

*Quick Start Guide v1.0*