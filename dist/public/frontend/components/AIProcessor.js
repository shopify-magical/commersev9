// AI Processor Component - Traces API AI data
class AIProcessor {
  constructor(apiClient, elementId) {
    this.api = apiClient;
    this.element = document.getElementById(elementId);
    this.processing = false;
  }

  async processText(text) {
    if (this.processing) return;
    
    this.processing = true;
    this.renderProcessing();
    
    const response = await this.api.processAI(text);
    this.render(response);
    
    this.processing = false;
  }

  async processOCR(imageData) {
    if (this.processing) return;
    
    this.processing = true;
    this.renderProcessing('Processing OCR...');
    
    const response = await this.api.processOCR(imageData);
    this.render(response);
    
    this.processing = false;
  }

  render(data) {
    if (!this.element) return;
    
    const statusClass = data.status === 'completed' ? 'success' : 
                       data.status === 'processing' ? 'processing' : 'error';
    
    this.element.innerHTML = `
      <div class="ai-processor">
        <div class="ai-header">
          <h3>🤖 AI Processing</h3>
        </div>
        <div class="ai-status ${statusClass}">
          ${data.status ? data.status.toUpperCase() : 'UNKNOWN'}
        </div>
        ${data.goalId ? `<div class="goal-id">Goal ID: ${data.goalId}</div>` : ''}
        ${data.message ? `<div class="message">${data.message}</div>` : ''}
        ${data.error ? `<div class="error">${data.error}</div>` : ''}
        <div class="timestamp">
          ${data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}
        </div>
        <div class="ai-input">
          <input type="text" id="ai-input-${this.element.id}" placeholder="Enter text for AI processing..." />
          <button id="ai-process-btn-${this.element.id}">Process</button>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }

  renderProcessing(message = 'Processing...') {
    if (!this.element) return;
    
    this.element.innerHTML = `
      <div class="ai-processor">
        <div class="ai-header">
          <h3>🤖 AI Processing</h3>
        </div>
        <div class="ai-status processing">
          ${message}
        </div>
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.element) return;

    const input = this.element.querySelector(`#ai-input-${this.element.id}`);
    const btn = this.element.querySelector(`#ai-process-btn-${this.element.id}`);
    
    if (input && btn) {
      btn.addEventListener('click', () => {
        if (input.value.trim()) {
          this.processText(input.value.trim());
        }
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          this.processText(input.value.trim());
        }
      });
    }
  }
}
