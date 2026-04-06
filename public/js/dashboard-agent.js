/**
 * Dashboard Agent - Frontend AI Agent
 * Connects to Agentic Engine Backend via API
 * Perceives user behavior, reasons about goals, takes actions
 */

class DashboardAgent {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/agentic',
      tickInterval: config.tickInterval || 5000,
      enableLearning: config.enableLearning !== false,
      maxObservations: config.maxObservations || 100,
      ...config
    };

    this.state = {
      running: false,
      observations: [],
      goals: [],
      experiences: [],
      userProfile: null,
      currentContext: {},
      lastTick: 0
    };

    this.tickTimer = null;
    this.events = new EventBus();
    this.knowledge = new Map();
    
    // Decision weights (learned over time)
    this.weights = {
      navigationHelp: 0.5,
      prefetchValue: 0.3,
      formAssist: 0.4,
      insightSharing: 0.6
    };
  }

  async init() {
    console.log('🤖 Initializing Dashboard Agent...');

    // Load user profile from storage
    this.loadUserProfile();

    // Start perception listeners
    this.setupPerception();

    // Register default action handlers
    this.registerActions();

    console.log('✅ Dashboard Agent initialized');
    return this;
  }

  async start() {
    if (this.state.running) return;
    
    this.state.running = true;
    
    // Start autonomous tick loop
    this.tickTimer = setInterval(() => {
      this.tick().catch(err => console.error('Agent tick error:', err));
    }, this.config.tickInterval);

    // Initial observation
    this.submitObservation({
      type: 'session_start',
      data: {
        url: window.location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        timestamp: Date.now()
      }
    });

    console.log('🤖 Dashboard Agent running');
    this.events.emit('agent:started');
  }

  stop() {
    this.state.running = false;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.events.emit('agent:stopped');
  }

  // ========== Perception ==========

  setupPerception() {
    // Track all clicks
    document.addEventListener('click', (e) => {
      const element = e.target.closest('[data-track], a, button, input, select, textarea') || e.target;
      
      this.submitObservation({
        type: 'click',
        data: {
          tag: element.tagName,
          id: element.id,
          class: element.className,
          text: element.textContent?.slice(0, 50),
          href: element.href,
          x: e.clientX,
          y: e.clientY,
          path: window.location.pathname
        }
      });
    }, { passive: true });

    // Track form inputs (debounced)
    let inputTimeout;
    document.addEventListener('input', (e) => {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        const element = e.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          this.submitObservation({
            type: 'input',
            data: {
              field: element.name || element.id,
              valueLength: element.value?.length,
              path: window.location.pathname
            }
          });
        }
      }, 1000);
    }, { passive: true });

    // Track scroll behavior
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.submitObservation({
          type: 'scroll',
          data: {
            scrollY: window.scrollY,
            maxScroll: document.body.scrollHeight - window.innerHeight,
            path: window.location.pathname
          }
        });
      }, 500);
    }, { passive: true });

    // Track time on page
    setInterval(() => {
      this.submitObservation({
        type: 'heartbeat',
        data: {
          path: window.location.pathname,
          timeOnPage: Date.now() - (this.state.sessionStart || Date.now())
        }
      });
    }, 30000);
  }

  submitObservation(observation) {
    const enriched = {
      ...observation,
      timestamp: Date.now(),
      sessionId: this.state.sessionId,
      userId: this.state.userProfile?.id
    };

    this.state.observations.push(enriched);
    
    // Keep only recent observations
    if (this.state.observations.length > this.config.maxObservations) {
      this.state.observations = this.state.observations.slice(-this.config.maxObservations);
    }

    // Send to backend
    this.sendToBackend('observation', enriched);

    // Emit for local processing
    this.events.emit('observation', enriched);
  }

  // ========== Reasoning ==========

  async tick() {
    if (!this.state.running) return;

    const now = Date.now();
    this.state.lastTick = now;

    // Analyze recent observations
    const recentObs = this.getRecentObservations(10);
    const patterns = this.analyzePatterns(recentObs);

    // Make decisions based on patterns
    await this.makeDecisions(patterns, recentObs);

    // Learn from outcomes
    if (this.config.enableLearning) {
      this.learn();
    }

    this.events.emit('tick', { patterns, timestamp: now });
  }

  getRecentObservations(count) {
    return this.state.observations.slice(-count);
  }

  analyzePatterns(observations) {
    const patterns = {
      frequentClicks: {},
      navigationPath: [],
      formActivity: false,
      scrollDepth: 0,
      idle: true
    };

    observations.forEach(obs => {
      // Track click patterns
      if (obs.type === 'click') {
        patterns.idle = false;
        const key = `${obs.data.tag}-${obs.data.class}`;
        patterns.frequentClicks[key] = (patterns.frequentClicks[key] || 0) + 1;
      }

      // Track navigation
      if (obs.type === 'navigation') {
        patterns.navigationPath.push(obs.data.to);
      }

      // Track form activity
      if (obs.type === 'input') {
        patterns.formActivity = true;
      }

      // Track scroll depth
      if (obs.type === 'scroll') {
        const depth = obs.data.scrollY / (obs.data.maxScroll || 1);
        patterns.scrollDepth = Math.max(patterns.scrollDepth, depth);
      }
    });

    return patterns;
  }

  async makeDecisions(patterns, observations) {
    const decisions = [];

    // Decision 1: Navigation Help
    if (patterns.idle && patterns.navigationPath.length > 0) {
      const lastPath = patterns.navigationPath[patterns.navigationPath.length - 1];
      const suggested = this.suggestNextStep(lastPath);
      
      if (suggested && Math.random() < this.weights.navigationHelp) {
        decisions.push({
          type: 'suggest_navigation',
          params: suggested,
          confidence: this.calculateConfidence('navigation', patterns)
        });
      }
    }

    // Decision 2: Prefetch Content
    if (patterns.frequentClicks && Object.keys(patterns.frequentClicks).length > 0) {
      const popularClicks = Object.entries(patterns.frequentClicks)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (popularClicks && popularClicks[1] > 2) {
        const prefetchPath = this.inferPrefetchPath(popularClicks[0]);
        if (prefetchPath && Math.random() < this.weights.prefetchValue) {
          decisions.push({
            type: 'prefetch',
            params: { path: prefetchPath },
            confidence: this.calculateConfidence('prefetch', patterns)
          });
        }
      }
    }

    // Decision 3: Form Assistance
    if (patterns.formActivity) {
      const formData = this.inferFormData(observations);
      if (formData && Math.random() < this.weights.formAssist) {
        decisions.push({
          type: 'auto_fill',
          params: formData,
          confidence: this.calculateConfidence('formAssist', patterns)
        });
      }
    }

    // Decision 4: Share Insights
    if (patterns.scrollDepth > 0.8) {
      decisions.push({
        type: 'show_insight',
        params: {
          message: "You've explored this page thoroughly! Need help with anything?"
        },
        confidence: 0.7
      });
    }

    // Execute decisions
    for (const decision of decisions) {
      await this.executeDecision(decision);
    }
  }

  suggestNextStep(currentPath) {
    const suggestions = {
      '/': { path: '/shop.html', reason: 'Browse our products' },
      '/shop.html': { path: '/cart.html', reason: 'View your cart' },
      '/cart.html': { path: '/checkout.html', reason: 'Complete purchase' },
      '/login.html': { path: '/dashboard.html', reason: 'Go to dashboard' }
    };

    return suggestions[currentPath] || null;
  }

  inferPrefetchPath(clickPattern) {
    // Map click patterns to likely navigation targets
    if (clickPattern.includes('product')) return '/product.html';
    if (clickPattern.includes('cart')) return '/cart.html';
    if (clickPattern.includes('dashboard')) return '/dashboard.html';
    return null;
  }

  inferFormData(observations) {
    // Use stored user profile to suggest form data
    const profile = this.state.userProfile;
    if (!profile) return null;

    // Only suggest if user is typing (activity detected)
    const hasTyping = observations.some(o => o.type === 'input');
    if (!hasTyping) return null;

    return {
      formSelector: 'form',
      data: {
        email: profile.email,
        name: profile.name,
        phone: profile.phone
      }
    };
  }

  calculateConfidence(decisionType, patterns) {
    // Calculate confidence based on pattern strength
    const baseConfidence = this.weights[decisionType] || 0.5;
    const activityBoost = patterns.idle ? 0 : 0.2;
    return Math.min(0.95, baseConfidence + activityBoost);
  }

  async executeDecision(decision) {
    this.events.emit('decision', decision);

    // Send to backend for validation/enrichment
    const validated = await this.validateDecision(decision);
    
    if (validated.approved) {
      this.config.onAction?.(decision);
      
      // Record experience for learning
      this.state.experiences.push({
        decision,
        timestamp: Date.now(),
        context: this.state.currentContext
      });
    }
  }

  async validateDecision(decision) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, context: this.state.currentContext })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Backend unavailable, approve locally
      console.warn('Backend validation failed, using local approval');
    }

    return { approved: decision.confidence > 0.5 };
  }

  // ========== Learning ==========

  learn() {
    // Analyze outcomes of past decisions
    const recentExp = this.state.experiences.slice(-20);
    
    if (recentExp.length < 5) return;

    // Adjust weights based on implicit feedback
    // (e.g., if user followed suggestion, increase weight)
    recentExp.forEach(exp => {
      if (exp.outcome === 'success') {
        this.adjustWeight(exp.decision.type, 0.05);
      } else if (exp.outcome === 'ignored') {
        this.adjustWeight(exp.decision.type, -0.02);
      }
    });

    // Save learned weights
    this.saveWeights();
  }

  adjustWeight(decisionType, delta) {
    const key = decisionType.replace('suggest_', '').replace('_', '');
    if (this.weights[key] !== undefined) {
      this.weights[key] = Math.max(0.1, Math.min(0.9, this.weights[key] + delta));
    }
  }

  saveWeights() {
    localStorage.setItem('agent_weights', JSON.stringify(this.weights));
  }

  loadWeights() {
    const saved = localStorage.getItem('agent_weights');
    if (saved) {
      this.weights = { ...this.weights, ...JSON.parse(saved) };
    }
  }

  // ========== Actions ==========

  registerActions() {
    // Register default action handlers
    this.actions = {
      navigate: (params) => {
        this.events.emit('decision:navigate', { params });
      },
      prefetch: (params) => {
        this.config.onPrefetch?.(params.path);
      },
      auto_fill: (params) => {
        this.config.onAutoFill?.(params);
      },
      show_insight: (params) => {
        this.config.onInsight?.(params);
      }
    };
  }

  // ========== Public API ==========

  submitGoal(description, priority = 'medium', context = {}) {
    const goal = {
      id: this.generateId(),
      description,
      priority,
      context,
      status: 'pending',
      createdAt: Date.now()
    };

    this.state.goals.push(goal);
    this.config.onGoal?.(goal);
    
    // Send to backend
    this.sendToBackend('goal', goal);

    return goal.id;
  }

  receiveExternalGoal(goal) {
    this.state.goals.push({ ...goal, external: true });
    this.config.onGoal?.(goal);
    this.events.emit('external:goal', goal);
  }

  reason(context) {
    // Trigger immediate reasoning cycle
    return this.makeDecisions(
      this.analyzePatterns(this.getRecentObservations(5)),
      this.state.observations
    );
  }

  evaluateRouteAccess(to, from) {
    // Agent can provide context-aware access control
    const userProfile = this.state.userProfile;
    
    if (!userProfile && to?.auth?.required) {
      return {
        allowed: false,
        suggestedPath: '/login.html',
        reason: 'Authentication required'
      };
    }

    // Check if route matches user patterns
    const hasVisitedBefore = this.state.observations.some(
      o => o.type === 'navigation' && o.data.to === to?.path
    );

    if (!hasVisitedBefore && to?.path?.includes('admin')) {
      return {
        allowed: true,
        warning: 'First time accessing admin area',
        reason: 'New admin access detected'
      };
    }

    return { allowed: true };
  }

  suggestPrefetch(path) {
    // Called by router when user hovers over link
    if (Math.random() < this.weights.prefetchValue) {
      this.executeDecision({
        type: 'prefetch',
        params: { path },
        confidence: 0.6
      });
    }
  }

  getMetrics() {
    return {
      observations: this.state.observations.length,
      goals: this.state.goals.length,
      experiences: this.state.experiences.length,
      weights: this.weights,
      running: this.state.running
    };
  }

  // ========== Helpers ==========

  sendToBackend(type, data) {
    // Send data to agentic engine backend
    fetch(`${this.config.apiEndpoint}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => {
      // Silently fail - backend might not be available
      console.debug('Backend sync failed:', err.message);
    });
  }

  loadUserProfile() {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      this.state.userProfile = JSON.parse(stored);
    }

    this.state.sessionId = this.generateId();
    this.state.sessionStart = Date.now();
  }

  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Simple EventBus
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
window.DashboardAgent = DashboardAgent;
