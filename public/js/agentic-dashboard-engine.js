/**
 * Agentic Dashboard Engine - Core Unified System
 * Fuses Router + Agentic Engine + Real-time Sync
 */

class AgenticDashboardEngine {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/agentic',
      wsEndpoint: config.wsEndpoint || '/ws',
      enableRealtime: config.enableRealtime !== false,
      enableAgent: config.enableAgent !== false,
      enablePrefetch: config.enablePrefetch !== false,
      tickInterval: config.tickInterval || 5000,
      ...config
    };

    // Core components
    this.router = null;
    this.agent = null;
    this.sync = null;
    this.ui = null;

    // State
    this.state = {
      initialized: false,
      connected: false,
      currentRoute: null,
      user: null,
      insights: [],
      pendingGoals: [],
      metrics: {}
    };

    // Event bus
    this.events = new EventBus();
  }

  async init() {
    console.log('🚀 Initializing Agentic Dashboard Engine...');

    // 1. Initialize UI Manager
    this.ui = new DashboardUIManager();
    this.ui.init();

    // 2. Initialize Router with Agent Integration
    this.router = new AgenticRouter({
      onNavigateStart: (ctx) => this.handleNavigateStart(ctx),
      onNavigateComplete: (ctx) => this.handleNavigateComplete(ctx),
      prefetch: (path) => this.agent?.suggestPrefetch(path),
      guards: {
        agent: (ctx) => this.agentGuard(ctx)
      }
    });

    // 3. Initialize Dashboard Agent
    if (this.config.enableAgent) {
      this.agent = new DashboardAgent({
        apiEndpoint: this.config.apiEndpoint,
        tickInterval: this.config.tickInterval,
        onInsight: (insight) => this.ui.showInsight(insight),
        onAction: (action) => this.handleAgentAction(action),
        onGoal: (goal) => this.handleAgentGoal(goal)
      });
      await this.agent.init();
    }

    // 4. Initialize Real-time Sync
    if (this.config.enableRealtime) {
      this.sync = new AgenticSync({
        wsEndpoint: this.config.wsEndpoint,
        onConnect: () => this.handleSyncConnect(),
        onMessage: (msg) => this.handleServerMessage(msg),
        onDisconnect: () => this.handleSyncDisconnect()
      });
      await this.sync.connect();
    }

    // 5. Setup cross-component event wiring
    this.setupEventWiring();

    // 6. Start the engine
    await this.start();

    this.state.initialized = true;
    this.events.emit('engine:initialized');
    
    console.log('✅ Agentic Dashboard Engine ready');
    return this;
  }

  setupEventWiring() {
    // Router -> Agent: User navigated
    this.router.events.on('routechange', (e) => {
      this.agent?.submitObservation({
        type: 'navigation',
        data: {
          from: e.detail.from?.path,
          to: e.detail.to?.path,
          query: e.detail.query,
          timestamp: Date.now()
        }
      });

      // Agent reasons about navigation context
      this.agent?.reason(`User navigated to ${e.detail.to?.path}`);
    });

    // Agent -> Router: Agent suggests navigation
    this.agent?.events.on('decision:navigate', (decision) => {
      this.ui.showNavigationSuggestion({
        path: decision.params.path,
        reason: decision.reasoning,
        confidence: decision.confidence,
        onAccept: () => this.router.navigate(decision.params.path)
      });
    });

    // Sync -> Agent: Server-side goal update
    this.sync?.on('goal:update', (update) => {
      this.agent?.receiveExternalGoal(update);
    });

    // UI -> Agent: User interaction
    this.ui.events.on('interaction', (interaction) => {
      this.agent?.submitObservation({
        type: 'interaction',
        data: interaction
      });
    });

    // Agent -> UI: Show insight/prediction
    this.agent?.events.on('insight', (insight) => {
      this.ui.showInsight(insight);
    });
  }

  async start() {
    // Start the agent's autonomous loop
    if (this.agent) {
      await this.agent.start();
    }

    // Render initial route
    const initialPath = window.location.pathname + window.location.search;
    await this.router.navigate(initialPath, { replace: true });
  }

  // ========== Event Handlers ==========

  handleNavigateStart(ctx) {
    this.ui.showLoading('Navigating...');
    this.events.emit('navigate:start', ctx);
  }

  handleNavigateComplete(ctx) {
    this.ui.hideLoading();
    this.state.currentRoute = ctx.to;

    // Agent: We've arrived at new route, analyze it
    if (this.agent) {
      this.agent.submitGoal(
        `Analyze and optimize ${ctx.to?.path}`,
        'optimization',
        { route: ctx.to }
      );
    }

    this.events.emit('navigate:complete', ctx);
  }

  async agentGuard(ctx) {
    // Agent can override route guards based on context
    const agentDecision = await this.agent?.evaluateRouteAccess(ctx.to, ctx.from);
    
    if (agentDecision?.allowed === false) {
      return {
        allowed: false,
        redirect: agentDecision.suggestedPath || '/unauthorized.html',
        reason: agentDecision.reason
      };
    }

    return { allowed: true };
  }

  handleAgentAction(action) {
    console.log('🤖 Agent action:', action);

    switch(action.type) {
      case 'navigate':
        this.router.navigate(action.path);
        break;

      case 'prefetch':
        this.router.prefetch(action.path);
        this.ui.showToast(`Preloading ${action.path}...`);
        break;

      case 'show-panel':
        this.ui.showPanel(action.panel, action.data);
        break;

      case 'auto-fill':
        this.ui.autoFill(action.formSelector, action.data);
        break;

      case 'highlight':
        this.ui.highlightElement(action.selector, action.message);
        break;

      case 'suggest':
        this.ui.showSuggestion(action.message, action.actions);
        break;

      case 'notify':
        this.ui.showNotification(action.title, action.message, action.type);
        break;
    }
  }

  handleAgentGoal(goal) {
    console.log('🎯 New goal:', goal);
    this.state.pendingGoals.push(goal);
    this.ui.updateGoalsPanel(this.state.pendingGoals);
  }

  handleSyncConnect() {
    this.state.connected = true;
    this.ui.showConnectionStatus('connected');
    
    // Sync user state with server
    this.sync.send({
      type: 'user:connect',
      data: {
        userId: this.state.user?.id,
        currentRoute: this.state.currentRoute?.path,
        timestamp: Date.now()
      }
    });
  }

  handleSyncDisconnect() {
    this.state.connected = false;
    this.ui.showConnectionStatus('disconnected');
  }

  handleServerMessage(msg) {
    switch(msg.type) {
      case 'goal:assigned':
        // Server assigned a goal to this dashboard
        this.agent?.submitExternalGoal(msg.goal);
        break;

      case 'insight:push':
        // Server pushes real-time insight
        this.ui.showInsight({
          source: 'server',
          ...msg.insight
        });
        break;

      case 'route:suggest':
        // Server suggests route based on global context
        this.ui.showNavigationSuggestion({
          source: 'server',
          ...msg.suggestion
        });
        break;

      case 'state:sync':
        // Full state sync from server
        this.syncState(msg.state);
        break;

      case 'action:execute':
        // Server requests action execution
        this.handleAgentAction(msg.action);
        break;
    }
  }

  syncState(serverState) {
    // Merge server state with local state
    this.state = { ...this.state, ...serverState };
    this.ui.updateFromState(this.state);
  }

  // ========== Public API ==========

  navigate(path, options = {}) {
    return this.router.navigate(path, options);
  }

  submitGoal(description, priority = 'medium', context = {}) {
    return this.agent?.submitGoal(description, priority, context);
  }

  getMetrics() {
    return {
      router: this.router?.getMetrics(),
      agent: this.agent?.getMetrics(),
      sync: this.sync?.getMetrics(),
      state: this.state
    };
  }

  destroy() {
    this.agent?.stop();
    this.sync?.disconnect();
    this.router?.destroy();
    this.ui?.destroy();
    this.events.removeAllListeners();
  }
}

// ========== Supporting Classes ==========

class DashboardUIManager {
  constructor() {
    this.events = new EventBus();
    this.panels = new Map();
  }

  init() {
    this.createInsightPanel();
    this.createGoalsPanel();
    this.createConnectionIndicator();
  }

  createInsightPanel() {
    const panel = document.createElement('div');
    panel.id = 'agent-insights';
    panel.className = 'agent-panel insights-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🤖 Agent Insights</span>
        <button class="panel-close">×</button>
      </div>
      <div class="panel-content"></div>
    `;
    document.body.appendChild(panel);
    this.panels.set('insights', panel);

    // Auto-hide after 30 seconds
    setTimeout(() => {
      panel.classList.add('minimized');
    }, 30000);
  }

  createGoalsPanel() {
    const panel = document.createElement('div');
    panel.id = 'agent-goals';
    panel.className = 'agent-panel goals-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🎯 Active Goals</span>
        <span class="goal-count">0</span>
      </div>
      <div class="panel-content"></div>
    `;
    document.body.appendChild(panel);
    this.panels.set('goals', panel);
  }

  createConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'connection-status';
    indicator.className = 'connection-indicator';
    indicator.innerHTML = `
      <span class="status-dot"></span>
      <span class="status-text">Connecting...</span>
    `;
    document.body.appendChild(indicator);
  }

  showInsight(insight) {
    const panel = this.panels.get('insights');
    const content = panel.querySelector('.panel-content');
    
    const item = document.createElement('div');
    item.className = 'insight-item';
    item.innerHTML = `
      <div class="insight-header">
        <span class="insight-source">${insight.source || 'Agent'}</span>
        <span class="insight-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="insight-message">${insight.message}</div>
      ${insight.confidence ? `<div class="insight-confidence">Confidence: ${(insight.confidence * 100).toFixed(0)}%</div>` : ''}
    `;
    
    content.insertBefore(item, content.firstChild);
    panel.classList.remove('minimized');

    // Auto-remove old insights
    while (content.children.length > 10) {
      content.removeChild(content.lastChild);
    }

    // Hide after delay
    setTimeout(() => {
      panel.classList.add('minimized');
    }, 15000);
  }

  showNavigationSuggestion({ path, reason, confidence, onAccept }) {
    const toast = document.createElement('div');
    toast.className = 'navigation-suggestion toast';
    toast.innerHTML = `
      <div class="suggestion-content">
        <strong>💡 Suggested:</strong> ${reason}
        <div class="suggestion-path">${path}</div>
      </div>
      <div class="suggestion-actions">
        <button class="btn-accept">Go</button>
        <button class="btn-dismiss">Dismiss</button>
      </div>
    `;

    toast.querySelector('.btn-accept').addEventListener('click', () => {
      onAccept?.();
      toast.remove();
    });

    toast.querySelector('.btn-dismiss').addEventListener('click', () => {
      toast.remove();
    });

    document.body.appendChild(toast);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      toast.classList.add('fading');
      setTimeout(() => toast.remove(), 500);
    }, 10000);
  }

  showLoading(message) {
    let loader = document.getElementById('dashboard-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'dashboard-loader';
      loader.innerHTML = `
        <div class="loader-overlay">
          <div class="spinner"></div>
          <span class="loader-message"></span>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.querySelector('.loader-message').textContent = message;
    loader.classList.add('active');
  }

  hideLoading() {
    const loader = document.getElementById('dashboard-loader');
    loader?.classList.remove('active');
  }

  showToast(message) {
    if (typeof showToast === 'function') {
      showToast(message);
    } else {
      console.log('Toast:', message);
    }
  }

  showConnectionStatus(status) {
    const indicator = document.getElementById('connection-status');
    if (indicator) {
      indicator.className = `connection-indicator ${status}`;
      indicator.querySelector('.status-text').textContent = 
        status === 'connected' ? 'Live' : 'Offline';
    }
  }

  updateGoalsPanel(goals) {
    const panel = this.panels.get('goals');
    const count = panel.querySelector('.goal-count');
    const content = panel.querySelector('.panel-content');
    
    count.textContent = goals.length;
    
    content.innerHTML = goals.map(goal => `
      <div class="goal-item ${goal.status}">
        <div class="goal-description">${goal.description}</div>
        <div class="goal-meta">
          <span class="goal-priority">${goal.priority}</span>
          <span class="goal-status">${goal.status}</span>
        </div>
      </div>
    `).join('');
  }

  autoFill(formSelector, data) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    Object.entries(data).forEach(([field, value]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        input.value = value;
        input.classList.add('auto-filled');
        setTimeout(() => input.classList.remove('auto-filled'), 2000);
      }
    });

    this.showToast('Form auto-filled by agent');
  }

  highlightElement(selector, message) {
    const element = document.querySelector(selector);
    if (!element) return;

    element.classList.add('agent-highlight');
    element.setAttribute('title', message);

    // Scroll into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      element.classList.remove('agent-highlight');
    }, 5000);
  }

  destroy() {
    this.panels.forEach(panel => panel.remove());
    document.getElementById('connection-status')?.remove();
    document.getElementById('dashboard-loader')?.remove();
  }
}

class AgenticSync {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  async connect() {
    try {
      this.ws = new WebSocket(this.config.wsEndpoint);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.config.onConnect?.();
      };

      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        this.config.onMessage?.(msg);
        this.emit(msg.type, msg);
      };

      this.ws.onclose = () => {
        this.config.onDisconnect?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

    } catch (err) {
      console.error('Failed to connect:', err);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }

  disconnect() {
    this.ws?.close();
  }

  getMetrics() {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Simple EventBus implementation
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this.events.get(event)?.delete(handler);
  }

  emit(event, data) {
    this.events.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error('Event handler error:', err);
      }
    });
  }

  removeAllListeners() {
    this.events.clear();
  }
}

// Export
window.AgenticDashboardEngine = AgenticDashboardEngine;
window.DashboardUIManager = DashboardUIManager;
