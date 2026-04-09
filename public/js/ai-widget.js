/**
 * AI Widget - Responsive Chat Widget with Layered SVG Icons
 * Uses ai-widget-icons.svg for all iconography
 */

class AIWidget {
  static instance = null;

  static getInstance() {
    if (!AIWidget.instance) {
      AIWidget.instance = new AIWidget();
    }
    return AIWidget.instance;
  }

  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.messages = [];
    this.config = {
      apiEndpoint: 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev/api/agentic',
      position: 'bottom-right',
      primaryColor: '#2A6B52',
      theme: 'light',
      ...window.AIWidgetConfig
    };
  }

  init() {
    this.injectIcons();
    this.createWidget();
    this.bindEvents();
  }

  injectIcons() {
    if (document.getElementById('ai-widget-icons')) return;
    
    const svg = document.createElement('div');
    svg.id = 'ai-widget-icons';
    svg.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <symbol id="ai-icon-mascot" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="mooncakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#D4A574"/>
              <stop offset="100%" stop-color="#8B5A2B"/>
            </linearGradient>
            <linearGradient id="mooncakeInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C4956A"/>
              <stop offset="100%" stop-color="#6B4423"/>
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="32" rx="28" ry="28" fill="url(#mooncakeGrad)"/>
          <ellipse cx="32" cy="32" rx="22" ry="22" fill="url(#mooncakeInner)"/>
          <text x="32" y="41" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#3D2914" font-weight="bold">月</text>
        </symbol>
        <symbol id="ai-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </symbol>
        <symbol id="ai-icon-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </symbol>
        <symbol id="ai-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </symbol>
        <symbol id="ai-icon-minimize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </symbol>
        <symbol id="ai-icon-send" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </symbol>
        <symbol id="ai-icon-settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </symbol>
        <symbol id="ai-icon-spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 70" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </circle>
        </symbol>
        <symbol id="ai-icon-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </symbol>
        <symbol id="ai-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </symbol>
        <symbol id="ai-icon-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </symbol>
        <symbol id="ai-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </symbol>
      </svg>
    `;
    document.body.appendChild(svg);
  }

  icon(name) {
    return `<svg class="icon"><use href="#ai-icon-${name}"></use></svg>`;
  }

  createWidget() {
    const container = document.createElement('div');
    container.id = 'ai-widget';
    container.className = 'ai-widget-container';
    container.innerHTML = `
      <div class="ai-widget-window" id="aiWidgetWindow">
        <div class="ai-widget-header">
          <div class="ai-widget-header-left">
            <svg class="header-avatar"><use href="#ai-icon-mascot"></use></svg>
            <div class="header-info">
              <div class="header-title">Sweet Layers Assistant</div>
              <div class="header-subtitle">AI Powered</div>
            </div>
          </div>
          <div class="ai-widget-header-actions">
            <button class="ai-widget-header-btn" aria-label="Voice">${this.icon('mic')}</button>
            <button class="ai-widget-header-btn" aria-label="Settings">${this.icon('settings')}</button>
            <button class="ai-widget-header-btn" id="aiWidgetClose" aria-label="Close">${this.icon('close')}</button>
          </div>
        </div>
        <div class="ai-widget-messages" id="aiWidgetMessages">
          <div class="ai-widget-message assistant">
            <svg class="ai-widget-message-avatar"><use href="#ai-icon-mascot"></use></svg>
            <div class="ai-widget-message-content">
              <div class="ai-widget-message-bubble">
                Hi! I'm your Sweet Layers assistant. How can I help you today?
              </div>
              <div class="ai-widget-message-time">Just now</div>
            </div>
          </div>
        </div>
        <div class="ai-widget-quick-actions">
          <button class="ai-widget-quick-btn">${this.icon('search')} Browse Cakes</button>
          <button class="ai-widget-quick-btn">${this.icon('cart')} Place Order</button>
          <button class="ai-widget-quick-btn">${this.icon('chat')} Get Help</button>
        </div>
        <div class="ai-widget-input-area">
          <div class="ai-widget-input-wrapper">
            <input type="text" class="ai-widget-input" id="aiWidgetInput" placeholder="Type your message..." maxlength="500">
            <button class="ai-widget-send-btn" id="aiWidgetSend" aria-label="Send">${this.icon('send')}</button>
          </div>
        </div>
      </div>
      <div class="ai-widget-bubble" id="aiWidgetBubble">
        <div class="ai-widget-mascot">
          <svg><use href="#ai-icon-mascot"></use></svg>
          <div class="mood-indicator online"></div>
        </div>
        <div class="ai-widget-status">
          <span class="name">Sweet Layers</span>
          <span class="state">
            <span class="state-dot"></span>
            AI Assistant
          </span>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  bindEvents() {
    const bubble = document.getElementById('aiWidgetBubble');
    const window = document.getElementById('aiWidgetWindow');
    const closeBtn = document.getElementById('aiWidgetClose');
    const input = document.getElementById('aiWidgetInput');
    const sendBtn = document.getElementById('aiWidgetSend');

    bubble.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.toggle());
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    document.querySelectorAll('.ai-widget-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.addMessage(btn.textContent.trim(), 'user');
        this.processMessage(btn.textContent.trim());
      });
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const bubble = document.getElementById('aiWidgetBubble');
    const window = document.getElementById('aiWidgetWindow');
    
    if (this.isOpen) {
      bubble.classList.add('open');
      window.classList.add('open');
      document.getElementById('aiWidgetInput').focus();
    } else {
      bubble.classList.remove('open');
      window.classList.remove('open');
    }
  }

  sendMessage() {
    const input = document.getElementById('aiWidgetInput');
    const message = input.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    input.value = '';
    this.processMessage(message);
  }

  addMessage(text, role) {
    const messages = document.getElementById('aiWidgetMessages');
    const avatar = role === 'user' ? 'user' : 'mascot';
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-widget-message ${role}`;
    msgDiv.innerHTML = `
      <svg class="ai-widget-message-avatar"><use href="#ai-icon-${avatar}"></use></svg>
      <div class="ai-widget-message-content">
        <div class="ai-widget-message-bubble">${this.escapeHtml(text)}</div>
        <div class="ai-widget-message-time">${time}</div>
      </div>
    `;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    this.messages.push({ role, text });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async processMessage(text) {
    this.showTyping();
    
    try {
      const response = await fetch(`${this.config.apiEndpoint}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: this.messages })
      });
      
      const data = await response.json();
      this.hideTyping();
      this.addMessage(data.response || 'Thank you for your message! Our team will get back to you soon.', 'assistant');
    } catch (error) {
      this.hideTyping();
      this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'assistant');
    }
  }

  showTyping() {
    this.isTyping = true;
    const messages = document.getElementById('aiWidgetMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiWidgetTyping';
    typingDiv.className = 'ai-widget-typing';
    typingDiv.innerHTML = `
      <svg class="typing-avatar"><use href="#ai-icon-mascot"></use></svg>
      <div class="ai-widget-typing-bubble">
        <span></span><span></span><span></span>
      </div>
    `;
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  hideTyping() {
    this.isTyping = false;
    const typing = document.getElementById('aiWidgetTyping');
    if (typing) typing.remove();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AIWidget.getInstance().init());
} else {
  AIWidget.getInstance().init();
}