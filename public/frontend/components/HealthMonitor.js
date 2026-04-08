// Health Monitor Component - Traces API health data
class HealthMonitor {
  constructor(apiClient, elementId) {
    this.api = apiClient;
    this.element = document.getElementById(elementId);
    this.updateInterval = null;
  }

  async update() {
    const health = await this.api.getHealth();
    this.render(health);
  }

  render(data) {
    if (!this.element) return;
    
    const statusClass = data.status === 'running' ? 'running' : 'stopped';
    const uptime = data.uptime ? `${data.uptime}s` : 'N/A';
    
    this.element.innerHTML = `
      <div class="health-status">
        <h3>🏥 System Health</h3>
        <div class="status ${statusClass}">
          ${data.status ? data.status.toUpperCase() : 'UNKNOWN'}
        </div>
        <div class="metrics">
          <div class="metric">
            <span class="label">Uptime:</span>
            <span class="value">${uptime}</span>
          </div>
          <div class="metric">
            <span class="label">Version:</span>
            <span class="value">${data.version || 'N/A'}</span>
          </div>
          <div class="metric">
            <span class="label">Service:</span>
            <span class="value">${data.service || 'N/A'}</span>
          </div>
        </div>
        <div class="platforms">
          <h4>Integrated Platforms:</h4>
          ${data.platforms ? Object.entries(data.platforms).map(([k, v]) => 
            `<span class="platform ${v === 'integrated' ? 'active' : 'inactive'}">${k}: ${v}</span>`
          ).join('') : ''}
        </div>
        <div class="features">
          <h4>Active Features:</h4>
          ${data.features ? data.features.map(f => 
            `<span class="feature">${f}</span>`
          ).join('') : ''}
        </div>
        <div class="agents">
          <h4>Available Agents:</h4>
          ${data.agents ? data.agents.map(a => 
            `<span class="agent">${a}</span>`
          ).join('') : ''}
        </div>
      </div>
    `;
  }

  startAutoUpdate(intervalMs = 5000) {
    this.update();
    this.updateInterval = setInterval(() => this.update(), intervalMs);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
