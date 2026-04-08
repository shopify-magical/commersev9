# Frontend Development Guide - API Data Tracing

## **API Data Structure Analysis**

### **Base URL:** https://bizcommerz-agentic-engine.aekbuffalo.workers.dev

### **1. Main Gateway Endpoint**
**GET /** 
```json
{
  "service": "Universal Agentic Gateway - Sweet Layers",
  "version": "3.0.0",
  "architecture": "Hybrid (AI + OCR + Pay + Transform + Email + Chat + Line + Multi-tenant)",
  "endpoints": {
    "gateway": "GET /",
    "health": "GET /health",
    "stats": "GET /stats",
    "timestamp": "GET /timestamp",
    "realtime": "GET /realtime",
    "ai": { "process": "POST /ai/process", "ocr": "POST /ai/ocr", "vision": "POST /ai/vision" },
    "transform": { "convert": "POST /transform/convert", "format": "POST /transform/format" },
    "email": { "send": "POST /email/send", "template": "POST /email/template" },
    "payment": { "promptpay": "POST /payment/promptpay", "status": "GET /payment/status" },
    "chat": { "commands": "GET /chat/commands", "process": "POST /chat/process", "sessions": "GET /chat/sessions" },
    "agents": {
      "dashboard": "POST /agent/dashboard",
      "automation": "POST /agent/automation",
      "insights": "POST /agent/insights",
      "inventory": "POST /agent/inventory",
      "orders": "POST /agent/orders",
      "customers": "POST /agent/customers",
      "harvest": "POST /agent/harvest",
      "weather": "POST /agent/weather"
    },
    "line": { "liff": "GET /line/liff", "webhook": "POST /line/webhook", "token": "POST /line/token" },
    "auth": { "login": "POST /auth/login", "verify": "GET /auth/verify", "token": "GET /auth/token" },
    "admin": { "dashboard": "GET /admin/dashboard", "shops": "GET /admin/shops", "reports": "GET /admin/reports" }
  },
  "features": ["AI Processing", "OCR Vision", "Payment Processing", "Data Transformation", "Email System", "Chat Interface", "Business Agents", "Inventory Management", "Order Processing", "Customer Management", "Line OA Integration", "Authentication", "Admin Panel", "Real-time Analytics", "WebSocket Support", "Multi-tenant Architecture"],
  "platforms": {
    "thaiRubberERP": "Agentic AI + Chat + Unix Controllers",
    "allverse": "AI + OCR + Pay + Transform + Email",
    "sweetLayers": "Payment + Line + Business Agents"
  }
}
```

### **2. Health Check Endpoint**
**GET /health**
```json
{
  "status": "stopped",
  "timestamp": 1775568254515,
  "version": "3.0.0",
  "service": "Universal Agentic Gateway",
  "architecture": "Hybrid (AI + OCR + Pay + Transform + Email + Chat + Line + Multi-tenant)",
  "platforms": {
    "thaiRubberERP": "integrated",
    "allverse": "integrated",
    "sweetLayers": "integrated"
  },
  "agents": ["dashboard", "automation", "insights", "inventory", "orders", "customers", "harvest", "weather"],
  "features": ["ai", "ocr", "pay", "transform", "email", "chat", "line", "multi-tenant"],
  "uptime": 0
}
```

### **3. Realtime Endpoint**
**GET /realtime**
```json
{
  "realtime": true,
  "timestamp": 1775568259277,
  "iso": "2026-04-07T13:24:19.277Z",
  "unix": 1775568259,
  "milliseconds": 277,
  "timezone": "UTC",
  "offset": 0,
  "service": "Universal Agentic Gateway",
  "engine": {
    "running": false,
    "tickCount": 0
  }
}
```

### **4. Agent Endpoints**
**POST /agent/dashboard**
```json
{
  "agent": "dashboard",
  "goalId": "e52be57f-a2e6-41a7-b1e9-3f22f38de551",
  "status": "processing",
  "message": "Dashboard agent processing request",
  "timestamp": 1775568261738
}
```

### **5. AI Processing Endpoint**
**POST /ai/process**
```json
{
  "ai": "process",
  "goalId": "e2a58f76-1628-4bb8-a436-482c6840307a",
  "status": "processing",
  "message": "AI processing request",
  "timestamp": 1775568264393
}
```

### **6. Chat Commands Endpoint**
**GET /chat/commands**
```json
{
  "commands": [
    { "id": "search", "description": "Search products" },
    { "id": "ask", "description": "Ask about products" },
    { "id": "order", "description": "Place order" },
    { "id": "help", "description": "Get help" }
  ],
  "gateway": "unified",
  "timestamp": 1775568298176
}
```

### **7. Chat Process Endpoint**
**POST /chat/process**
```json
{
  "chat": "process",
  "goalId": "f269ec91-f9fd-4d6e-8bad-32f7c6ab5cfd",
  "response": "Thank you for your message: \"hello\". I'm processing your request through the unified gateway.",
  "message": "hello",
  "timestamp": 1775568301149
}
```

## **Frontend Architecture Design**

### **1. API Integration Layer**
```javascript
// api.js - API Client
const API_BASE = 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev';

class ApiClient {
  async get(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Gateway methods
  async getGatewayInfo() {
    return this.get('/');
  }

  async getHealth() {
    return this.get('/health');
  }

  async getRealtime() {
    return this.get('/realtime');
  }

  // AI methods
  async processAI(text) {
    return this.post('/ai/process', { text });
  }

  // Agent methods
  async dashboardAgent(action) {
    return this.post('/agent/dashboard', { action });
  }

  // Chat methods
  async getChatCommands() {
    return this.get('/chat/commands');
  }

  async processChat(message, command) {
    return this.post('/chat/process', { message, command });
  }
}
```

### **2. Frontend Components Structure**
```
frontend/
├── components/
│   ├── Dashboard.js
│   ├── HealthMonitor.js
│   ├── AIProcessor.js
│   ├── ChatInterface.js
│   ├── AgentPanel.js
│   └── RealtimeClock.js
├── pages/
│   ├── Dashboard.js
│   ├── AI.js
│   ├── Chat.js
│   └── Admin.js
├── api/
│   └── client.js
└── styles/
    └── main.css
```

### **3. Component Examples**

#### **Health Monitor Component**
```javascript
class HealthMonitor {
  constructor(apiClient) {
    this.api = apiClient;
    this.element = document.getElementById('health-monitor');
  }

  async update() {
    const health = await this.api.getHealth();
    this.render(health);
  }

  render(data) {
    this.element.innerHTML = `
      <div class="health-status">
        <h3>System Status</h3>
        <div class="status ${data.status}">
          ${data.status.toUpperCase()}
        </div>
        <div class="uptime">Uptime: ${data.uptime}s</div>
        <div class="version">Version: ${data.version}</div>
        <div class="platforms">
          ${Object.entries(data.platforms).map(([k, v]) => 
            `<span class="platform">${k}: ${v}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }
}
```

#### **Chat Interface Component**
```javascript
class ChatInterface {
  constructor(apiClient) {
    this.api = apiClient;
    this.element = document.getElementById('chat-interface');
    this.commands = [];
  }

  async init() {
    const response = await this.api.getChatCommands();
    this.commands = response.commands;
    this.render();
  }

  async sendMessage(message) {
    const response = await this.api.processChat(message, 'help');
    this.appendMessage('user', message);
    this.appendMessage('bot', response.response);
  }

  render() {
    this.element.innerHTML = `
      <div class="chat-container">
        <div class="chat-commands">
          ${this.commands.map(cmd => 
            `<button class="command-btn" data-cmd="${cmd.id}">${cmd.description}</button>`
          ).join('')}
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
          <input type="text" id="chat-input" placeholder="Type a message...">
          <button id="send-btn">Send</button>
        </div>
      </div>
    `;
  }

  appendMessage(sender, text) {
    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `
      <div class="message ${sender}">
        <div class="sender">${sender}</div>
        <div class="text">${text}</div>
      </div>
    `;
  }
}
```

#### **AI Processor Component**
```javascript
class AIProcessor {
  constructor(apiClient) {
    this.api = apiClient;
    this.element = document.getElementById('ai-processor');
  }

  async processText(text) {
    const response = await this.api.processAI(text);
    this.render(response);
  }

  render(data) {
    this.element.innerHTML = `
      <div class="ai-processor">
        <h3>AI Processing</h3>
        <div class="status">${data.status}</div>
        <div class="goal-id">Goal ID: ${data.goalId}</div>
        <div class="message">${data.message}</div>
        <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
      </div>
    `;
  }
}
```

### **4. Main Dashboard Integration**
```javascript
class MainDashboard {
  constructor() {
    this.api = new ApiClient();
    this.components = {
      health: new HealthMonitor(this.api),
      chat: new ChatInterface(this.api),
      ai: new AIProcessor(this.api)
    };
  }

  async init() {
    await Promise.all([
      this.components.health.update(),
      this.components.chat.init()
    ]);

    this.setupEventListeners();
    this.startRealtimeUpdates();
  }

  setupEventListeners() {
    document.getElementById('send-btn')?.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      if (input.value) {
        this.components.chat.sendMessage(input.value);
        input.value = '';
      }
    });
  }

  startRealtimeUpdates() {
    setInterval(async () => {
      await this.components.health.update();
    }, 5000);
  }
}
```

### **5. HTML Structure**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Agentic Engine Dashboard</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <div class="dashboard">
    <header>
      <h1>Universal Agentic Gateway</h1>
      <div id="health-monitor"></div>
    </header>
    
    <main>
      <section class="ai-section">
        <h2>AI Processing</h2>
        <div id="ai-processor"></div>
      </section>
      
      <section class="chat-section">
        <h2>Chat Interface</h2>
        <div id="chat-interface"></div>
      </section>
      
      <section class="agents-section">
        <h2>Business Agents</h2>
        <div id="agent-panel"></div>
      </section>
    </main>
  </div>
  
  <script src="api/client.js"></script>
  <script src="components/HealthMonitor.js"></script>
  <script src="components/ChatInterface.js"></script>
  <script src="components/AIProcessor.js"></script>
  <script src="dashboard.js"></script>
</body>
</html>
```

### **6. CSS Styling**
```css
/* styles/main.css */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.health-status {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
}

.status.stopped { background: #ff6b6b; color: white; }
.status.running { background: #51cf66; color: white; }

.chat-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.chat-commands {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.command-btn {
  padding: 8px 16px;
  background: #2A6B52;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-messages {
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
}

.message.user {
  background: #e3f2fd;
  margin-left: 20px;
}

.message.bot {
  background: #f5f5f5;
  margin-right: 20px;
}

.ai-processor {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}
```

## **Implementation Steps**

1. **Create API Client** - Build the API integration layer
2. **Build Components** - Create individual UI components
3. **Integrate Components** - Connect components to API data
4. **Add Realtime Updates** - Implement polling or WebSocket
5. **Style the Interface** - Apply CSS for professional look
6. **Test Integration** - Verify all API connections work

This guide shows how to trace the API data structure and build a complete frontend based on the backend API responses.
