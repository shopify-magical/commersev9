// Agent Panel Component - Traces API agent data
class AgentPanel {
  constructor(apiClient, elementId) {
    this.api = apiClient;
    this.element = document.getElementById(elementId);
    this.agents = ['dashboard', 'automation', 'insights', 'inventory', 'orders', 'customers', 'harvest', 'weather'];
  }

  async executeAgent(agentName, action) {
    const endpoint = `/agent/${agentName}`;
    const response = await this.api.post(endpoint, { action });
    this.renderAgentResponse(agentName, response);
  }

  render() {
    if (!this.element) return;
    
    this.element.innerHTML = `
      <div class="agent-panel">
        <div class="agent-header">
          <h3>🏢 Business Agents</h3>
        </div>
        <div class="agents-grid">
          ${this.agents.map(agent => `
            <div class="agent-card" data-agent="${agent}">
              <div class="agent-icon">${this.getAgentIcon(agent)}</div>
              <div class="agent-name">${agent.charAt(0).toUpperCase() + agent.slice(1)}</div>
              <div class="agent-actions">
                <button class="agent-action-btn" data-action="status">Status</button>
                <button class="agent-action-btn" data-action="execute">Execute</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="agent-response" id="agent-response-${this.element.id}">
          <div class="response-placeholder">Select an agent to see response</div>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }

  renderAgentResponse(agentName, response) {
    const responseDiv = this.element.querySelector(`#agent-response-${this.element.id}`);
    if (responseDiv) {
      const statusClass = response.status === 'completed' ? 'success' : 
                         response.status === 'processing' ? 'processing' : 'error';
      
      responseDiv.innerHTML = `
        <div class="response-content">
          <div class="response-header">
            <h4>${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent</h4>
            <div class="status ${statusClass}">${response.status || 'UNKNOWN'}</div>
          </div>
          ${response.goalId ? `<div class="goal-id">Goal ID: ${response.goalId}</div>` : ''}
          ${response.message ? `<div class="message">${response.message}</div>` : ''}
          ${response.error ? `<div class="error">${response.error}</div>` : ''}
          <div class="timestamp">${response.timestamp ? new Date(response.timestamp).toLocaleString() : new Date().toLocaleString()}</div>
        </div>
      `;
    }
  }

  setupEventListeners() {
    if (!this.element) return;

    const actionButtons = this.element.querySelectorAll('.agent-action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const agentCard = e.target.closest('.agent-card');
        const agentName = agentCard.dataset.agent;
        const action = e.target.dataset.action;
        this.executeAgent(agentName, action);
      });
    });
  }

  getAgentIcon(agentName) {
    const icons = {
      dashboard: '📊',
      automation: '⚙️',
      insights: '💡',
      inventory: '📦',
      orders: 'ตะกร้า',
      customers: '👥',
      harvest: '🌾',
      weather: '🌤️'
    };
    return icons[agentName] || '🤖';
  }
}
