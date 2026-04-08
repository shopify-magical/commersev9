// Main Dashboard Integration - Connects all components to API
class MainDashboard {
  constructor() {
    this.api = new ApiClient();
    this.components = {};
    this.init();
  }

  async init() {
    try {
      // Initialize all components
      this.components = {
        health: new HealthMonitor(this.api, 'health-monitor'),
        chat: new ChatInterface(this.api, 'chat-interface'),
        ai: new AIProcessor(this.api, 'ai-processor'),
        agents: new AgentPanel(this.api, 'agent-panel'),
        realtime: new RealtimeClock(this.api, 'realtime-data'),
        automation: new AutomationFlow(this.api)
      };

      // Initialize components
      await Promise.all([
        this.components.health.update(),
        this.components.chat.init(),
        this.components.ai.render({ status: 'ready', message: 'Ready to process' }),
        this.components.agents.render(),
        this.components.realtime.update(),
        this.components.automation.init()
      ]);

      // Set global instance for onclick handlers
      window.automationFlowInstance = this.components.automation;

      // Setup event listeners
      this.setupEventListeners();

      // Start auto-updates
      this.startAutoUpdates();

      console.log('🚀 Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
    }
  }

  setupEventListeners() {
    // Global event handling can be added here
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📱 DOM loaded');
    });
  }

  startAutoUpdates() {
    // Update health every 5 seconds
    this.components.health.startAutoUpdate(5000);
    
    // Update realtime clock every 1 second
    this.components.realtime.startAutoUpdate(1000);
  }

  stopAutoUpdates() {
    this.components.health?.stopAutoUpdate();
    this.components.realtime?.stopAutoUpdate();
  }

  // Method to refresh all components
  async refreshAll() {
    await Promise.all([
      this.components.health.update(),
      this.components.realtime.update()
    ]);
  }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new MainDashboard();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainDashboard;
}
