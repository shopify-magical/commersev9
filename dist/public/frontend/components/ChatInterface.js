// Chat Interface Component - Traces API chat data
class ChatInterface {
  constructor(apiClient, elementId) {
    this.api = apiClient;
    this.element = document.getElementById(elementId);
    this.commands = [];
    this.messages = [];
  }

  async init() {
    const response = await this.api.getChatCommands();
    if (response.commands) {
      this.commands = response.commands;
    }
    this.render();
    this.setupEventListeners();
  }

  async sendMessage(message, command = 'help') {
    if (!message.trim()) return;
    
    // Add user message to UI
    this.appendMessage('user', message);
    this.messages.push({ sender: 'user', text: message });

    // Send to API
    const response = await this.api.processChat(message, command);
    
    // Add bot response to UI
    if (response.response) {
      this.appendMessage('bot', response.response);
      this.messages.push({ sender: 'bot', text: response.response });
    }
  }

render() {
    if (!this.element) return;
    
    this.element.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <h3 class="text-sans text-lg font-weight-medium text-muted">💬 Chat Interface</h3>
        </div>
        <div class="chat-commands">
          ${this.commands.map(cmd => 
            `<button class="command-btn text-sm font-weight-medium px-3 py-1.5 rounded-full transition-colors duration-200" data-cmd="${cmd.id}">${cmd.description}</button>`
          ).join('')}
        </div>
        <div class="chat-messages" id="chat-messages-${this.element.id}">
          <div class="message bot">
            <div class="sender font-weight-medium text-primary">System</div>
            <div class="text text-sans text-md">Welcome! I'm your AI assistant. Choose a command or type a message.</div>
          </div>
        </div>
        <div class="chat-input-area">
          <div class="search-bar" role="search" aria-label="Search or send message">
            <svg class="search-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              id="chat-input-${this.element.id}" 
              placeholder="Type a message..." 
              aria-placeholder="Type a message..."
              autocomplete="off"
            >
            <button class="search-clear" aria-label="Clear search">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="search-loading" role="status" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-9.238L18 4"></path>
                <path d="M18.658 15.425a9 9 0 0 1-6.343 2.184"></path>
              </svg>
            </div>
            <button class="search-btn" type="button" aria-label="Send message">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 15 5 8 22 15 21 22 15 22 8 15 15 8 22 15"></polygon>
              </svg>
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.element) return;

    // Command buttons
    const commandBtns = this.element.querySelectorAll('.command-btn');
    commandBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        this.sendMessage(cmd, cmd);
      });
    });

    // Send button
    const sendBtn = this.element.querySelector(`.search-btn`);
    const input = this.element.querySelector(`#chat-input-${this.element.id}`);
    const clearBtn = this.element.querySelector(`.search-clear`);
    
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        if (input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
          input.focus();
        }
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
        }
      });

      // Clear button
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          input.value = '';
          input.focus();
        });
      }

      // Ripple effect on search button
      sendBtn.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = sendBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        sendBtn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    }
  }

  appendMessage(sender, text) {
    const messagesContainer = this.element.querySelector(`#chat-messages-${this.element.id}`);
    if (messagesContainer) {
      messagesContainer.innerHTML += `
        <div class="message ${sender}">
          <div class="sender">${sender === 'user' ? 'You' : 'AI Assistant'}</div>
          <div class="text">${text}</div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  clearMessages() {
    const messagesContainer = this.element.querySelector(`#chat-messages-${this.element.id}`);
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      this.messages = [];
    }
  }

  getMessages() {
    return this.messages;
  }
}
