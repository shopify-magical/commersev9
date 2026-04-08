// Realtime Clock Component - Traces API realtime data
class RealtimeClock {
  constructor(apiClient, elementId) {
    this.api = apiClient;
    this.element = document.getElementById(elementId);
    this.updateInterval = null;
  }

  async update() {
    const realtime = await this.api.getRealtime();
    this.render(realtime);
  }

  render(data) {
    if (!this.element) return;
    
    const engineStatus = data.engine?.running ? 'Running' : 'Stopped';
    const tickCount = data.engine?.tickCount || 0;
    
    this.element.innerHTML = `
      <div class="realtime-data">
        <div class="realtime-header">
          <h3>⏱️ Realtime Data</h3>
        </div>
        <div class="realtime-metrics">
          <div class="metric">
            <span class="label">Current Time:</span>
            <span class="value">${data.iso || 'N/A'}</span>
          </div>
          <div class="metric">
            <span class="label">Unix Timestamp:</span>
            <span class="value">${data.unix || 'N/A'}</span>
          </div>
          <div class="metric">
            <span class="label">Milliseconds:</span>
            <span class="value">${data.milliseconds || 'N/A'}</span>
          </div>
          <div class="metric">
            <span class="label">Timezone:</span>
            <span class="value">${data.timezone || 'UTC'}</span>
          </div>
          <div class="metric">
            <span class="label">Offset:</span>
            <span class="value">${data.offset || 0}h</span>
          </div>
          <div class="metric">
            <span class="label">Engine Status:</span>
            <span class="value engine-status ${data.engine?.running ? 'running' : 'stopped'}">${engineStatus}</span>
          </div>
          <div class="metric">
            <span class="label">Tick Count:</span>
            <span class="value">${tickCount}</span>
          </div>
        </div>
        <div class="realtime-info">
          <div class="info-item">
            <span class="label">Service:</span>
            <span class="value">${data.service || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  }

  startAutoUpdate(intervalMs = 1000) {
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
